import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { subscribeToUser } from "../../firebaseConfig";
import {
	setStorageItem,
	getStorageItem,
	removeStorageItem,
	clearStorage,
	STORAGE_KEYS,
} from "../utils/storage";
import {
	showSuccessMessage,
	showErrorNotification,
	showBlockchainError,
	showNetworkError,
	showWarningMessage,
	showInfoMessage,
} from "../utils/errors";
import LoadingSpinner from "../Components/Common/LoadingSpinner";
import { useWallet } from "../providers/WalletProvider";

// Update API URL to use the correct base URL for users
const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";
const USERS_API_URL = `${API_URL}/users`;

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.headers.common["Content-Type"] = "application/json";

// Update network mapping object at the top of the file, after imports
const NETWORK_NAMES = {
	1: "Ethereum",
	5: "Goerli",
	11155111: "Sepolia",
	80001: "Mumbai",
	137: "Polygon",
	42161: "Arbitrum",
	10: "Optimism",
	56: "BSC",
	97: "BSC Testnet",
	43114: "Avalanche",
	43113: "Fuji",
	1337: "Local",
	31337: "Hardhat",
	1402: "zkEVM",
	1101: "Polygon zkEVM",
	534353: "Scroll",
	534351: "Scroll Alpha",
	421613: "Arbitrum Goerli",
	421614: "Arbitrum Sepolia",
	80002: "Polygon Amoy Testnet",
};

// Helper function to get network name from chainId
const getNetworkName = (chainId) => {
	if (!chainId) return "Unknown";

	// Handle BigInt chainId (ethers v6)
	if (typeof chainId === "bigint") {
		chainId = Number(chainId);
	}

	// Convert string chainId to number if needed
	if (typeof chainId === "string") {
		// Handle hex string (with or without 0x prefix)
		if (chainId.startsWith("0x")) {
			chainId = parseInt(chainId, 16);
		} else {
			chainId = parseInt(chainId, 10);
		}
	}

	return NETWORK_NAMES[chainId] || `Chain ${chainId}`;
};

// Define connection states as constants
export const CONNECTION_STATES = {
	INITIALIZING: "initializing",
	CONNECTING: "connecting",
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	NO_PROVIDER: "no_provider",
	ERROR: "error",
};

// Define user states
export const USER_STATES = {
	NO_WALLET: "no_wallet",
	NO_PROFILE: "no_profile",
	HAS_PROFILE: "has_profile",
	ERROR: "error",
};

// Add this near the top with other state constants
const AUTH_COOLDOWN = 5000; // 5 seconds cooldown between auth attempts
const MAX_AUTH_RETRIES = 3; // Maximum number of authentication retries

export const AccountContext = createContext();

// Add debug logging helper
const logStateTransition = (action, prevState, nextState) => {
	if (import.meta.env.DEV) {
		const hasStateChanged =
			prevState.connectionState !== nextState.connectionState ||
			prevState.userState !== nextState.userState ||
			!!prevState.token !== !!nextState.token ||
			!!prevState.user !== !!nextState.user;

		if (hasStateChanged) {
			console.log(`🔄 [${action}]`, {
				connection: `${prevState.connectionState} → ${nextState.connectionState}`,
				user: `${prevState.userState} → ${nextState.userState}`,
				auth: `${!!prevState.token} → ${!!nextState.token}`,
			});
		}
	}
};

const logTokenDetails = (token, source) => {
	if (!import.meta.env.DEV || !token) return;

	try {
		const parts = token.split(".");
		if (parts.length !== 3) return;

		const payload = JSON.parse(atob(parts[1]));
		console.log(`🔑 [${source}]`, {
			exp: new Date(payload.exp * 1000).toLocaleString(),
			walletAddress: payload.walletAddress || payload.sub,
		});
	} catch (error) {
		// Silent fail in production
	}
};

export const AccountProvider = ({ children }) => {
	const navigate = useNavigate();
	const { walletKit, isInitialized, connect, disconnect } = useWallet();
	const [state, setState] = useState({
		connectionState: CONNECTION_STATES.INITIALIZING,
		userState: USER_STATES.NO_WALLET,
		walletAddress: null,
		networkName: null,
		chainId: null,
		balance: null,
		user: null,
		token: null,
		errorMessage: null,
		isAccountInitialized: false,
		hasStoredToken: false,
		hasStoredUser: false,
		lastAuthAttempt: 0,
		authRetries: 0,
		isConnecting: false,
		loading: true,
		prevConnectionState: null, // Track previous state for debouncing
		isCheckingProvider: false,
	});

	const hasInitializedRef = useRef(false);
	const stateChangeTimeoutRef = useRef(null);
	const authRequestCache = useRef(new Map());
	const lastAuthRequestTime = useRef(0);
	const AUTH_REQUEST_THROTTLE_MS = 5000; // 5 seconds between requests for same wallet
	const isConnectingRef = useRef(false);
	const lastAuthRequestRef = useRef(null);
	const authRequestTimeoutRef = useRef(null);
	const pendingRequestRef = useRef(null);
	const profileTimeoutRef = useRef(null);
	const connectionTimeoutRef = useRef(null);
	const authTimeoutRef = useRef(null);
	const lastPathRef = useRef(null);

	// Memoize state updates to prevent unnecessary re-renders
	const updateState = useCallback((newState) => {
		setState((prev) => ({ ...prev, ...newState }));
	}, []);

	// Add cleanup for timeouts when component unmounts
	useEffect(() => {
		return () => {
			if (stateChangeTimeoutRef.current) {
				clearTimeout(stateChangeTimeoutRef.current);
			}
			if (authRequestTimeoutRef.current) {
				clearTimeout(authRequestTimeoutRef.current);
			}
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current);
			}
			if (authTimeoutRef.current) {
				clearTimeout(authTimeoutRef.current);
			}
			if (profileTimeoutRef.current) {
				clearTimeout(profileTimeoutRef.current);
			}
		};
	}, []);

	// Define clearUserData without dependencies
	const clearUserData = () => {
		localStorage.removeItem(STORAGE_KEYS.token);
		localStorage.removeItem(STORAGE_KEYS.USER);
		localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
	};

	// Setup axios interceptors for authentication
	const setupAxiosInterceptors = useCallback((token) => {
		try {
			// Clear any existing interceptors
			if (axios.interceptors) {
				// Handle case where handlers might not exist yet
				try {
					if (
						axios.interceptors.request.handlers &&
						axios.interceptors.request.handlers.length > 0
					) {
						axios.interceptors.request.handlers.forEach((handler) => {
							if (handler && handler.id) {
								axios.interceptors.request.eject(handler.id);
							}
						});
					}
				} catch (e) {
					console.error("Error clearing request interceptors:", e);
				}

				try {
					if (
						axios.interceptors.response.handlers &&
						axios.interceptors.response.handlers.length > 0
					) {
						axios.interceptors.response.handlers.forEach((handler) => {
							if (handler && handler.id) {
								axios.interceptors.response.eject(handler.id);
							}
						});
					}
				} catch (e) {
					console.error("Error clearing response interceptors:", e);
				}
			}

			// Configure request interceptor to add Authorization header
			axios.interceptors.request.use(
				(config) => {
					// Clone config to avoid mutation
					const newConfig = { ...config };

					// Don't add token to requests to external domains
					const isApiRequest =
						!newConfig.url.startsWith("http") ||
						newConfig.url.includes(API_URL);

					if (token && isApiRequest) {
						// Ensure headers object exists
						newConfig.headers = newConfig.headers || {};
						newConfig.headers.Authorization = `Bearer ${token}`;
					}
					return newConfig;
				},
				(error) => Promise.reject(error)
			);

			// Configure response interceptor for error handling
			axios.interceptors.response.use(
				(response) => response,
				(error) => {
					// Handle 401 Unauthorized errors
					if (error.response?.status === 401) {
						console.log("Unauthorized API request, clearing credentials");
						clearUserData();

						// Dispatch event to notify app of disconnection
						window.dispatchEvent(new Event("walletDisconnected"));
					}

					return Promise.reject(error);
				}
			);

			// Set default Authorization header for new requests
			if (token) {
				axios.defaults.headers.common.Authorization = `Bearer ${token}`;
				console.log("🔍 Authorization header set");
			} else {
				delete axios.defaults.headers.common.Authorization;
				console.log("🔍 Authorization header cleared");
			}

			console.log("🔍 Axios interceptors configured", { hasToken: !!token });
		} catch (error) {
			console.error("Error setting up axios interceptors:", error);
		}
	}, []);

	// Update the initializeFromStorage function to properly set hasInitializedRef
	useEffect(() => {
		const initializeFromStorage = async () => {
			console.log(
				"🔍 Initialize from storage started, hasInitializedRef:",
				hasInitializedRef.current
			);

			// If already initialized, log a warning and skip
			if (hasInitializedRef.current) {
				console.warn("⚠️ Already initialized, skipping initialization");
				return;
			}

			// Get stored credentials from localStorage
			const storedToken = localStorage.getItem(STORAGE_KEYS.token);
			const storedUserString = localStorage.getItem(STORAGE_KEYS.USER);
			const storedWalletAddress = localStorage.getItem(
				STORAGE_KEYS.WALLET_ADDRESS
			);

			// Log retrieved token
			logTokenDetails(storedToken, "localStorage");

			// Check if we have complete credentials
			const hasCompleteStoredCredentials =
				storedToken && storedUserString && storedWalletAddress;

			console.log(
				"🔍",
				hasCompleteStoredCredentials
					? "Complete stored credentials found"
					: "No complete stored credentials found"
			);

			// Set initialized ref to true BEFORE any async operations
			hasInitializedRef.current = true;

			// If no stored credentials, set disconnected state immediately
			if (!hasCompleteStoredCredentials) {
				console.log("🔍 No complete stored credentials found");
				updateState({
					connectionState: CONNECTION_STATES.DISCONNECTED,
					userState: USER_STATES.NO_WALLET,
					isAccountInitialized: true,
					loading: false,
				});
			} else {
				// We have complete credentials - parse user and set up
				try {
					console.log(
						"🔍 Complete stored credentials found, setting up authenticated state"
					);
					const storedUser = JSON.parse(storedUserString);

					// Set axios authorization header
					axios.defaults.headers.common[
						"Authorization"
					] = `Bearer ${storedToken}`;

					// Update state with stored values
					updateState({
						connectionState: CONNECTION_STATES.CONNECTED,
						userState: USER_STATES.HAS_PROFILE,
						walletAddress: storedWalletAddress,
						token: storedToken,
						user: storedUser,
						isAccountInitialized: true,
						loading: false,
					});
				} catch (error) {
					console.error("❌ Error parsing stored user data:", error);

					// Set fallback state on error
					updateState({
						connectionState: CONNECTION_STATES.DISCONNECTED,
						userState: USER_STATES.NO_WALLET,
						isAccountInitialized: true,
						loading: false,
					});
				}
			}

			// Continue with provider check
			try {
				console.log("🔍 Checking Web3 provider after initialization");
				await checkWeb3Provider();
			} catch (error) {
				console.error("❌ Error in provider check:", error);
			}
		};

		// Run initialization
		initializeFromStorage();
	}, []);

	// Listen for account changes in MetaMask
	useEffect(() => {
		if (typeof window.ethereum !== "undefined") {
			const handleAccountsChanged = async (accounts) => {
				if (accounts.length === 0) {
					// User disconnected their wallet
					clearUserData();
					updateState((prev) => ({
						...prev,
						connectionState: CONNECTION_STATES.DISCONNECTED,
						userState: USER_STATES.NO_WALLET,
						walletAddress: null,
						token: null,
						user: null,
					}));
				} else if (accounts[0] !== state.walletAddress) {
					console.log(
						"Account changed, getting new wallet address:",
						accounts[0]
					);
					const newWalletAddress = accounts[0].toLowerCase();

					// Update wallet address in state
					updateState((prev) => ({
						...prev,
						walletAddress: newWalletAddress,
						connectionState: CONNECTION_STATES.CONNECTED,
					}));

					// Re-authenticate with the new wallet address
					try {
						const result = await authenticateWithWallet(newWalletAddress);
						console.log("Re-authentication result:", result);

						if (result?.success && result?.token) {
							// Authentication successful, update state with token and user
							updateState((prev) => ({
								...prev,
								token: result.token,
								user: result.user,
								userState: USER_STATES.HAS_PROFILE,
								connectionState: CONNECTION_STATES.CONNECTED,
							}));
						}
					} catch (error) {
						console.error(
							"Error re-authenticating after account change:",
							error
						);
					}
				}
			};

			window.ethereum.on("accountsChanged", handleAccountsChanged);

			// Clean up event listener
			return () => {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
			};
		}
	}, [state.walletAddress]);

	// Setup axios interceptors when token changes
	useEffect(() => {
		if (state.token) {
			setupAxiosInterceptors(state.token);
			console.log(
				"🔍 Setting up axios interceptors with token:",
				state.token.substring(0, 15) + "..."
			);
		} else {
			setupAxiosInterceptors(null);
			console.log("🔍 Clearing axios interceptors (no token)");
		}
	}, [state.token, setupAxiosInterceptors]);

	// Enhanced createProvider function with better error handling and provider detection
	const createProvider = async () => {
		console.log("🔍 Creating provider...");

		try {
			// Check if we're in a browser environment
			if (typeof window === "undefined" || !window.ethereum) {
				console.log("❌ No ethereum object available");
				return null;
			}

			// First try ethers v6 BrowserProvider
			try {
				const provider = new ethers.BrowserProvider(window.ethereum);
				console.log("🔍 Using ethers v6 BrowserProvider");

				// Test provider methods
				const hasGetSigner = typeof provider.getSigner === "function";
				const hasNetwork = !!provider.network;
				const hasGetNetwork = typeof provider.getNetwork === "function";

				console.log("🔍 Provider methods:", {
					hasGetSigner,
					hasNetwork,
					hasGetNetwork,
				});

				return provider;
			} catch (err) {
				console.warn(
					"⚠️ Failed to create ethers v6 BrowserProvider:",
					err.message
				);

				// Fall back to ethers v5 Web3Provider if available
				try {
					// Some environments might have a different version of ethers
					const provider = new ethers.providers.Web3Provider(window.ethereum);
					console.log("🔍 Using ethers v5 Web3Provider fallback");
					return provider;
				} catch (fallbackErr) {
					console.warn(
						"⚠️ Failed to create ethers v5 fallback provider:",
						fallbackErr.message
					);

					// Last resort: return a minimal wrapper around window.ethereum
					if (
						window.ethereum &&
						typeof window.ethereum.request === "function"
					) {
						console.log("🔍 Using minimal ethereum provider wrapper");

						// Return a minimal provider with the necessary methods
						return {
							request: window.ethereum.request.bind(window.ethereum),
							// Add minimal methods needed
							getNetwork: async () => {
								try {
									const chainIdHex = await window.ethereum.request({
										method: "eth_chainId",
									});
									return { chainId: parseInt(chainIdHex, 16) };
								} catch (e) {
									return { chainId: 0 };
								}
							},
							getBalance: async (address) => {
								try {
									const balanceHex = await window.ethereum.request({
										method: "eth_getBalance",
										params: [address, "latest"],
									});
									return BigInt(balanceHex);
								} catch (e) {
									return BigInt(0);
								}
							},
							getSigner: async () => {
								const accounts = await window.ethereum.request({
									method: "eth_accounts",
								});
								if (!accounts || accounts.length === 0) {
									throw new Error("No accounts available");
								}
								return {
									getAddress: async () => accounts[0],
									signMessage: async (message) => {
										return window.ethereum.request({
											method: "personal_sign",
											params: [message, accounts[0]],
										});
									},
								};
							},
						};
					}
				}
			}

			console.error("❌ Failed to create any type of provider");
			return null;
		} catch (error) {
			console.error("❌ Error creating provider:", error);
			return null;
		}
	};

	// Format ether safely
	const formatEtherSafe = (value) => {
		try {
			if (ethers.formatEther) {
				// ethers v6
				return ethers.formatEther(value);
			} else {
				console.log("⚠️ No formatEther found, using default");
				return "0.0";
			}
		} catch (error) {
			console.error("❌ Error formatting ether:", error);
			return "0.0";
		}
	};

	// Get accounts safely
	const getAccounts = async (provider) => {
		try {
			console.log("🔍 Getting accounts from provider...");
			if (provider.listAccounts) {
				// ethers v5
				return await provider.listAccounts();
			} else if (provider.getAccounts) {
				// ethers v6
				return await provider.getAccounts();
			} else {
				// Fallback
				return await window.ethereum.request({ method: "eth_accounts" });
			}
		} catch (error) {
			console.error("❌ Error getting accounts:", error);
			throw new Error("Failed to get wallet accounts: " + error.message);
		}
	};

	// Helper function to lookup ENS name
	const lookupENSName = async (provider, address) => {
		try {
			if (provider && provider.lookupAddress) {
				return await provider.lookupAddress(address);
			}
			return null;
		} catch (error) {
			console.log("Error looking up ENS name:", error);
			return null;
		}
	};

	// Fix the authenticateWithWallet function
	const authenticateWithWallet = async (walletAddress) => {
		try {
			const normalizedWalletAddress = walletAddress.toLowerCase();
			const now = Date.now();

			// Check cache first
			const cachedResult = authRequestCache.current.get(
				normalizedWalletAddress
			);
			if (
				cachedResult &&
				now - cachedResult.timestamp < AUTH_REQUEST_THROTTLE_MS
			) {
				console.log(
					"Using cached authentication result for:",
					normalizedWalletAddress
				);
				return cachedResult.data;
			}

			// Check if we're throttled
			if (now - lastAuthRequestTime.current < AUTH_REQUEST_THROTTLE_MS) {
				console.log(
					"Authentication request throttled for:",
					normalizedWalletAddress
				);
				return (
					cachedResult?.data || { success: false, error: "Request throttled" }
				);
			}

			console.log("🔐 Authenticating with wallet:", normalizedWalletAddress);
			lastAuthRequestTime.current = now;

			try {
				// Call the wallet-auth endpoint
				const authResponse = await axios.post(
					`${import.meta.env.VITE_PUBLIC_API_URL}/users/wallet-auth`,
					{
						walletAddress: normalizedWalletAddress,
					}
				);

				console.log("Wallet authentication response:", {
					success: authResponse.data?.success,
					hasToken: !!authResponse.data?.data?.token,
					hasUser: !!authResponse.data?.data?.user,
					exists: authResponse.data?.exists,
					rawResponse: authResponse.data,
				});

				let result;
				if (authResponse.data?.success) {
					// Extract token and user data from response
					const token =
						authResponse.data?.data?.token || authResponse.data?.token;
					const user = authResponse.data?.data?.user || authResponse.data?.user;

					if (token) {
						// Store token and wallet address
						console.log(
							"Storing token in localStorage:",
							token.substring(0, 20) + "..."
						);
						localStorage.setItem(STORAGE_KEYS.token, token);
						localStorage.setItem(
							STORAGE_KEYS.WALLET_ADDRESS,
							normalizedWalletAddress
						);

						// Set axios authorization header
						setupAxiosInterceptors(token);

						// Store user data if provided
						if (user) {
							console.log("Storing user data in localStorage");
							localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
						}

						// Log token for debugging
						logTokenDetails(token, "authenticateWithWallet");

						// Update state with token and user data
						updateState({
							token,
							user,
							walletAddress: normalizedWalletAddress,
							connectionState: CONNECTION_STATES.CONNECTED,
							userState: USER_STATES.HAS_PROFILE,
							isAccountInitialized: true,
							loading: false,
						});

						result = {
							success: true,
							token,
							user,
							walletAddress: normalizedWalletAddress,
							exists: true,
						};
					} else {
						console.error(
							"Token missing in successful response:",
							authResponse.data
						);
						result = { success: false, error: "No token received" };
					}
				} else {
					// Handle case where user exists but needs profile
					if (authResponse.data?.exists === true) {
						result = {
							success: false,
							exists: true,
							needsProfile: true,
							walletAddress: normalizedWalletAddress,
						};
					} else {
						// User doesn't exist
						result = {
							success: false,
							exists: false,
							needsProfile: true,
							walletAddress: normalizedWalletAddress,
						};
					}

					// Update state for profile needed
					updateState({
						walletAddress: normalizedWalletAddress,
						connectionState: CONNECTION_STATES.CONNECTED,
						userState: USER_STATES.NO_PROFILE,
						isAccountInitialized: true,
						loading: false,
					});
				}

				// Cache the result
				authRequestCache.current.set(normalizedWalletAddress, {
					data: result,
					timestamp: now,
				});

				return result;
			} catch (error) {
				if (error.response?.status === 404) {
					// User not found - needs to create profile
					const result = {
						success: false,
						exists: false,
						needsProfile: true,
						walletAddress: normalizedWalletAddress,
					};

					// Update state for new user
					updateState({
						walletAddress: normalizedWalletAddress,
						connectionState: CONNECTION_STATES.CONNECTED,
						userState: USER_STATES.NO_PROFILE,
						isAccountInitialized: true,
						loading: false,
					});

					// Cache the result
					authRequestCache.current.set(normalizedWalletAddress, {
						data: result,
						timestamp: now,
					});

					return result;
				}

				throw error; // Re-throw other errors
			}
		} catch (error) {
			console.error("Error authenticating with wallet:", error);

			// Handle specific error cases
			if (error.response?.status === 401) {
				return {
					success: false,
					error: "Unauthorized",
					walletAddress: walletAddress.toLowerCase(),
				};
			}

			if (error.response?.status === 429) {
				return {
					success: false,
					error: "Too many requests. Please try again later.",
					walletAddress: walletAddress.toLowerCase(),
				};
			}

			return {
				success: false,
				error: error.message || "Authentication failed",
				walletAddress: walletAddress.toLowerCase(),
			};
		}
	};

	// Helper function to check for stored credentials
	const checkForStoredCredentials = async () => {
		try {
			const token = getStorageItem(STORAGE_KEYS.token);
			const user = getStorageItem(STORAGE_KEYS.USER);
			const walletAddress = getStorageItem(STORAGE_KEYS.WALLET_ADDRESS);

			console.log("Checking stored credentials:", {
				hasToken: !!token,
				hasUser: !!user,
				hasWalletAddress: !!walletAddress,
			});

			// Return credentials if all are present
			if (token && user && walletAddress) {
				return { token, user, walletAddress };
			}
			return null;
		} catch (error) {
			console.error("Error checking stored credentials:", error);
			return null;
		}
	};

	// Update checkWeb3Provider function to handle loading state correctly and implement debouncing
	const checkWeb3Provider = useCallback(async () => {
		console.log("🔍 checkWeb3Provider - Checking Web3 provider status");

		// Set a flag to track if we're already checking to prevent duplicate checks
		if (state.isCheckingProvider) {
			console.log("⚠️ Already checking provider, skipping duplicate check");
			return;
		}

		try {
			// Set loading and checking flags
			updateState({
				loading: true,
				isCheckingProvider: true,
			});

			// Step 1: Check for stored credentials first
			const storedToken = localStorage.getItem(STORAGE_KEYS.token);
			const storedUserStr = localStorage.getItem(STORAGE_KEYS.USER);
			const storedWallet = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);

			// Log token if available
			if (storedToken) {
				console.log("🔑 Found token in localStorage");
				logTokenDetails(storedToken, "checkWeb3Provider");

				// Always set up axios with token
				setupAxiosInterceptors(storedToken);

				// If we have complete credentials, set state and return early
				if (storedUserStr && storedWallet) {
					try {
						const storedUser = JSON.parse(storedUserStr);

						// Use setTimeout to debounce the state update
						if (stateChangeTimeoutRef.current) {
							clearTimeout(stateChangeTimeoutRef.current);
						}

						stateChangeTimeoutRef.current = setTimeout(() => {
							updateState({
								token: storedToken,
								walletAddress: storedWallet.toLowerCase(),
								user: storedUser,
								connectionState: CONNECTION_STATES.CONNECTED,
								userState: USER_STATES.HAS_PROFILE,
								isAccountInitialized: true,
								loading: false,
								isCheckingProvider: false,
							});
							console.log("✅ Restored user state from localStorage");
						}, 500); // 500ms debounce

						return true;
					} catch (e) {
						console.error("Error parsing stored user:", e);
					}
				}
			}

			// Step 2: Check for Web3 provider
			if (!window.ethereum) {
				console.log("❌ No Web3 provider found");
				updateState({
					connectionState: CONNECTION_STATES.NO_PROVIDER,
					userState: USER_STATES.NO_WALLET,
					isAccountInitialized: true,
					loading: false,
					isCheckingProvider: false,
				});
				return false;
			}

			// Step 3: Check for connected accounts without prompting
			let accounts;
			try {
				accounts = await window.ethereum.request({ method: "eth_accounts" });
			} catch (error) {
				console.error("Error checking accounts:", error);
				updateState({
					connectionState: CONNECTION_STATES.DISCONNECTED,
					userState: USER_STATES.NO_WALLET,
					isAccountInitialized: true,
					loading: false,
					isCheckingProvider: false,
				});
				return false;
			}

			// Step 4: Check if accounts are available
			if (!accounts || accounts.length === 0) {
				console.log("❌ No connected accounts found");
				updateState({
					connectionState: CONNECTION_STATES.DISCONNECTED,
					userState: USER_STATES.NO_WALLET,
					isAccountInitialized: true,
					loading: false,
					isCheckingProvider: false,
				});
				return false;
			}

			// Step 5: We have a connected account!
			const account = accounts[0].toLowerCase();
			console.log("✅ Found connected account:", account);

			// Update state with connected wallet - debounce this update
			if (stateChangeTimeoutRef.current) {
				clearTimeout(stateChangeTimeoutRef.current);
			}

			stateChangeTimeoutRef.current = setTimeout(() => {
				updateState({
					walletAddress: account,
					connectionState: CONNECTION_STATES.CONNECTED,
				});
			}, 300); // 300ms debounce

			// Step 6: Check for token or authenticate
			if (storedToken) {
				try {
					console.log("🔑 Found token, checking if it's valid for this wallet");
					const response = await axios.get(
						`${USERS_API_URL}/profile/${account}`
					);

					if (response.data?.success && response.data?.user) {
						const userData = response.data.user;
						localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
						localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, account);

						// Debounce the state update
						if (stateChangeTimeoutRef.current) {
							clearTimeout(stateChangeTimeoutRef.current);
						}

						stateChangeTimeoutRef.current = setTimeout(() => {
							updateState({
								token: storedToken,
								user: userData,
								userState: USER_STATES.HAS_PROFILE,
								isAccountInitialized: true,
								loading: false,
								isCheckingProvider: false,
							});
							console.log("✅ Authenticated with stored token");
						}, 500); // 500ms debounce

						return true;
					}
				} catch (e) {
					console.error("Error fetching user data:", e);
					// Token might be invalid, clear and re-authenticate
					clearStorage();
				}
			}

			// Step 7: No valid token, try to authenticate
			try {
				console.log("🔄 Attempting wallet authentication");
				const result = await authenticateWithWallet(account);

				if (result?.success && result?.token) {
					console.log("✅ Authentication successful");

					// Debounce the state update
					if (stateChangeTimeoutRef.current) {
						clearTimeout(stateChangeTimeoutRef.current);
					}

					stateChangeTimeoutRef.current = setTimeout(() => {
						updateState({
							token: result.token,
							user: result.user,
							userState: USER_STATES.HAS_PROFILE,
							isAccountInitialized: true,
							loading: false,
							isCheckingProvider: false,
						});
					}, 500); // 500ms debounce

					return true;
				} else {
					console.log("⚠️ Authentication result:", result);

					// Debounce the state update
					if (stateChangeTimeoutRef.current) {
						clearTimeout(stateChangeTimeoutRef.current);
					}

					stateChangeTimeoutRef.current = setTimeout(() => {
						updateState({
							userState: result?.needsProfile
								? USER_STATES.NO_PROFILE
								: USER_STATES.NO_WALLET,
							isAccountInitialized: true,
							loading: false,
							isCheckingProvider: false,
						});
					}, 500); // 500ms debounce

					return false;
				}
			} catch (error) {
				console.error("Authentication error:", error);
				// Check if the error is a rate limit or server error
				if (error.response?.status === 429 || error.response?.status >= 500) {
					updateState({
						connectionState: CONNECTION_STATES.CONNECTED,
						userState: USER_STATES.NO_PROFILE, // Set to NO_PROFILE instead of ERROR
						errorMessage:
							"Server temporarily unavailable. Please try again later.",
						isAccountInitialized: true,
						isConnecting: false,
					});
				} else {
					updateState({
						connectionState: CONNECTION_STATES.ERROR,
						userState: USER_STATES.ERROR,
						errorMessage: error.message || "Authentication failed",
						isAccountInitialized: true,
						isConnecting: false,
					});
				}

				return {
					success: false,
					error: error.message || "Authentication failed",
				};
			}
		} catch (error) {
			console.error("Unexpected error in checkWeb3Provider:", error);
			updateState({
				connectionState: CONNECTION_STATES.DISCONNECTED,
				userState: USER_STATES.NO_WALLET,
				isAccountInitialized: true,
				loading: false,
				isCheckingProvider: false,
				errorMessage: error.message,
			});
			return false;
		}
	}, [setupAxiosInterceptors, authenticateWithWallet]);

	// Helper function to get network info
	const getNetworkInfo = async (provider) => {
		try {
			if (provider.getNetwork) {
				return await provider.getNetwork();
			} else if (provider.network) {
				return await provider.network;
			} else {
				const chainIdHex = await window.ethereum.request({
					method: "eth_chainId",
				});
				return { chainId: parseInt(chainIdHex, 16) };
			}
		} catch (error) {
			console.error("❌ Error getting network info:", error);
			return { chainId: 0 };
		}
	};

	// Helper function to get balance
	const getBalance = async (provider, address) => {
		try {
			if (provider.getBalance) {
				return await provider.getBalance(address);
			} else {
				return 0;
			}
		} catch (error) {
			console.error("❌ Error getting balance:", error);
			return 0;
		}
	};

	// Helper function to safely get account address
	const getAccountAddress = (accounts) => {
		if (!accounts || accounts.length === 0) {
			console.log("❌ No accounts available");
			return null;
		}

		try {
			// Safely handle various account formats
			const account = accounts[0];
			// Check if it's a string (from some wallet providers)
			if (typeof account === "string") {
				return account.toLowerCase();
			}
			// Check if it's an object with address property (from some wallet providers)
			else if (account && typeof account === "object" && account.address) {
				return account.address.toLowerCase();
			}
			// Handle other unexpected formats
			else {
				console.log("ℹ️ Account is in unexpected format:", account);
				return String(account).toLowerCase(); // Try to convert to string
			}
		} catch (error) {
			console.error("❌ Error processing account address:", error);
			console.log("🔍 Account value:", accounts[0]);
			return null;
		}
	};

	// Proper logout function
	const logout = useCallback(() => {
		console.log("🔓 Logging out user and clearing all credentials");

		// Clear all stored credentials
		localStorage.removeItem(STORAGE_KEYS.token);
		localStorage.removeItem(STORAGE_KEYS.USER);
		localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);

		// Reset axios headers
		axios.defaults.headers.common["Authorization"] = "";

		// Reset all state
		updateState({
			walletAddress: null,
			user: null,
			token: null,
			connectionState: CONNECTION_STATES.DISCONNECTED,
			userState: USER_STATES.NO_WALLET,
			errorMessage: null,
			isConnecting: false,
		});

		// Navigate to connect page
		window.location.href = "/connect";
	}, []);

	// Simplified connectWallet function using RainbowKit
	const connectWallet = useCallback(async () => {
		if (!isInitialized || !walletKit) {
			console.error("Wallet not initialized");
			return;
		}

		try {
			isConnectingRef.current = true;
			updateState({ isConnecting: true });

			// Connect using WalletKit
			const result = await connect();
			if (!result) {
				throw new Error("Failed to connect wallet");
			}

			// Get the wallet address from the result
			const walletAddress = result.address;
			if (!walletAddress) {
				throw new Error("No wallet address received");
			}

			// Authenticate with backend
			await authenticateWithWallet(walletAddress);
		} catch (error) {
			console.error("Error connecting wallet:", error);
			updateState({
				errorMessage: error.message,
				connectionState: CONNECTION_STATES.ERROR,
				userState: USER_STATES.NO_WALLET,
			});
		} finally {
			isConnectingRef.current = false;
			updateState({ isConnecting: false });
		}
	}, [connect, isInitialized, walletKit, updateState]);

	// Disconnect handler
	const disconnectWallet = useCallback(async () => {
		try {
			await disconnect();
			updateState({
				walletAddress: null,
				user: null,
				token: null,
				connectionState: CONNECTION_STATES.DISCONNECTED,
				userState: USER_STATES.NO_WALLET,
			});
			clearUserData();
		} catch (error) {
			console.error("Error disconnecting wallet:", error);
		}
	}, [disconnect, updateState]);

	// Update the autoAuthenticate function to handle stored data better
	useEffect(() => {
		const autoAuthenticate = async () => {
			console.log("🔄 Running auto-authentication check");

			try {
				// IMPORTANT: First check localStorage directly for most reliable state
				const storedToken = localStorage.getItem(STORAGE_KEYS.token);
				const storedUserString = localStorage.getItem(STORAGE_KEYS.USER);
				const storedWalletAddress = localStorage.getItem(
					STORAGE_KEYS.WALLET_ADDRESS
				);

				// Check if we have complete stored authentication info
				const hasCompleteStoredAuth =
					storedToken && storedUserString && storedWalletAddress;

				if (hasCompleteStoredAuth) {
					console.log("💾 Found complete stored authentication data");

					try {
						// Try to parse the user data
						const storedUser = JSON.parse(storedUserString);

						// Set the auth state from storage immediately
						updateState({
							token: storedToken,
							walletAddress: storedWalletAddress.toLowerCase(),
							user: storedUser,
							connectionState: CONNECTION_STATES.CONNECTED,
							userState: USER_STATES.HAS_PROFILE,
							isAccountInitialized: true,
							errorMessage: null,
						});

						// Also make sure axios is configured properly
						setupAxiosInterceptors(storedToken);

						// Check current path and redirect if necessary
						const currentPath = window.location.pathname;
						if (
							currentPath === "/profile-setup" ||
							currentPath === "/connect"
						) {
							console.log(
								"🔄 Redirecting from",
								currentPath,
								"to dashboard based on stored auth"
							);
							setTimeout(() => {
								window.location.href = "/dashboard";
							}, 200);
						}

						return true;
					} catch (error) {
						console.error("❌ Error parsing stored user data:", error);
						// Continue with normal flow
					}
				}

				// Only proceed with wallet check if we don't have complete stored auth
				// or if we're connected but have no token
				if (
					!hasCompleteStoredAuth &&
					state.connectionState === CONNECTION_STATES.CONNECTED &&
					state.walletAddress &&
					!state.token
				) {
					console.log(
						"🔍 Connected wallet without token, attempting auto-authentication"
					);

					// Get the wallet address from state
					const walletAddress = state.walletAddress;

					// Directly try to authenticate with the wallet address
					try {
						console.log(
							"Auto-authenticating with wallet address:",
							walletAddress
						);
						const result = await authenticateWithWallet(walletAddress);

						if (result?.success && result?.token) {
							console.log("Auto-authentication successful, token acquired");

							// Update state with authentication results
							updateState({
								token: result.token,
								user: result.user,
								userState: USER_STATES.HAS_PROFILE,
								connectionState: CONNECTION_STATES.CONNECTED,
								isAccountInitialized: true,
							});

							return true;
						} else {
							console.log(
								"Auto-authentication response without token:",
								result
							);
						}
					} catch (error) {
						console.error("Error during auto-authentication:", error);
					}

					// Fall back to connect wallet if direct authentication fails
					try {
						const result = await connectWallet();
						console.log("🔄 Auto-authentication connect result:", result);
						return result.success;
					} catch (error) {
						console.error("❌ Auto-authentication connectWallet error:", error);
						return false;
					}
				} else {
					// Already have token or not connected
					if (state.token) {
						console.log(
							"✅ Auto-authentication skipped: Already authenticated"
						);
					} else if (state.connectionState !== CONNECTION_STATES.CONNECTED) {
						console.log("ℹ️ Auto-authentication skipped: Not connected");
					}
					return false;
				}
			} catch (error) {
				console.error("❌ Error in autoAuthenticate:", error);
				return false;
			}
		};

		// Run auto-authentication on initial render and when authentication state changes
		autoAuthenticate();
	}, [
		state.connectionState,
		state.walletAddress,
		state.token,
		state.lastAuthAttempt,
		state.authRetries,
	]);

	// Helper function to check current state and redirect if needed
	const checkStateAndRedirect = () => {
		// Ensure we're running in a client environment
		if (typeof window === "undefined") return;

		// Get current location
		const currentPath = window.location.pathname;

		// Get stored values for quick checks
		const storedToken = localStorage.getItem(STORAGE_KEYS.token);
		const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
		const storedWallet = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);

		console.log("🚦 State check:", {
			currentPath,
			hasToken: !!storedToken,
			hasUser: !!storedUser,
			hasWallet: !!storedWallet,
			connectionState: state.connectionState,
			userState: state.userState,
		});

		// Determine authentication status
		const hasStoredAuth = storedToken && storedUser && storedWallet;
		const hasStateAuth = state.token && state.user && state.walletAddress;
		const isFullyAuthenticated = hasStoredAuth || hasStateAuth;

		// Redirect from profile setup if user has profile
		if (currentPath === "/profile-setup" && isFullyAuthenticated) {
			console.log("⚡ Profile setup redirect triggered - user has profile");
			// Use setTimeout to avoid immediate redirect that might get caught in render cycle
			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 100);
			return;
		}

		// Redirect from connect page if user is already connected
		if (currentPath === "/connect" && isFullyAuthenticated) {
			console.log("⚡ Connect page redirect triggered - already authenticated");
			// Use setTimeout to avoid immediate redirect that might get caught in render cycle
			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 100);
			return;
		}
	};

	// Call this function after state changes - add to useEffect after state transitions
	useEffect(() => {
		// Run state check on every significant state change
		checkStateAndRedirect();
	}, [
		state.connectionState,
		state.userState,
		state.walletAddress,
		state.token,
		state.user,
	]);

	// Add wallet disconnection listener
	useEffect(() => {
		if (window.ethereum) {
			const handleAccountsChanged = (accounts) => {
				if (!accounts || accounts.length === 0) {
					console.log("⚠️ Wallet disconnected, logging out");
					logout();
				} else {
					console.log("🔄 Wallet accounts changed, refreshing connection");
					checkWeb3Provider();
				}
			};

			window.ethereum.on("accountsChanged", handleAccountsChanged);

			return () => {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
			};
		}
	}, [logout, checkWeb3Provider]);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			...state,
			hasInitialized: hasInitializedRef.current,
			isInitialized: hasInitializedRef.current,
			isLoading: state.connectionState === CONNECTION_STATES.INITIALIZING,
			isConnected: state.connectionState === CONNECTION_STATES.CONNECTED,
			hasProfile: state.userState === USER_STATES.HAS_PROFILE,
			needsProfile: state.userState === USER_STATES.NO_PROFILE,
			error: state.errorMessage,
			checkWeb3Provider,
			connectWallet,
			disconnectWallet,
			logout,
		}),
		[state, checkWeb3Provider, connectWallet, disconnectWallet, logout]
	);

	return (
		<AccountContext.Provider value={contextValue}>
			{children}
		</AccountContext.Provider>
	);
};

export const useAccount = () => {
	const context = useContext(AccountContext);
	if (!context) {
		throw new Error("useAccount must be used within an AccountProvider");
	}
	return context;
};

AccountProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AccountProvider;
