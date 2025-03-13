import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
	signInWithGoogle as firebaseSignInWithGoogle,
	subscribeToUser,
	googleLogout,
} from "../../firebaseConfig";
import {
	setStorageItem,
	getStorageItem,
	clearStorage,
	STORAGE_KEYS,
} from "../utils/storage";
import axios from "axios";
import { useAccount } from "./AccountContext";
import {
	showSuccessMessage,
	showErrorNotification,
	showInfoMessage,
} from "../utils/errors";
import { ethers } from "ethers";

export const AuthContext = createContext({
	user: null,
	isLoading: false,
	error: null,
	// ... other existing context values ...
});

export const AuthProvider = ({ children }) => {
	const { walletAddress, provider, chainId, setupAxiosInterceptors } =
		useAccount();
	const hasInitialized = useRef(false);
	const currentFetchRef = useRef(null);
	const [authState, setAuthState] = useState({
		isInitialized: false,
		isLoading: true,
		isFetchingCriticalData: false,
		isFetchingNonCriticalData: false,
		googleUser: getStorageItem(STORAGE_KEYS.USER),
		user: getStorageItem(STORAGE_KEYS.USER),
		error: null,
		token: getStorageItem(STORAGE_KEYS.token),
		firebaseToken: getStorageItem(STORAGE_KEYS.FIREBASE_TOKEN),
		status: "idle",
	});

	// Initialize token on mount and when it changes
	useEffect(() => {
		const token = getStorageItem(STORAGE_KEYS.token);
		if (token) {
			setupAxiosInterceptors(token);
			setAuthState((prev) => ({ ...prev, token }));
		}
	}, [setupAxiosInterceptors]);

	// Update localStorage and axios interceptors when token changes
	useEffect(() => {
		if (authState.token) {
			setStorageItem(STORAGE_KEYS.token, authState.token);
			setupAxiosInterceptors(authState.token);
		}
	}, [authState.token, setupAxiosInterceptors]);

	const generateSignatureMessage = (walletAddress) => {
		return `Welcome to Tredit!\n\nWallet: ${walletAddress}\nNonce: ${Date.now()}\n\nSign this message to verify your wallet ownership.`;
	};

	const fetchUserData = async (retries = 3, delay = 1000) => {
		if (!walletAddress || !provider) {
			console.log(
				"No wallet address or provider available, skipping user data fetch"
			);
			setAuthState((prev) => ({
				...prev,
				user: null,
				isInitialized: true,
				isLoading: false,
			}));
			return null;
		}

		if (currentFetchRef.current) {
			return currentFetchRef.current;
		}

		const normalizedWalletAddress = walletAddress.toLowerCase();
		console.log(
			"Attempting to fetch user data with normalized wallet address:",
			normalizedWalletAddress
		);

		currentFetchRef.current = (async () => {
			for (let i = 0; i < retries; i++) {
				try {
					const message = generateSignatureMessage(normalizedWalletAddress);
					const signer = await provider.getSigner();
					const signature = await signer.signMessage(message);

					console.log("Generated signature:", { message, signature, chainId });

					const authResponse = await axios.post("/users/wallet-auth", {
						walletAddress: normalizedWalletAddress,
						signature,
						message,
						chainId,
					});

					if (authResponse.data?.success) {
						console.log("Successfully fetched user data:", authResponse.data);
						const { token, user: userData, hasProfile } = authResponse.data;

						if (token) {
							setStorageItem(STORAGE_KEYS.token, token);
							setupAxiosInterceptors(token);

							setAuthState((prev) => ({
								...prev,
								token,
								user: hasProfile ? userData : null,
								error: null,
								isInitialized: true,
								isFetchingCriticalData: false,
								isLoading: false,
							}));

							return hasProfile ? userData : null;
						}
					}

					console.log("No valid user data received from server");
					setAuthState((prev) => ({
						...prev,
						user: null,
						error: null,
						isInitialized: true,
						isFetchingCriticalData: false,
						isLoading: false,
					}));
					return null;
				} catch (error) {
					console.error(
						`Attempt ${i + 1} failed to fetch user data:`,
						error.response || error
					);
					if (i === retries - 1) {
						setAuthState((prev) => ({
							...prev,
							user: null,
							error: error.message,
							isInitialized: true,
							isFetchingCriticalData: false,
							isLoading: false,
						}));
						throw error;
					}
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		})();

		try {
			const result = await currentFetchRef.current;
			return result;
		} finally {
			currentFetchRef.current = null;
		}
	};

	// Initialize auth state and subscribe to changes
	useEffect(() => {
		let unsubscribe;

		const initializeAuth = async () => {
			unsubscribe = subscribeToUser(async (firebaseUser) => {
				if (firebaseUser) {
					const userData = {
						uid: firebaseUser.uid,
						name: firebaseUser.name || firebaseUser.displayName,
						email: firebaseUser.email,
						photoURL: firebaseUser.photoURL?.replace(/=s\d+-c/, "=s64-c"),
						profileImage: firebaseUser.photoURL?.replace(/=s\d+-c/, "=s64-c"),
					};

					// Store Firebase token directly
					if (firebaseUser.accessToken) {
						setStorageItem(
							STORAGE_KEYS.FIREBASE_TOKEN,
							firebaseUser.accessToken
						);
					}

					// Set initial state with Google user data only
					setAuthState((prev) => ({
						...prev,
						isInitialized: true,
						isLoading: true,
						isFetchingCriticalData: true,
						googleUser: userData,
						firebaseToken: firebaseUser.accessToken,
					}));

					// If we have a wallet address, fetch user data
					if (walletAddress && !hasInitialized.current) {
						await fetchUserData();
					}

					setAuthState((prev) => ({
						...prev,
						isFetchingCriticalData: false,
						isLoading: false,
					}));
				} else {
					// Clear auth data but keep API token
					const apiToken = getStorageItem(STORAGE_KEYS.token);
					clearStorage();
					if (apiToken) {
						setStorageItem(STORAGE_KEYS.token, apiToken);
						setupAxiosInterceptors(apiToken);
					}
					hasInitialized.current = false;

					setAuthState({
						isInitialized: true,
						isLoading: false,
						isFetchingCriticalData: false,
						isFetchingNonCriticalData: false,
						googleUser: null,
						user: null,
						token: apiToken || null,
						firebaseToken: null,
						error: null,
						status: "idle",
					});
				}
			});
		};

		initializeAuth();
		return () => unsubscribe?.();
	}, [walletAddress]);

	// Update the reset refs effect
	useEffect(() => {
		hasInitialized.current = false;
		currentFetchRef.current = null;
	}, [walletAddress]);

	const signInWithGoogle = async () => {
		try {
			setAuthState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
				status: "pending",
			}));

			showInfoMessage("Initializing Google Sign-in...");

			const result = await firebaseSignInWithGoogle();
			console.log("Firebase sign-in result:", result);

			if (!result?.userData) {
				throw new Error("Failed to get Google user data");
			}

			const { token: firebaseToken, userData } = result;

			// Store Firebase token using storage utility
			if (firebaseToken) {
				setStorageItem(STORAGE_KEYS.FIREBASE_TOKEN, firebaseToken);

				const googleUser = {
					uid: userData.uid,
					name: userData.name || userData.displayName,
					email: userData.email,
					photoURL: userData.photoURL || null,
				};

				setAuthState((prev) => ({
					...prev,
					firebaseToken,
					googleUser,
					isLoading: false,
					error: null,
					status: "success",
				}));

				setStorageItem(STORAGE_KEYS.GOOGLE_USER, googleUser);
				showSuccessMessage(`Welcome back, ${googleUser.name}!`);
				return { userData: googleUser, firebaseToken };
			}

			throw new Error("Failed to get Google user data");
		} catch (error) {
			let errorMessage = "";

			if (error.code === "auth/popup-closed-by-user") {
				errorMessage = "Sign-in cancelled. Please try again.";
			} else if (error.code === "auth/popup-blocked") {
				errorMessage = "Pop-up blocked. Please allow pop-ups for this site.";
			} else {
				errorMessage = "Failed to sign in with Google";
			}

			setAuthState((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
				googleUser: null,
				token: null,
				firebaseToken: null,
				status: "error",
			}));

			showErrorNotification(new Error(errorMessage));
			throw error;
		}
	};

	const logout = async () => {
		try {
			setAuthState((prev) => ({ ...prev, isLoading: true }));
			await googleLogout();

			// Clear token and interceptor
			setupAxiosInterceptors(null);
			clearStorage();

			setAuthState({
				isInitialized: true,
				isLoading: false,
				googleUser: null,
				error: null,
				token: null,
			});

			showSuccessMessage("Logged out successfully");
		} catch (error) {
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: "Failed to logout",
			}));
			showErrorNotification(error);
		}
	};

	const value = {
		...authState,
		signInWithGoogle,
		logout,
		isAuthenticated: !!authState.googleUser,
		fetchUserData,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AuthProvider;
