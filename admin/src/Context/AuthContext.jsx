import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
	signInWithGoogle as firebaseSignInWithGoogle,
	subscribeToUser,
	googleLogout,
} from "../../firebaseConfig";
import {
	showToast,
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
import axios from "axios";
import { notification } from "antd";
import { useAccount } from "./AccountContext";

export const AuthContext = createContext({
	user: null,
	loginHistory: [],
	isLoading: false,
	error: null,
	fetchLoginHistory: () => {},
	// ... other existing context values ...
});

export const AuthProvider = ({ children }) => {
	const { walletAddress } = useAccount();
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
		loginHistory: getStorageItem(STORAGE_KEYS.LOGIN_HISTORY) || [],
	});

	// Update localStorage when relevant state changes
	useEffect(() => {
		if (authState.user) {
			setStorageItem(STORAGE_KEYS.USER, authState.user);
		}
		if (authState.token) {
			setStorageItem(STORAGE_KEYS.AUTH_TOKEN, authState.token);
		}
		if (authState.loginHistory.length > 0) {
			setStorageItem(STORAGE_KEYS.LOGIN_HISTORY, authState.loginHistory);
		}
	}, [authState.user, authState.token, authState.loginHistory]);

	// Fetch user data when wallet address changes - Critical data
	useEffect(() => {
		const fetchInitialUserData = async () => {
			if (walletAddress) {
				try {
					setAuthState((prev) => ({ ...prev, isFetchingCriticalData: true }));
					const normalizedWalletAddress = walletAddress.toLowerCase();
					const response = await axios.get(`/users/${normalizedWalletAddress}`);

					if (response.data?.success && response.data.user) {
						const mappedUser = {
							...response.data.user,
							photoURL: response.data.user.profileImage,
							acceptBlockchainStorage:
								response.data.user.acceptBlockchainStorage || false,
							gender: response.data.user.gender || null,
						};

						setAuthState((prev) => ({
							...prev,
							user: mappedUser,
							error: null,
							isFetchingCriticalData: false,
							isLoading: false,
							isInitialized: true,
						}));

						// After critical data is loaded, fetch non-critical data
						fetchLoginHistory();
					} else {
						setAuthState((prev) => ({
							...prev,
							user: null,
							error: null,
							isFetchingCriticalData: false,
							isLoading: false,
							isInitialized: true,
						}));
					}
				} catch (error) {
					console.error("Failed to fetch initial user data:", error);
					setAuthState((prev) => ({
						...prev,
						error: error.message,
						isFetchingCriticalData: false,
						isLoading: false,
						isInitialized: true,
					}));
				}
			} else {
				setAuthState((prev) => ({
					...prev,
					user: null,
					error: null,
					isFetchingCriticalData: false,
					isLoading: false,
					isInitialized: true,
				}));
			}
		};

		fetchInitialUserData();
	}, [walletAddress]);

	const fetchLoginHistory = async () => {
		if (!walletAddress) {
			console.log("No wallet address available, skipping login history fetch");
			return;
		}

		try {
			setAuthState((prev) => ({ ...prev, isFetchingNonCriticalData: true }));
			const normalizedWalletAddress = walletAddress.toLowerCase();
			const response = await axios.get(
				`/users/${normalizedWalletAddress}/login-history`
			);

			if (response.data?.success && response.data.loginHistory) {
				const formattedHistory = response.data.loginHistory.map((entry) => ({
					...entry,
					deviceInfo: {
						browser: entry.browser,
						browserVersion: entry.browserVersion,
						os: entry.os,
						osVersion: entry.osVersion,
						device: entry.device,
						deviceType: entry.deviceType,
					},
				}));

				setAuthState((prev) => ({
					...prev,
					loginHistory: formattedHistory,
					isFetchingNonCriticalData: false,
				}));
				return formattedHistory;
			}

			console.error("Invalid login history response format:", response.data);
			setAuthState((prev) => ({ ...prev, isFetchingNonCriticalData: false }));
			return [];
		} catch (error) {
			console.error("Failed to fetch login history:", error);
			setAuthState((prev) => ({ ...prev, isFetchingNonCriticalData: false }));
			return [];
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
						name: firebaseUser.name,
						email: firebaseUser.email,
						photoURL: firebaseUser.photoURL,
					};

					setAuthState((prev) => ({
						...prev,
						isInitialized: true,
						isLoading: true,
						isFetchingCriticalData: true,
						googleUser: userData,
						token: firebaseUser.accessToken || null,
					}));

					if (firebaseUser.accessToken) {
						localStorage.setItem("auth_token", firebaseUser.accessToken);
						axios.defaults.headers.common[
							"Authorization"
						] = `Bearer ${firebaseUser.accessToken}`;

						try {
							await fetchUserData();
						} catch (error) {
							console.error("Failed to fetch user data:", error);
						}
					}

					setAuthState((prev) => ({
						...prev,
						isLoading: false,
						isFetchingCriticalData: false,
					}));
				} else {
					localStorage.removeItem("auth_token");
					localStorage.removeItem("google_user");
					delete axios.defaults.headers.common["Authorization"];

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
						loginHistory: [],
					});
				}
			});
		};

		initializeAuth();
		return () => unsubscribe?.();
	}, []);

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

		const normalizedWalletAddress = walletAddress.toLowerCase();
		console.log(
			"Attempting to fetch user data with normalized wallet address:",
			normalizedWalletAddress
		);

		for (let i = 0; i < retries; i++) {
			try {
				const response = await axios.get(`/users/${normalizedWalletAddress}`);

				if (response.data?.success && response.data.user) {
					const mappedUser = {
						...response.data.user,
						photoURL: response.data.user.profileImage,
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
					}));

					return mappedUser;
				}

				console.log("No valid user data received from server");
				setAuthState((prev) => ({
					...prev,
					user: null,
					error: null,
					isInitialized: true,
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
					}));
					throw error;
				}
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	};

	const signInWithGoogle = async () => {
		const toastId = showLoadingToast(
			"Signing in with Google...",
			TOAST_IDS.GOOGLE_SIGNIN
		);

		try {
			setAuthState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
				status: "pending",
			}));

			notification.info({
				message: "Initializing Google Sign-in",
				description: "Opening Google sign-in popup...",
				duration: 3,
			});

			const result = await firebaseSignInWithGoogle();

			if (!result?.userData) {
				throw new Error("Failed to get Google user data");
			}

			notification.info({
				message: "Verifying Google account",
				description: "Please wait while we verify your account...",
				duration: 3,
			});

			const { token, userData } = result;

			const googleUser = {
				uid: userData.uid,
				name: userData.name,
				email: userData.email,
				photoURL: userData.photoURL,
			};

			if (token) {
				localStorage.setItem("auth_token", token);
				axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			}

			setAuthState((prev) => ({
				...prev,
				googleUser,
				token,
				isLoading: false,
				error: null,
				status: "success",
			}));

			localStorage.setItem("google_user", JSON.stringify(googleUser));

			notification.success({
				message: "Successfully signed in!",
				description: `Welcome back, ${googleUser.name}!`,
				duration: 4,
			});

			updateToast(
				toastId,
				"Successfully signed in with Google!",
				TOAST_TYPES.SUCCESS
			);

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

			notification.error({
				message: "Sign-in Failed",
				description: errorMessage,
				duration: 4,
			});

			updateToast(toastId, errorMessage, TOAST_TYPES.ERROR);
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
				loginHistory: [],
			});

			showToast("👋 Logged out successfully", TOAST_TYPES.SUCCESS);
		} catch (error) {
			setAuthState((prev) => ({
				...prev,
				isLoading: false,
				error: "Failed to logout",
			}));
			showToast("Failed to logout", TOAST_TYPES.ERROR);
		}
	};

	const value = {
		...authState,
		signInWithGoogle,
		logout,
		isAuthenticated: !!authState.googleUser,
		fetchUserData,
		fetchLoginHistory,
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
