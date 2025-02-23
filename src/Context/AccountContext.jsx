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
import {
	uploadToIPFS,
	fetchFromIPFS,
	saveProfileToBlockchain,
} from "../utils/ipfsHelper";

// Shared constants for on-chain profile functions
const contractABI = [
	"function getUserProfile(address _user) view returns (tuple(string profileURI, uint reputationScore, bool exists))",
	"function updateProfileURI(string memory newProfileURI) public",
];
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

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

	// Auto-refresh balance when dependencies change
	useEffect(() => {
		if (isConnected) fetchBalance();
	}, [fetchBalance, isConnected]);

	const connectWallet = useCallback(async () => {
		try {
			const providerInstance = getProvider();
			if (!providerInstance) throw new Error("MetaMask not installed");

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});
			if (!accounts.length) throw new Error("No accounts found");

			const account = accounts[0];
			setIsConnected(true);
			setUserAddress(account);
			setProvider(providerInstance);

			// Fetch initial balance and network
			const balanceBN = await providerInstance.getBalance(account);
			setBalance(ethers.formatEther(balanceBN));
			await fetchNetworkName(providerInstance);
		} catch (error) {
			console.error("Connection failed:", error);
			setErrorMessage("Wallet connection failed");
		}
	}, [getProvider, fetchNetworkName]);

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

					// Directly fetch using current instance
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

	const signMessage = useCallback(
		async (message) => {
			if (!provider) throw new Error("Wallet not connected.");
			try {
				const signer = await provider.getSigner();
				const signature = await signer.signMessage(message);
				console.debug("Message signed:", signature);
				return signature;
			} catch (error) {
				console.error("Signing failed:", error);
				throw error;
			}
		},
		[provider]
	);

	// Callback to update context state after on-chain profile save.
	const saveOnChain = useCallback((onChainData) => {
		setStorageInitialized(true);
		console.debug("Profile saved on-chain:", onChainData);
	}, []);

	const fetchUserProfile = useCallback(async () => {
		if (!isConnected || !userAddress) {
			console.debug("Skipping profile fetch: Wallet not connected.");
			return;
		}
		try {
			setIsLoading(true);
			setAccountError(null);
			const ethProvider =
				provider || new ethers.BrowserProvider(window.ethereum);
			const contract = new ethers.Contract(
				CONTRACT_ADDRESS,
				contractABI,
				ethProvider
			);
			console.debug("Fetching profile for address:", userAddress);
			const userData = await contract.getUserProfile(userAddress);
			const [profileURI, reputationScore, exists] = userData;
			if (!exists) {
				console.debug("No profile exists for the user.");
				setProfile(null);
			} else {
				let fullProfile = { reputationScore };
				if (profileURI) {
					console.debug("Profile URI found, fetching IPFS data...");
					const ipfsData = await fetchFromIPFS(profileURI);
					fullProfile = { ...fullProfile, ...ipfsData, profileURI };
				}
				setProfile(fullProfile);
				console.debug("Profile fetched:", fullProfile);
			}
		} catch (err) {
			console.error("Error fetching user profile:", err);
			setAccountError("Failed to load profile. Please try again.");
		} finally {
			setIsLoading(false);
			setProfileFetched(true);
		}
	}, [isConnected, userAddress, provider]);

	// Legacy function to update profile URI via IPFS upload.
	const saveProfileToIPFSCallback = useCallback(
		async (profileData) => {
			try {
				setIsLoading(true);
				const ipfsHash = await uploadToIPFS(profileData);
				console.debug("Uploaded profile data to IPFS:", ipfsHash);
				const ethProvider =
					provider || new ethers.BrowserProvider(window.ethereum);
				const signer = await ethProvider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					contractABI,
					signer
				);
				const tx = await contract.updateProfileURI(ipfsHash);
				await tx.wait();
				console.debug("Profile URI updated on-chain.");
				await fetchUserProfile();
				return ipfsHash;
			} catch (error) {
				console.error("Error saving profile:", error);
				setAccountError("Failed to save profile. Try again.");
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[fetchUserProfile, provider]
	);

	useEffect(() => {
		const checkConnection = async () => {
			if (typeof window !== "undefined" && window.ethereum) {
				try {
					const accounts = await window.ethereum.request({
						method: "eth_accounts",
					});
					if (accounts && accounts.length > 0) {
						console.debug("Existing accounts found:", accounts);
						const account = accounts[0];
						setIsConnected(true);
						setUserAddress(account);
						setProvider(getProvider());
						fetchBalance;
						console.debug("Wallet connected:", account);
					} else {
						console.debug("No connected accounts found.");
					}
				} catch (error) {
					console.error("Error checking connected accounts:", error);
				}
			}
		};
		checkConnection();
	}, [getProvider]);

	useEffect(() => {
		if (isConnected && userAddress) {
			fetchUserProfile();
		} else {
			console.debug("Wallet not connected; skipping profile fetch.");
		}
	}, [isConnected, userAddress, fetchUserProfile]);

	// Define handleSaveProfile in context.
	// It wraps saveProfileToBlockchain and updates context state.
	// It first attempts to register the user.
	// If registration fails because the user is already registered, it falls back to updating the profile URI.
	const handleSaveProfile = useCallback(
		async ({ profileData, setStatusMessage }) => {
			try {
				setSaving(true);
				setStatusMessage("Initializing storage...");
				setErrorMessage("");
				setStorageLoading(true);
				let result;
				try {
					// Attempt to register the user.
					result = await saveProfileToBlockchain(
						profileData,
						setStatusMessage,
						saveOnChain
					);
				} catch (error) {
					// If the error indicates the user is already registered, fall back to updating.
					if (
						error.message &&
						error.message.toLowerCase().includes("user already registered")
					) {
						console.warn("User already registered; updating profile instead.");
						result = await saveProfileToIPFSCallback(profileData);
						setStatusMessage("Profile updated successfully on blockchain!");
					} else {
						throw error;
					}
				}
				console.log(
					"Profile saved on-chain. Transaction:",
					result.tx,
					"IPFS URL:",
					result.ipfsUrl
				);
				setStorageInitialized(true);
				setStatusMessage("Profile saved successfully on blockchain!");
				return result;
			} catch (error) {
				setErrorMessage(`Error: ${error.message}`);
				throw error;
			} finally {
				setSaving(false);
				setStorageLoading(false);
			}
		},
		[saveOnChain, saveProfileToIPFSCallback]
	);

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
			setErrorMessage,
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
