import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { subscribeToUser } from "../../firebaseConfig";
import {
	showWalletDisconnect,
	showLoadingToast,
	updateToast,
	TOAST_IDS,
	TOAST_TYPES,
} from "../utils/toastManager";
import {
	setStorageItem,
	getStorageItem,
	removeStorageItem,
	clearStorage,
	STORAGE_KEYS,
} from "../utils/storage";

// Update API URL to use the correct environment variable and default value
const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000; // 30 seconds timeout

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

// Add connection states enum
const CONNECTION_STATES = {
	DISCONNECTED: "disconnected",
	CONNECTING: "connecting",
	CONNECTED: "connected",
	ERROR: "error",
};

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
	const navigate = useNavigate();
	const [accountState, setAccountState] = useState({
		isInitialized: false,
		isLoading: true,
		isConnecting: false,
		isFetchingBalance: false,
		walletAddress: getStorageItem(STORAGE_KEYS.WALLET_ADDRESS),
		networkName: getStorageItem(STORAGE_KEYS.NETWORK_NAME),
		balance: getStorageItem(STORAGE_KEYS.BALANCE),
		loginHistory: getStorageItem(STORAGE_KEYS.LOGIN_HISTORY) || [],
		connectionState: CONNECTION_STATES.DISCONNECTED,
		connectionError: null,
		error: null,
		user: getStorageItem(STORAGE_KEYS.USER),
	});

	// Update localStorage when relevant state changes
	useEffect(() => {
		if (accountState.walletAddress) {
			setStorageItem(STORAGE_KEYS.WALLET_ADDRESS, accountState.walletAddress);
		}
		if (accountState.networkName) {
			setStorageItem(STORAGE_KEYS.NETWORK_NAME, accountState.networkName);
		}
		if (accountState.balance) {
			setStorageItem(STORAGE_KEYS.BALANCE, accountState.balance);
		}
		if (accountState.user) {
			setStorageItem(STORAGE_KEYS.USER, accountState.user);
		}
		if (accountState.loginHistory.length > 0) {
			setStorageItem(STORAGE_KEYS.LOGIN_HISTORY, accountState.loginHistory);
		}
	}, [
		accountState.walletAddress,
		accountState.networkName,
		accountState.balance,
		accountState.user,
		accountState.loginHistory,
	]);

	// Subscribe to Firebase auth changes
	useEffect(() => {
		const unsubscribe = subscribeToUser((firebaseUser) => {
			if (firebaseUser) {
				// Only update basic Firebase user data
				setAccountState((prev) => ({
					...prev,
					isInitialized: true,
					isLoading: false,
				}));
			} else {
				setAccountState((prev) => ({
					...prev,
					isInitialized: true,
					isLoading: false,
					user: null,
				}));
			}
		});

		return () => unsubscribe();
	}, []);

	// Initialize wallet connection
	useEffect(() => {
		const initializeWallet = async () => {
			if (!window.ethereum) {
				setAccountState((prev) => ({
					...prev,
					isInitialized: true,
					isLoading: false,
					connectionState: CONNECTION_STATES.DISCONNECTED,
				}));
				return;
			}

			try {
				setAccountState((prev) => ({ ...prev, isLoading: true }));
				const provider = new ethers.BrowserProvider(window.ethereum);
				const accounts = await provider.listAccounts();

				if (accounts.length > 0) {
					const address = accounts[0].address;
					const network = await provider.getNetwork();
					const chainId = Number(network.chainId);
					const networkName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;

					setAccountState((prev) => ({ ...prev, isFetchingBalance: true }));
					const balance = await provider.getBalance(address);

					// Check if user exists and get profile data in one call
					try {
						const response = await axios.get(`/users/${address.toLowerCase()}`);

						setAccountState((prev) => ({
							...prev,
							isInitialized: true,
							isLoading: false,
							isFetchingBalance: false,
							walletAddress: address,
							networkName,
							balance: ethers.formatEther(balance),
							connectionState: CONNECTION_STATES.CONNECTED,
							user: response.data?.success ? response.data.user : null,
						}));
					} catch (error) {
						// If error is 404, user doesn't exist. Any other error is treated as a connection error
						setAccountState((prev) => ({
							...prev,
							isInitialized: true,
							isLoading: false,
							isFetchingBalance: false,
							walletAddress: address,
							networkName,
							balance: ethers.formatEther(balance),
							connectionState: CONNECTION_STATES.CONNECTED,
							user: null,
							error: error.response?.status === 404 ? null : error.message,
						}));
					}
				} else {
					setAccountState((prev) => ({
						...prev,
						isInitialized: true,
						isLoading: false,
						walletAddress: null,
						connectionState: CONNECTION_STATES.DISCONNECTED,
					}));
				}
			} catch (error) {
				setAccountState((prev) => ({
					...prev,
					isInitialized: true,
					isLoading: false,
					error: error.message,
					connectionState: CONNECTION_STATES.ERROR,
					connectionError: error.message,
				}));
			}
		};

		initializeWallet();

		// Setup event listeners
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("chainChanged", handleChainChanged);
		}

		return () => {
			if (window.ethereum) {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
				window.ethereum.removeListener("chainChanged", handleChainChanged);
			}
		};
	}, []);

	const handleAccountsChanged = async (accounts) => {
		if (accounts.length === 0) {
			await disconnectWallet();
		} else {
			const newAddress = accounts[0];
			await updateWalletInfo(newAddress);
		}
	};

	const handleChainChanged = () => {
		// Reload the page as recommended by MetaMask
		window.location.reload();
	};

	const updateWalletInfo = async (address) => {
		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const network = await provider.getNetwork();
			const chainId = Number(network.chainId);
			const balance = await provider.getBalance(address);

			try {
				const response = await axios.get(`/users/${address.toLowerCase()}`);
				const userData = response.data?.success ? response.data.user : null;

				setAccountState((prev) => ({
					...prev,
					walletAddress: address,
					networkName: NETWORK_NAMES[chainId] || `Chain ${chainId}`,
					balance: ethers.formatEther(balance),
					connectionState: CONNECTION_STATES.CONNECTED,
					connectionError: null,
					user: userData,
				}));

				// Update localStorage
				setStorageItem(STORAGE_KEYS.WALLET_ADDRESS, address);
				setStorageItem(
					STORAGE_KEYS.NETWORK_NAME,
					NETWORK_NAMES[chainId] || `Chain ${chainId}`
				);
				setStorageItem(STORAGE_KEYS.BALANCE, ethers.formatEther(balance));
				if (userData) {
					setStorageItem(STORAGE_KEYS.USER, userData);
				}
			} catch (error) {
				setAccountState((prev) => ({
					...prev,
					walletAddress: address,
					networkName: NETWORK_NAMES[chainId] || `Chain ${chainId}`,
					balance: ethers.formatEther(balance),
					connectionState: CONNECTION_STATES.CONNECTED,
					connectionError:
						error.response?.status === 404 ? null : error.message,
					user: null,
				}));

				// Update localStorage even if user fetch fails
				setStorageItem(STORAGE_KEYS.WALLET_ADDRESS, address);
				setStorageItem(
					STORAGE_KEYS.NETWORK_NAME,
					NETWORK_NAMES[chainId] || `Chain ${chainId}`
				);
				setStorageItem(STORAGE_KEYS.BALANCE, ethers.formatEther(balance));
				removeStorageItem(STORAGE_KEYS.USER);
			}
		} catch (error) {
			setAccountState((prev) => ({
				...prev,
				connectionState: CONNECTION_STATES.ERROR,
				connectionError: error.message,
				user: null,
			}));
			clearStorage();
		}
	};

	const connectWallet = async (signature, message) => {
		try {
			if (!window.ethereum) {
				throw new Error("Please install MetaMask!");
			}

			setAccountState((prev) => ({
				...prev,
				isConnecting: true,
				connectionState: CONNECTION_STATES.CONNECTING,
			}));

			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const address = await signer.getAddress();
			const chainId = (await provider.getNetwork()).chainId;

			setAccountState((prev) => ({ ...prev, isFetchingBalance: true }));
			const balance = ethers.formatEther(await provider.getBalance(address));

			// Verify signature
			const recoveredAddress = ethers.verifyMessage(message, signature);
			if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
				throw new Error("Invalid signature");
			}

			console.log("Authenticating wallet:", address);
			// Get authentication token with login history
			const authResponse = await axios.post(`/users/wallet-auth`, {
				walletAddress: address,
				signature,
				message,
				chainId: chainId.toString(),
				skipLoginHistory: false, // Ensure we create login history for actual authentication
			});

			if (!authResponse.data) {
				throw new Error("No response received from authentication server");
			}

			if (authResponse.data?.success) {
				const { token, user, loginHistory, exists, hasProfile } =
					authResponse.data;

				// Update axios headers
				if (token) {
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
				}

				// Update state with login history if available
				setAccountState((prev) => ({
					...prev,
					walletAddress: address,
					chainId: chainId.toString(),
					balance,
					user: user || null,
					authToken: token,
					isConnected: true,
					connectionState: CONNECTION_STATES.CONNECTED,
					connectionError: null,
					isLoading: false,
					isConnecting: false,
					isFetchingBalance: false,
					error: null,
					loginHistory: loginHistory || [],
				}));

				return {
					success: true,
					address,
					chainId: chainId.toString(),
					balance,
					user: user || null,
					loginHistory,
					exists,
					hasProfile,
				};
			} else {
				const errorMsg = authResponse.data?.message || "Authentication failed";
				throw new Error(errorMsg);
			}
		} catch (error) {
			console.error("Wallet connection error:", error);
			const errorMsg = error.response?.data?.error || error.message;
			setAccountState((prev) => ({
				...prev,
				connectionState: CONNECTION_STATES.ERROR,
				connectionError: errorMsg,
				isLoading: false,
				isConnecting: false,
				isFetchingBalance: false,
				error: errorMsg,
			}));
			throw error;
		}
	};

	const disconnectWallet = async () => {
		try {
			setAccountState((prev) => ({
				...prev,
				isLoading: true,
			}));

			delete axios.defaults.headers.common["Authorization"];
			clearStorage();

			setAccountState((prev) => ({
				...prev,
				isInitialized: true,
				isLoading: false,
				walletAddress: null,
				user: null,
				connectionState: CONNECTION_STATES.DISCONNECTED,
				connectionError: null,
			}));

			// Emit custom event for wallet disconnection
			window.dispatchEvent(new Event("walletDisconnected"));
			showWalletDisconnect();
		} catch (error) {
			setAccountState((prev) => ({
				...prev,
				isLoading: false,
				connectionState: CONNECTION_STATES.ERROR,
				connectionError: "Failed to disconnect wallet",
			}));
		}
	};

	const updateProfile = async (profileData) => {
		const toastId = showLoadingToast(
			"Updating profile...",
			TOAST_IDS.PROFILE_UPDATE
		);

		try {
			if (!accountState.walletAddress) {
				throw new Error("Please connect your wallet first");
			}

			const updatedData = {
				...profileData,
				walletAddress: accountState.walletAddress,
				updatedAt: new Date().toISOString(),
			};

			console.log("Sending update data:", updatedData);

			const response = await axios.patch(
				`/users/profile/${accountState.walletAddress}`,
				updatedData
			);

			console.log("Update response:", response.data);

			if (!response.data?.success) {
				throw new Error(response.data?.error || "Failed to update profile");
			}

			// Get fresh user data after update
			const userResponse = await axios.get(
				`/users/${accountState.walletAddress}`
			);

			if (!userResponse.data?.success) {
				throw new Error("Failed to fetch updated user data");
			}

			setAccountState((prev) => ({
				...prev,
				user: userResponse.data.user,
			}));

			updateToast(
				toastId,
				"Profile updated successfully!",
				TOAST_TYPES.SUCCESS
			);
			return { success: true, user: userResponse.data.user };
		} catch (error) {
			console.error("Profile update error:", error);
			const errorMessage =
				error.response?.data?.error ||
				error.message ||
				"Failed to update profile";

			updateToast(toastId, errorMessage, TOAST_TYPES.ERROR);
			throw error;
		}
	};

	const updateTokens = async (tokens) => {
		try {
			const response = await axios.post("/users/update-tokens", tokens);
			if (response.data?.success) {
				setAccountState((prev) => ({
					...prev,
					authToken: response.data.token,
				}));
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error updating tokens:", error);
			return false;
		}
	};

	const fetchSocialAccounts = async () => {
		// Placeholder function to maintain interface
		return [];
	};

	const handleSocialCallback = async () => {
		// Placeholder function to maintain interface
		return false;
	};

	const connectSocialPlatform = async () => {
		// Placeholder function to maintain interface
		return false;
	};

	const disconnectSocialPlatform = async () => {
		// Placeholder function to maintain interface
		return false;
	};

	const value = {
		...accountState,
		loggedInUser: accountState.user,
		connectWallet,
		disconnectWallet,
		updateProfile,
		updateTokens,
		fetchSocialAccounts,
		handleSocialCallback,
		connectSocialPlatform,
		disconnectSocialPlatform,
		updateWalletInfo,
		handleAccountsChanged,
		handleChainChanged,
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
