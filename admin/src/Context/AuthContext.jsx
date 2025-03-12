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

export const AuthContext = createContext({
	user: null,
	isLoading: false,
	error: null,
	// ... other existing context values ...
});

export const AuthProvider = ({ children }) => {
	const { walletAddress } = useAccount();
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
		token: getStorageItem(STORAGE_KEYS.AUTH_TOKEN),
		status: "idle",
	});

	// Update localStorage when relevant state changes
	useEffect(() => {
		if (authState.user) {
			setStorageItem(STORAGE_KEYS.USER, authState.user);
		}
		if (authState.token) {
			setStorageItem(STORAGE_KEYS.AUTH_TOKEN, authState.token);
		}
	}, [authState.user, authState.token]);

	const fetchUserData = async (retries = 3, delay = 1000) => {
		if (!walletAddress) {
			console.log("No wallet address available, skipping user data fetch");
			setAuthState((prev) => ({
				...prev,
				user: null,
				isInitialized: true,
			}));
			return null;
		}

		// If there's already a fetch in progress, don't start another one
		if (currentFetchRef.current) {
			return currentFetchRef.current;
		}

		const normalizedWalletAddress = walletAddress.toLowerCase();
		console.log(
			"Attempting to fetch user data with normalized wallet address:",
			normalizedWalletAddress
		);

		// Create a promise for the current fetch operation
		currentFetchRef.current = (async () => {
			for (let i = 0; i < retries; i++) {
				try {
					const response = await axios.get(`/users/${normalizedWalletAddress}`);

					if (response.data?.success && response.data.user) {
						const mappedUser = {
							...response.data.user,
							photoURL: (
								response.data.user.profileImage || response.data.user.photoURL
							)?.replace(/=s\d+-c/, "=s64-c"),
							profileImage: (
								response.data.user.profileImage || response.data.user.photoURL
							)?.replace(/=s\d+-c/, "=s64-c"),
							acceptBlockchainStorage:
								response.data.user.acceptBlockchainStorage || false,
							gender: response.data.user.gender || null,
						};

						console.log("Successfully mapped user data:", mappedUser);

						setAuthState((prev) => ({
							...prev,
							user: mappedUser,
							googleUser:
								prev.googleUser?.email === mappedUser.email
									? mappedUser
									: prev.googleUser,
							error: null,
							isInitialized: true,
							isFetchingCriticalData: false,
							isLoading: false,
						}));

						hasInitialized.current = true;
						return mappedUser;
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

					if (firebaseUser.accessToken) {
						localStorage.setItem("auth_token", firebaseUser.accessToken);
						axios.defaults.headers.common[
							"Authorization"
						] = `Bearer ${firebaseUser.accessToken}`;
					}

					// Set initial state
					setAuthState((prev) => ({
						...prev,
						isInitialized: true,
						isLoading: true,
						isFetchingCriticalData: true,
						googleUser: userData,
						token: firebaseUser.accessToken || null,
					}));

					// If we have a wallet address and haven't initialized yet, fetch user data
					if (walletAddress && !hasInitialized.current) {
						await fetchUserData();
					} else {
						setAuthState((prev) => ({
							...prev,
							isFetchingCriticalData: false,
							isLoading: false,
						}));
					}
				} else {
					localStorage.removeItem("auth_token");
					localStorage.removeItem("google_user");
					delete axios.defaults.headers.common["Authorization"];
					hasInitialized.current = false;

					setAuthState({
						isInitialized: true,
						isLoading: false,
						isFetchingCriticalData: false,
						isFetchingNonCriticalData: false,
						googleUser: null,
						user: null,
						token: null,
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

			showInfoMessage("Verifying Google account...");

			const { token, userData } = result;
			console.log("Raw user data from Firebase:", userData);

			const googleUser = {
				uid: userData.uid,
				name: userData.name || userData.displayName,
				email: userData.email,
				photoURL: userData.photoURL || null,
			};

			console.log("Processed Google user data with photo:", googleUser);

			if (token) {
				localStorage.setItem("auth_token", token);
				axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			}

			// Store the complete user object
			localStorage.setItem("google_user", JSON.stringify(googleUser));

			setAuthState((prev) => ({
				...prev,
				googleUser,
				token,
				isLoading: false,
				error: null,
				status: "success",
			}));

			showSuccessMessage(`Welcome back, ${googleUser.name}!`);
			return { userData: googleUser, token };
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
