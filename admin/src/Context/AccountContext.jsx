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
import { getCurrentUser, subscribeToUser } from "../../firebaseConfig";
import { toast } from "react-toastify";
import { saveProfileToBlockchain } from "../utils/ipfsHelper";
import { useAuth } from "./AuthContext";

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
	const [walletAddress, setWalletAddress] = useState(null);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [store, setStore] = useState(null);
	const [googleUser, setGoogleUser] = useState(getCurrentUser());
	const [networkName, setNetworkName] = useState(null);
	const [balance, setBalance] = useState(null);
	const [loginHistory, setLoginHistory] = useState([]);

	// Subscribe to Firebase auth state changes
	useEffect(() => {
		const unsubscribe = subscribeToUser((firebaseUser) => {
			setGoogleUser(firebaseUser);
		});

		return () => unsubscribe();
	}, []);

	const fetchUserAndStoreData = useCallback(async (address) => {
		try {
			// Fetch user data
			const userResponse = await axios.get(`/users`);
			const userData = userResponse.data.find(
				(u) => u.walletAddress.toLowerCase() === address.toLowerCase()
			);

			if (userData) {
				// Fetch store data
				const storeResponse = await axios.get(`/stores`);
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

			if (response.data?.token) {
				// Store the token in axios defaults
				axios.defaults.headers.common[
					"Authorization"
				] = `Bearer ${response.data.token}`;
				localStorage.setItem("auth_token", response.data.token);
			}

			setWalletAddress(address);
			const hasProfile = await checkUserProfile(address);
			return { address, hasProfile };
		} catch (error) {
			if (error.code === 4001) {
				// User rejected the signature request
				toast.error("Please sign the message to login");
			} else {
				const errorMessage = error.message || "Failed to connect wallet";
				toast.error(errorMessage);
			}
			console.error("Wallet connection error:", error);
			throw error;
		}
	}, [checkUserProfile]);

	const linkGoogleProfile = async (address, googleData) => {
		console.log("Linking Google profile:", address, googleData);
		try {
			setLoading(true);
			const loadingToast = toast.loading("Creating your vendor account...");

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

			// Save to blockchain and IPFS
			const { ipfsUrl, ipfsCid } = await saveProfileToBlockchain(
				userData,
				(message) => {
					toast.update(loadingToast, {
						render: message,
						isLoading: true,
					});
				}
			);

			// Add IPFS data to user data
			const finalUserData = {
				...userData,
				ipfsURI: ipfsUrl,
				ipfsUrl: ipfsUrl,
				ipfsCid: ipfsCid,
				ipfsMetadata: userData,
			};

			console.log("Sending user data:", finalUserData);

			// Save to database
			const response = await axios.post(`/users/link-google`, finalUserData);

			console.log("Server response:", response.data);

			if (response.data?.success && response.data?.user) {
				setUser(response.data.user);
				toast.update(loadingToast, {
					render: "Account created successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});
				return response.data.user;
			}

			throw new Error(response.data?.message || "Failed to create account");
		} catch (error) {
			let errorMessage = "Failed to create account";
			let errorDetails = "";

			if (error.code === "ERR_NETWORK") {
				errorMessage =
					"Cannot connect to server. Please check your internet connection.";
				console.error("Network error details:", error);
			} else if (error.response?.data) {
				errorMessage = error.response.data.message || "Server error";
				errorDetails = error.response.data.details
					? "\nDetails: " + error.response.data.details.join(", ")
					: "";
				console.error("Server error details:", error.response.data);
			} else if (error.message) {
				errorMessage = error.message;
				console.error("General error details:", error);
			}

			toast.error(errorMessage + errorDetails);
			console.error("Account creation error:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Initialize: Check if wallet is already connected and restore auth token
	useEffect(() => {
		const checkConnection = async () => {
			setLoading(true);
			try {
				// Restore auth token if it exists
				const token = localStorage.getItem("auth_token");
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
				// Clear potentially invalid token
				localStorage.removeItem("auth_token");
				delete axios.defaults.headers.common["Authorization"];
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
