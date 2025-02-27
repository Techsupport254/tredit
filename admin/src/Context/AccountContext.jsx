import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import axios from "axios";
import {
	uploadToIPFS,
	fetchFromIPFS,
	saveProfileToBlockchain,
} from "../utils/ipfsHelper";

// Shared constants
const contractABI = [
	"function getUserProfile(address _user) view returns (tuple(string profileURI, uint reputationScore, bool exists))",
	"function updateProfileURI(string memory newProfileURI) public",
];
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
	/*** Wallet State & Functions ***/
	const [isConnected, setIsConnected] = useState(false);
	const [userAddress, setUserAddress] = useState(null);
	const [balance, setBalance] = useState(null);
	const [networkName, setNetworkName] = useState("Unknown");
	const [provider, setProvider] = useState(null);
	const [storageLoading, setStorageLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [storageInitialized, setStorageInitialized] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [profileData, setProfileData] = useState({
		email: "",
		name: "",
		username: "",
		dob: null,
		gender: null,
		bio: "",
		profilePicture: null,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [profile, setProfile] = useState(null);
	const [profileFetched, setProfileFetched] = useState(false);
	const [accountError, setAccountError] = useState(null);
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	// Get provider from MetaMask
	const getProvider = useCallback(() => {
		if (typeof window !== "undefined" && window.ethereum) {
			return new ethers.BrowserProvider(window.ethereum);
		}
		return null;
	}, []);

	// Fetch network name
	const fetchNetworkName = useCallback(async (providerInstance) => {
		try {
			const network = await providerInstance.getNetwork();
			setNetworkName(network.name || "Unknown");
		} catch (error) {
			console.error("Failed to fetch network name:", error);
			setNetworkName("Unknown");
		}
	}, []);

	// Fetch balance
	const fetchBalance = useCallback(async () => {
		if (!provider || !userAddress) return;
		try {
			const balanceBN = await provider.getBalance(userAddress);
			setBalance(ethers.formatEther(balanceBN));
		} catch (error) {
			console.error("Failed to fetch balance:", error);
			setBalance("Error");
		}
	}, [provider, userAddress]);

	// Auto-refresh balance
	useEffect(() => {
		if (isConnected) fetchBalance();
	}, [fetchBalance, isConnected]);

	// Connect wallet and persist state
	const connectWallet = useCallback(async () => {
		try {
			const isMobile = /Mobi|Android/i.test(navigator.userAgent);
			if (typeof window === "undefined" || !window.ethereum) {
				if (isMobile) {
					const currentUrl = window.location.href.replace(/^https?:\/\//, "");
					window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
					return;
				}
				throw new Error("Please install MetaMask!");
			}

			const providerInstance = getProvider();
			if (!providerInstance) throw new Error("MetaMask not installed");

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});
			if (!accounts.length) throw new Error("No accounts found");

			setIsConnected(true);
			setUserAddress(accounts[0]);
			setProvider(providerInstance);

			// Persist wallet connection state
			localStorage.setItem("walletConnected", "true");
			localStorage.setItem("walletAddress", accounts[0]);

			await fetchBalance();
			await fetchNetworkName(providerInstance);
		} catch (error) {
			console.error("Connection failed:", error);
			setErrorMessage(
				error.message === "MetaMask not installed"
					? "Please install MetaMask!"
					: "Wallet connection failed"
			);
		}
	}, [getProvider, fetchBalance, fetchNetworkName]);

	// Initial connection check
	useEffect(() => {
		const checkConnection = async () => {
			if (typeof window === "undefined" || !window.ethereum) return;

			try {
				const accounts = await window.ethereum.request({
					method: "eth_accounts",
				});
				if (accounts?.length > 0) {
					const providerInstance = getProvider();
					setIsConnected(true);
					setUserAddress(accounts[0]);
					setProvider(providerInstance);
					const balanceBN = await providerInstance.getBalance(accounts[0]);
					setBalance(ethers.formatEther(balanceBN));
					await fetchNetworkName(providerInstance);
				}
			} catch (error) {
				console.error("Initial connection check failed:", error);
			}
		};
		checkConnection();
	}, [getProvider, fetchNetworkName]);

	// Sign message
	const signMessage = useCallback(
		async (message) => {
			if (!provider) throw new Error("Wallet not connected.");
			try {
				const signer = await provider.getSigner();
				const signature = await signer.signMessage(message);
				return signature;
			} catch (error) {
				console.error("Signing failed:", error);
				throw error;
			}
		},
		[provider]
	);

	// Profile management functions
	const saveOnChain = useCallback((onChainData) => {
		setStorageInitialized(true);
		console.debug("Profile saved on-chain:", onChainData);
	}, []);

	// Fetch user profile
	const fetchUserProfile = useCallback(async () => {
		if (!isConnected || !userAddress || !provider) return;

		try {
			setIsLoading(true);
			setAccountError(null);

			// First check database
			const response = await axios.get(`${API_URL}/users/${userAddress}`, {
				headers: { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` },
			});
			console.debug("Profile response:", response.data);

			if (!response.data.success) {
				console.debug("No database profile");
				setProfile(null);
				return;
			}

			// Then check blockchain
			const contract = new ethers.Contract(
				CONTRACT_ADDRESS,
				contractABI,
				provider
			);
			const [profileURI, reputationScore, exists] =
				await contract.getUserProfile(userAddress);

			setProfile({
				...response.data.user,
				profileURI: exists ? profileURI : null,
				reputationScore: exists ? reputationScore : 0,
				existsOnChain: exists,
			});
		} catch (err) {
			console.error("Profile fetch error:", err);
			setAccountError("Failed to load profile");
		} finally {
			setIsLoading(false);
			setProfileFetched(true);
		}
	}, [isConnected, userAddress, provider]);

	// Save profile to IPFS
	const saveProfileToIPFSCallback = useCallback(
		async (profileData) => {
			try {
				setIsLoading(true);
				const ipfsHash = await uploadToIPFS(profileData);
				const ethProvider = provider || getProvider();
				const signer = await ethProvider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractABI,
					signer
				);
				const tx = await contract.updateProfileURI(ipfsHash);
				await tx.wait();
				await fetchUserProfile();
				return ipfsHash;
			} catch (error) {
				console.error("Save error:", error);
				setAccountError("Save failed");
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[fetchUserProfile, provider, getProvider]
	);

	// Handle save profile
	const handleSaveProfile = useCallback(
		async ({ profileData, setStatusMessage }) => {
			try {
				setSaving(true);
				setStatusMessage("Saving...");
				setErrorMessage("");

				let result;
				try {
					result = await saveProfileToBlockchain(
						profileData,
						setStatusMessage,
						saveOnChain
					);
				} catch (error) {
					if (error.message?.toLowerCase().includes("already registered")) {
						result = await saveProfileToIPFSCallback(profileData);
						setStatusMessage("Profile updated");
					} else {
						throw error;
					}
				}

				setStorageInitialized(true);
				setStatusMessage("Saved successfully");
				return result;
			} catch (error) {
				setErrorMessage(`Error: ${error.message}`);
				throw error;
			} finally {
				setSaving(false);
			}
		},
		[saveOnChain, saveProfileToIPFSCallback]
	);

	// Fetch profile on wallet connection
	useEffect(() => {
		if (isConnected && userAddress) fetchUserProfile();
	}, [isConnected, userAddress, fetchUserProfile]);

	// Context value
	const value = useMemo(
		() => ({
			isConnected,
			userAddress,
			balance,
			provider,
			connectWallet,
			signMessage,
			fetchBalance,
			profile,
			setProfile,
			isLoading,
			profileFetched,
			accountError,
			fetchUserProfile,
			saveProfileToIPFS: saveProfileToIPFSCallback,
			storageLoading,
			setStorageLoading,
			storageInitialized,
			setStorageInitialized,
			profileData,
			setProfileData,
			currentStep,
			setCurrentStep,
			saveOnChain,
			handleSaveProfile,
			statusMessage,
			errorMessage,
			setErrorMessage,
			networkName,
			walletAddress: userAddress,
		}),
		[
			isConnected,
			userAddress,
			balance,
			provider,
			connectWallet,
			signMessage,
			fetchBalance,
			profile,
			isLoading,
			profileFetched,
			accountError,
			fetchUserProfile,
			saveProfileToIPFSCallback,
			storageLoading,
			storageInitialized,
			profileData,
			currentStep,
			saveOnChain,
			handleSaveProfile,
			statusMessage,
			errorMessage,
			networkName,
		]
	);

	return (
		<AccountContext.Provider value={value}>{children}</AccountContext.Provider>
	);
};

export const useAccount = () => useContext(AccountContext);

AccountProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AccountProvider;
