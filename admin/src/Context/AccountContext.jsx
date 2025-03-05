import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import axios from "axios";
import {
	getCurrentUser,
	subscribeToUser,
	getCurrentToken,
} from "../../firebaseConfig";
import { toast } from "react-toastify";
import { saveProfileToBlockchain } from "../utils/ipfsHelper";
import { useNavigate } from "react-router-dom";

// Update API URL to use the correct environment variable and default value
const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 10000; // 10 seconds timeout

// Add this network mapping object at the top of the file, after imports
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
	80002: "Amoy",
};

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
	const navigate = useNavigate();
	const [walletAddress, setWalletAddress] = useState(null);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [store, setStore] = useState(null);
	const [googleUser, setGoogleUser] = useState(getCurrentUser());
	const [networkName, setNetworkName] = useState(null);
	const [balance, setBalance] = useState(null);
	const [loginHistory, setLoginHistory] = useState([]);
	const [socialAccounts, setSocialAccounts] = useState([]);

	// Subscribe to Firebase auth state changes
	useEffect(() => {
		const unsubscribe = subscribeToUser((firebaseUser) => {
			setGoogleUser(firebaseUser);
		});

		return () => unsubscribe();
	}, []);

	const showLoadingToast = (message) => {
		return toast.loading(message);
	};

	const showErrorToast = (message, id) => {
		toast.error(message, { toastId: id });
	};

	const fetchUserAndStoreData = useCallback(async (address) => {
		try {
			// Check server health first
			try {
				await axios.get(`${API_URL}/health`);
			} catch (error) {
				throw new Error(
					"Server is not running. Please start the server and try again."
				);
			}

			// Fetch user data with error handling
			let userResponse;
			try {
				userResponse = await axios.get(`/users`);
			} catch (error) {
				if (error.code === "ERR_NETWORK") {
					throw new Error(
						"Cannot connect to server. Please check if the server is running."
					);
				}
				throw error;
			}

			const userData = userResponse.data.find(
				(u) => u.walletAddress.toLowerCase() === address.toLowerCase()
			);

			if (userData) {
				// Fetch store data with error handling
				let storeResponse;
				try {
					storeResponse = await axios.get(`/stores`);
				} catch (error) {
					if (error.code === "ERR_NETWORK") {
						throw new Error(
							"Cannot connect to server. Please check if the server is running."
						);
					}
					throw error;
				}

				const storeData = storeResponse.data.stores.find(
					(s) => s.userId === userData.id
				);

				// Combine user and store data
				const combinedData = {
					...userData,
					store: storeData || null,
				};

				setUser(combinedData);
				setStore(storeData);
				return { user: combinedData, store: storeData };
			}
			return null;
		} catch (error) {
			console.error("Error fetching user and store data:", error);
			return null;
		}
	}, []);

	const checkUserProfile = useCallback(
		async (address) => {
			try {
				const data = await fetchUserAndStoreData(address);
				if (data) {
					// Check for missing fields
					const missingFields = [];
					if (!data.user.phoneNumber) missingFields.push("Phone Number");
					if (!data.user.gender) missingFields.push("Gender");
					if (!data.user.dob) missingFields.push("Date of Birth");
					if (!data.user.bio) missingFields.push("Bio");
					if (!data.user.location) missingFields.push("Location");
					if (!data.user.socialMedias) missingFields.push("Social Media Links");
					if (!data.user.googleProfile) missingFields.push("Google Profile");
					if (!data.user.ipfsURI) missingFields.push("IPFS Profile");

					// If there are missing fields, show a warning toast
					if (missingFields.length > 0) {
						toast.warning(
							<div>
								<div className="font-semibold">Profile Incomplete</div>
								<div className="text-sm">
									Please complete your profile by adding:{" "}
									{missingFields.join(", ")}
								</div>
							</div>,
							{
								duration: 5000,
								position: "top-right",
							}
						);
					}
					return true;
				}
				return false;
			} catch (error) {
				console.error("Error checking user profile:", error);
				return false;
			}
		},
		[fetchUserAndStoreData]
	);

	const updateTokens = async (tokens) => {
		try {
			const token = getCurrentToken();
			if (!token) {
				throw new Error("No auth token found");
			}

			// Set the token in axios headers
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

			// Send tokens to backend for storage
			const response = await axios.post(`${API_URL}/users/update-tokens`, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				expiresIn: tokens.expiresIn,
			});

			return response.data.success;
		} catch (error) {
			console.error("Error updating tokens:", error);
			throw error;
		}
	};

	const connectWallet = useCallback(async () => {
		try {
			if (typeof window === "undefined" || !window.ethereum) {
				throw new Error("MetaMask is not installed");
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await provider.send("eth_requestAccounts", []);
			const address = accounts[0];
			const signer = await provider.getSigner();

			// Get the chain ID to verify the network
			const network = await provider.getNetwork();
			const chainId = Number(network.chainId);

			// Sign a message to authenticate
			const message = `Login to Tredit\nWallet: ${address}\nChain: ${
				NETWORK_NAMES[chainId] || chainId
			}\nNonce: ${Date.now()}`;
			const signature = await signer.signMessage(message);

			// Check if server is running before making the request
			try {
				await axios.get(`${API_URL}/health`);
			} catch (error) {
				throw new Error(
					"Server is not running. Please start the server and try again."
				);
			}

			// Get Firebase token and user tokens
			const firebaseToken = getCurrentToken();
			if (!firebaseToken) {
				throw new Error("Not authenticated with Firebase");
			}

			// Set authorization header
			axios.defaults.headers.common[
				"Authorization"
			] = `Bearer ${firebaseToken}`;

			// Send the signature to the backend for verification and login
			const response = await axios.post(`${API_URL}/users/wallet-auth`, {
				address,
				signature,
				message,
				chainId,
				userAgent: window.navigator.userAgent,
				deviceInfo: {
					platform: window.navigator.platform,
					language: window.navigator.language,
					vendor: window.navigator.vendor,
				},
			});

			// Store tokens if received
			if (response.data?.tokens) {
				await updateTokens(response.data.tokens);
			}

			setWalletAddress(address);
			const hasProfile = await checkUserProfile(address);

			// Use React Router navigation instead of window.location
			if (hasProfile) {
				navigate("/dashboard", { replace: true });
			} else {
				navigate("/create-profile", { replace: true });
			}

			return { address, hasProfile };
		} catch (error) {
			if (error.code === 4001) {
				showErrorToast(
					"Please sign the message to login",
					"signature-rejected"
				);
			} else if (error.code === "ERR_NETWORK") {
				showErrorToast(
					error.message ||
						"Cannot connect to server. Please check if the server is running.",
					"network-error"
				);
			} else {
				showErrorToast(
					error.message || "Failed to connect wallet",
					"wallet-connection-error"
				);
			}
			console.error("Wallet connection error:", error);
			throw error;
		}
	}, [checkUserProfile, navigate]);

	const linkGoogleProfile = async (address, googleData) => {
		try {
			setLoading(true);
			const loadingToast = toast.loading("Creating your vendor account...");

			// Check server health first
			try {
				await axios.get(`${API_URL}/health`);
			} catch (error) {
				toast.dismiss(loadingToast);
				showErrorToast(
					"Server is not running. Please start the server and try again.",
					"server-health-check"
				);
				setLoading(false);
				return null;
			}

			// Use email as fallback for displayName
			const displayName =
				googleData.displayName || googleData.email.split("@")[0];

			// Prepare user data for IPFS
			const userData = {
				walletAddress: address.toLowerCase(),
				name: displayName,
				email: googleData.email,
				phoneNumber: null,
				profileImage: googleData.photoURL,
				gender: null,
				dob: null,
				bio: null,
				location: null,
				socialMedias: [],
				role: "vendor",
				timestamp: new Date().toISOString(),
			};

			let ipfsData;
			try {
				// Save to blockchain and IPFS with a timeout
				const timeoutPromise = new Promise((_, reject) =>
					setTimeout(
						() => reject(new Error("Blockchain operation timed out")),
						60000
					)
				);

				ipfsData = await Promise.race([
					saveProfileToBlockchain(userData, (message) => {
						toast.update(loadingToast, {
							render: message,
							isLoading: true,
						});
					}),
					timeoutPromise,
				]);

				if (!ipfsData) {
					throw new Error("Failed to save profile to blockchain");
				}
			} catch (error) {
				toast.dismiss(loadingToast);
				showErrorToast(
					error.message || "Failed to save profile to blockchain",
					"blockchain-error"
				);
				setLoading(false);
				return null;
			}

			// Add IPFS data to user data
			const finalUserData = {
				...userData,
				ipfsURI: ipfsData.ipfsUrl,
				ipfsUrl: ipfsData.ipfsUrl,
				ipfsCid: ipfsData.ipfsCid,
				ipfsMetadata: userData,
				googleProfile: {
					uid: googleData.uid,
					email: googleData.email,
					displayName: googleData.displayName,
					photoURL: googleData.photoURL,
				},
			};

			// Save to database
			try {
				const response = await axios.post(
					`${API_URL}/users/link-google`,
					finalUserData
				);

				if (response.data?.success && response.data?.user) {
					setUser(response.data.user);
					toast.update(loadingToast, {
						render: "Account created successfully!",
						type: "success",
						isLoading: false,
						autoClose: 3000,
					});

					// Use React Router navigation
					setTimeout(() => {
						navigate("/dashboard", { replace: true });
					}, 1000);

					return response.data.user;
				}

				throw new Error(response.data?.message || "Failed to create account");
			} catch (error) {
				toast.dismiss(loadingToast);
				showErrorToast(
					error.message || "Failed to save user data",
					"database-error"
				);
				setLoading(false);
				return null;
			}
		} catch (error) {
			setLoading(false);
			let errorMessage = "Failed to create account";

			if (error.code === "ERR_NETWORK") {
				errorMessage =
					"Cannot connect to server. Please check your internet connection.";
			} else if (error.response?.data) {
				errorMessage = error.response.data.message || "Server error";
			} else if (error.message) {
				errorMessage = error.message;
			}

			showErrorToast(errorMessage, "account-creation-error");
			return null;
		} finally {
			setLoading(false);
		}
	};

	// Initialize: Check if wallet is already connected
	useEffect(() => {
		const checkConnection = async () => {
			setLoading(true);
			try {
				// Check server health first
				try {
					await axios.get(`${API_URL}/health`);
				} catch (error) {
					console.error("Server health check failed:", error);
					showErrorToast(
						"Server is not running. Please start the server and try again.",
						"server-health-check"
					);
					setLoading(false);
					return;
				}

				// Get token from Firebase
				const token = getCurrentToken();
				if (token) {
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
				}

				if (window.ethereum) {
					const provider = new ethers.BrowserProvider(window.ethereum);
					const accounts = await provider.listAccounts();
					if (accounts.length > 0) {
						const address = accounts[0].address;
						setWalletAddress(address);
						await checkUserProfile(address);
					}
				}
			} catch (error) {
				console.error("Initial connection check failed:", error);
			} finally {
				setLoading(false);
			}
		};

		checkConnection();
	}, [checkUserProfile]);

	// Listen for account changes
	useEffect(() => {
		if (window.ethereum) {
			const handleAccountsChanged = async (accounts) => {
				if (accounts.length === 0) {
					setWalletAddress(null);
					setUser(null);
					toast.info("Wallet disconnected");
				} else {
					const newAddress = accounts[0];
					setWalletAddress(newAddress);
					await checkUserProfile(newAddress);
					toast.success(
						"Wallet connected: " +
							newAddress.slice(0, 6) +
							"..." +
							newAddress.slice(-4)
					);
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
	}, [checkUserProfile]);

	// Update the updateNetworkAndBalance function
	const updateNetworkAndBalance = useCallback(async () => {
		if (window.ethereum && walletAddress) {
			try {
				const provider = new ethers.BrowserProvider(window.ethereum);

				// Get network
				const network = await provider.getNetwork();
				const chainId = Number(network.chainId);
				const networkName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
				setNetworkName(networkName);

				// Get balance
				const balance = await provider.getBalance(walletAddress);
				setBalance(ethers.formatEther(balance));
			} catch (error) {
				console.error("Error fetching network/balance:", error);
				setNetworkName("Unknown");
				setBalance(null);
			}
		} else {
			setNetworkName(null);
			setBalance(null);
		}
	}, [walletAddress]);

	// Update network and balance when wallet changes
	useEffect(() => {
		updateNetworkAndBalance();

		// Listen for network changes
		if (window.ethereum) {
			window.ethereum.on("chainChanged", updateNetworkAndBalance);
			return () => {
				window.ethereum.removeListener("chainChanged", updateNetworkAndBalance);
			};
		}
	}, [walletAddress, updateNetworkAndBalance]);

	const disconnectWallet = useCallback(() => {
		setWalletAddress(null);
		setUser(null);
		// Clear auth token
		delete axios.defaults.headers.common["Authorization"];
		localStorage.removeItem("auth_token");
		toast.info("Wallet disconnected");
	}, []);

	const updateStoreSettings = async (settings) => {
		try {
			if (!walletAddress || !store) {
				throw new Error("No store found");
			}

			const response = await axios.put(`/stores/${store.id}/settings`, {
				settings: settings,
			});

			if (response.data?.success) {
				setStore((prev) => ({
					...prev,
					settings: {
						...prev.settings,
						...settings,
					},
				}));
				toast.success("Store settings updated successfully");
				return true;
			}
			throw new Error(
				response.data?.message || "Failed to update store settings"
			);
		} catch (error) {
			toast.error(error.message || "Failed to update store settings");
			return false;
		}
	};

	const fetchLoginHistory = async () => {
		try {
			if (!walletAddress) return;

			const response = await axios.get(`/users/${walletAddress}/login-history`);

			if (response.data.success) {
				setLoginHistory(response.data.loginHistory);
			}
		} catch (error) {
			console.error("Error fetching login history:", error);
			toast.error("Failed to fetch login history");
		}
	};

	useEffect(() => {
		if (walletAddress) {
			fetchLoginHistory();
		}
	}, [walletAddress]);

	const deleteAccount = async () => {
		try {
			if (!walletAddress) {
				throw new Error("No wallet connected");
			}

			const loadingToast = toast.loading("Deleting your account...");

			// Check server health first
			try {
				await axios.get(`${API_URL}/health`);
			} catch (error) {
				toast.dismiss(loadingToast);
				showErrorToast(
					"Server is not running. Please start the server and try again.",
					"server-health-check"
				);
				return false;
			}

			// Delete the user account
			const response = await axios.delete(`${API_URL}/users/${walletAddress}`);

			if (response.data?.success) {
				// Clear local state
				setWalletAddress(null);
				setUser(null);
				setStore(null);
				// Clear auth token
				delete axios.defaults.headers.common["Authorization"];
				localStorage.removeItem("auth_token");

				toast.update(loadingToast, {
					render: "Account deleted successfully",
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});

				// Navigate to home page
				navigate("/", { replace: true });
				return true;
			}

			throw new Error(response.data?.message || "Failed to delete account");
		} catch (error) {
			console.error("Error deleting account:", error);
			showErrorToast(
				error.message || "Failed to delete account",
				"account-deletion-error"
			);
			return false;
		}
	};

	const connectYouTube = async () => {
		try {
			showLoadingToast("Connecting to YouTube...");
			const response = await axios.get(`${API_URL}/social/youtube/connect`);
			window.location.href = response.data.url;
		} catch (error) {
			console.error("Error connecting to YouTube:", error);
			showErrorToast("Failed to connect to YouTube", "youtube-connect-error");
		}
	};

	const handleYouTubeCallback = async (code) => {
		try {
			showLoadingToast("Finalizing YouTube connection...");
			await axios.post(`${API_URL}/social/youtube/save-tokens`, { code });
			await fetchUserAndStoreData(); // Refresh user data
			toast.success("YouTube account connected successfully!");
		} catch (error) {
			console.error("Error saving YouTube tokens:", error);
			showErrorToast("Failed to save YouTube connection", "youtube-save-error");
		}
	};

	// Fetch social accounts
	const fetchSocialAccounts = async () => {
		try {
			const token = getCurrentToken();
			if (!token) {
				console.warn("No auth token found");
				setSocialAccounts([]);
				return;
			}

			// Set the token in axios headers
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

			const response = await axios.get(`${API_URL}/social/accounts`);
			if (response.data.success) {
				setSocialAccounts(response.data.accounts);
			} else {
				setSocialAccounts([]);
			}
		} catch (error) {
			console.error("Error fetching social accounts:", error);
			if (error.response?.status === 401) {
				setSocialAccounts([]);
			}
			showErrorToast(
				"Failed to fetch social accounts",
				"fetch-social-accounts-error"
			);
		}
	};

	// Connect social platform
	const connectSocialPlatform = async (platform) => {
		try {
			if (!walletAddress) {
				throw new Error("No wallet connected");
			}

			const loadingToast = showLoadingToast(`Connecting to ${platform}...`);

			// Check server health
			try {
				await axios.get(`${API_URL}/health`);
			} catch (error) {
				toast.dismiss(loadingToast);
				showErrorToast(
					"Server is not running. Please start the server and try again.",
					"server-health-check"
				);
				return false;
			}

			const response = await axios.get(
				`${API_URL}/social/${platform.toLowerCase()}/connect`
			);

			if (response.data.success && response.data.url) {
				// Open the OAuth URL in a new window
				window.location.href = response.data.url;
				return true;
			}

			throw new Error(`Failed to connect to ${platform}`);
		} catch (error) {
			console.error(`Error connecting to ${platform}:`, error);
			showErrorToast(
				error.message || `Failed to connect to ${platform}`,
				"social-connect-error"
			);
			return false;
		}
	};

	// Disconnect social platform
	const disconnectSocialPlatform = async (platform) => {
		try {
			if (!walletAddress) {
				throw new Error("No wallet connected");
			}

			const loadingToast = showLoadingToast(
				`Disconnecting from ${platform}...`
			);

			const response = await axios.post(
				`${API_URL}/social/${platform.toLowerCase()}/disconnect`
			);

			if (response.data.success) {
				await fetchSocialAccounts(); // Refresh the list
				toast.success(`${platform} disconnected successfully`);
				return true;
			}

			throw new Error(`Failed to disconnect from ${platform}`);
		} catch (error) {
			console.error(`Error disconnecting from ${platform}:`, error);
			showErrorToast(
				error.message || `Failed to disconnect from ${platform}`,
				"social-disconnect-error"
			);
			return false;
		}
	};

	// Handle social platform callback
	const handleSocialCallback = async (platform, code) => {
		try {
			const loadingToast = showLoadingToast(
				`Finalizing ${platform} connection...`
			);

			const response = await axios.post(
				`${API_URL}/social/${platform.toLowerCase()}/save-tokens`,
				{ code }
			);

			if (response.data.success) {
				await fetchSocialAccounts(); // Refresh the list
				toast.success(`${platform} connected successfully!`);
				return true;
			}

			throw new Error(`Failed to save ${platform} connection`);
		} catch (error) {
			console.error(`Error saving ${platform} connection:`, error);
			showErrorToast(
				error.message || `Failed to save ${platform} connection`,
				"social-callback-error"
			);
			return false;
		}
	};

	const value = {
		walletAddress,
		user,
		store,
		googleUser,
		loading,
		connectWallet,
		disconnectWallet,
		linkGoogleProfile,
		networkName,
		balance,
		profile: {
			...user,
			store,
			name: user?.name || googleUser?.displayName,
			email: user?.email || googleUser?.email,
			profileImage: user?.profileImage || googleUser?.photoURL,
		},
		updateStoreSettings,
		loginHistory,
		fetchLoginHistory,
		deleteAccount,
		connectYouTube,
		handleYouTubeCallback,
		socialAccounts,
		connectSocialPlatform,
		disconnectSocialPlatform,
		handleSocialCallback,
		fetchSocialAccounts,
		updateTokens,
	};

	return (
		<AccountContext.Provider value={value}>{children}</AccountContext.Provider>
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
