import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
} from "react";
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
import { useAccount, CONNECTION_STATES } from "./AccountContext";
import { setupAxiosInterceptors } from "../App";
import {
	showSuccessMessage,
	showErrorNotification,
	showInfoMessage,
} from "../utils/errors";
import { ethers } from "ethers";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";

export const AuthContext = createContext({
	user: null,
	isLoading: false,
	error: null,
	// ... other existing context values ...
});

const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper function to log token details
const logTokenDetails = (token, source) => {
	if (!token) {
		console.log(`❌ Auth: No token found from ${source}`);
		return;
	}

	try {
		// Split JWT and get payload part
		const parts = token.split(".");
		if (parts.length !== 3) {
			console.log(`⚠️ Auth: Invalid token format from ${source}:`, token);
			return;
		}

		// Decode the payload
		const payload = JSON.parse(atob(parts[1]));

		// Log token details including the full token
		console.log(`🔑 Auth: Token from ${source}:`, {
			token: token, // Full token for debugging
			iat: new Date(payload.iat * 1000).toLocaleString(),
			exp: new Date(payload.exp * 1000).toLocaleString(),
			expiresIn:
				Math.round((payload.exp - Date.now() / 1000) / 60) + " minutes",
			walletAddress: payload.walletAddress || payload.sub,
			id: payload.id,
		});
	} catch (error) {
		console.log(`⚠️ Auth: Error parsing token from ${source}:`, error);
		// Log the raw token even if parsing fails
		console.log(`🔑 Auth: Raw token from ${source}:`, token);
	}
};

export const AuthProvider = ({ children }) => {
	const { walletAddress, provider, chainId } = useAccount();
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

	// Fetch user data when wallet address changes
	useEffect(() => {
		const fetchUserData = async () => {
			if (!walletAddress || !authState.token) return;

			try {
				setAuthState((prev) => ({
					...prev,
					isFetchingCriticalData: true,
				}));

				// Log token being used for API call
				logTokenDetails(authState.token, "fetchUserData API call");

				// Log the full API URL to debug
				const apiUrl = `${API_URL}/users/profile/${walletAddress.toLowerCase()}`;
				console.log("🔍 Fetching profile data from:", apiUrl);

				const response = await axios.get(apiUrl);

				// Log the response for debugging
				console.log("👨‍💼 Profile API response:", {
					success: response.data?.success,
					hasUser: !!response.data?.user,
					statusCode: response.status,
					dataKeys: Object.keys(response.data || {}),
				});

				if (response.data?.success) {
					const userData = response.data.user;

					setAuthState((prev) => ({
						...prev,
						user: userData,
						isFetchingCriticalData: false,
					}));

					setStorageItem(STORAGE_KEYS.USER, userData);
				}
			} catch (error) {
				console.error("Error fetching user data:", error);

				// Handle specific error cases based on API documentation
				if (error.response?.status === 404) {
					const isUserNotFoundError =
						error.response?.data?.code === "NOT_FOUND";

					if (isUserNotFoundError) {
						const currentPath = window.location.pathname;

						if (walletAddress) {
							setStorageItem(
								STORAGE_KEYS.WALLET_ADDRESS,
								walletAddress.toLowerCase()
							);
						}

						if (currentPath !== "/profile-setup") {
							console.log("User not found (404), redirecting to profile-setup");
							window.location.href = "/profile-setup";
						}

						setAuthState((prev) => ({
							...prev,
							isFetchingCriticalData: false,
							user: null,
						}));
					}
				} else if (error.response?.status === 401) {
					clearStorage();
					window.dispatchEvent(new Event("walletDisconnected"));

					setAuthState((prev) => ({
						...prev,
						isFetchingCriticalData: false,
						error: error.message,
						user: null,
						token: null,
					}));
				} else if (error.response?.status === 403) {
					setAuthState((prev) => ({
						...prev,
						isFetchingCriticalData: false,
						error: "Not authorized to access this profile",
					}));
				} else {
					setAuthState((prev) => ({
						...prev,
						isFetchingCriticalData: false,
						error: error.message,
					}));
				}
			}
		};

		fetchUserData();
	}, [walletAddress, authState.token]);

	// Handle wallet disconnection
	useEffect(() => {
		const handleWalletDisconnect = () => {
			clearStorage();
			setAuthState({
				isInitialized: true,
				isLoading: false,
				isFetchingCriticalData: false,
				isFetchingNonCriticalData: false,
				googleUser: null,
				user: null,
				token: null,
				firebaseToken: null,
				error: null,
				status: "idle",
			});
		};

		window.addEventListener("walletDisconnected", handleWalletDisconnect);
		return () =>
			window.removeEventListener("walletDisconnected", handleWalletDisconnect);
	}, []);

	const generateSignatureMessage = (walletAddress) => {
		const nonce = Date.now();
		return `Welcome to Tredit!\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nSign this message to verify your wallet ownership.`;
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

					// Log the endpoint being used
					console.log(
						"🔐 Sending wallet auth request to:",
						`/users/wallet-auth`
					);

					const authResponse = await axios.post("/users/wallet-auth", {
						walletAddress: normalizedWalletAddress,
						signature,
						message,
						chainId,
					});

					// Log the full response structure for debugging
					console.log("Wallet authentication API response:", {
						success: authResponse.data?.success,
						hasToken: !!authResponse.data?.token,
						hasUser: !!authResponse.data?.user,
						exists: authResponse.data?.exists,
						hasProfile: authResponse.data?.hasProfile,
						statusCode: authResponse.status,
						dataKeys: Object.keys(authResponse.data || {}),
					});

					if (authResponse.data?.success) {
						// Extract all relevant data from the response
						const {
							token,
							user: userData,
							exists,
							hasProfile,
						} = authResponse.data;

						// Log token details from authentication
						if (token) {
							logTokenDetails(token, "wallet-auth response");
						}

						if (token) {
							// We have a valid token, which means authentication was successful
							setStorageItem(STORAGE_KEYS.token, token);

							// Set axios authorization header
							axios.defaults.headers.common[
								"Authorization"
							] = `Bearer ${token}`;
							console.log("Auth: Set Authorization header with token");

							// After getting token, try to fetch the profile directly
							try {
								// Use the correct API endpoint to fetch profile
								const profileUrl = `${API_URL}/profile/${normalizedWalletAddress}`;
								console.log("🔍 Fetching profile with token from:", profileUrl);

								const profileResponse = await axios.get(profileUrl);

								console.log("👨‍💼 Profile response after auth:", {
									success: profileResponse.data?.success,
									hasUser: !!profileResponse.data?.user,
									statusCode: profileResponse.status,
								});

								if (
									profileResponse.data?.success &&
									profileResponse.data?.user
								) {
									const profileData = profileResponse.data.user;

									// Format and store the user data
									const formattedUserData = {
										...profileData,
										photoURL: (
											profileData.profileImage || profileData.photoURL
										)?.replace("=s96-c", "=s400-c"),
										profileImage: (
											profileData.profileImage || profileData.photoURL
										)?.replace("=s96-c", "=s400-c"),
									};

									setStorageItem(STORAGE_KEYS.USER, formattedUserData);

									setAuthState((prev) => ({
										...prev,
										token,
										user: formattedUserData,
										error: null,
										isInitialized: true,
										isFetchingCriticalData: false,
										isLoading: false,
									}));

									showSuccessMessage("Successfully authenticated with wallet!");
									return formattedUserData;
								}
							} catch (profileError) {
								console.error(
									"Error fetching profile after auth:",
									profileError
								);
								// Continue with existing flow if profile fetch fails
							}

							// Update user data with proper structure if we have it
							let formattedUserData = null;
							if (userData) {
								formattedUserData = {
									...userData,
									photoURL: (
										userData.profileImage || userData.photoURL
									)?.replace("=s96-c", "=s400-c"),
									profileImage: (
										userData.profileImage || userData.photoURL
									)?.replace("=s96-c", "=s400-c"),
								};
							}

							// Store the formatted user data if we have it
							if (formattedUserData) {
								console.log(
									"User data available, storing in state and localStorage"
								);
								setStorageItem(STORAGE_KEYS.USER, formattedUserData);

								setAuthState((prev) => ({
									...prev,
									token,
									user: formattedUserData,
									error: null,
									isInitialized: true,
									isFetchingCriticalData: false,
									isLoading: false,
								}));

								showSuccessMessage("Successfully authenticated with wallet!");
								return formattedUserData;
							} else {
								// We have a token but no user data - this is unusual
								console.log(
									"Token received but no user data - checking 'exists' flag"
								);

								setAuthState((prev) => ({
									...prev,
									token,
									user: null,
									error: null,
									isInitialized: true,
									isFetchingCriticalData: false,
									isLoading: false,
								}));

								// Only redirect to profile setup if explicitly told user doesn't exist
								if (exists === false) {
									console.log(
										"API indicates user does not exist - redirecting to profile setup"
									);

									// Only redirect if we're not already on profile-setup
									if (window.location.pathname !== "/profile-setup") {
										showInfoMessage(
											"Your wallet is connected but you need to create a profile."
										);
										window.location.href = "/profile-setup";
									}
									return null;
								}

								console.log(
									"Token exists but user data is missing - not redirecting"
								);
								return null;
							}
						} else {
							// No token in the response, but may have other information
							console.log(
								"No token in authentication response - checking existence flags"
							);

							// Update state to indicate no user data
							setAuthState((prev) => ({
								...prev,
								token: null,
								user: null,
								error: null,
								isInitialized: true,
								isFetchingCriticalData: false,
								isLoading: false,
							}));

							// Only redirect if explicitly told user needs profile
							if (exists === false || hasProfile === false) {
								console.log(
									"User existence/profile flags indicate profile setup needed"
								);

								// Only redirect if not already on profile-setup
								if (window.location.pathname !== "/profile-setup") {
									showInfoMessage("Please complete your profile setup");
									window.location.href = "/profile-setup";
								}
							}

							return null;
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

					// Handle 404 error (user not found)
					if (error.response?.status === 404) {
						// Check if the error is specifically for user not found based on the API response structure
						const isUserNotFoundError =
							error.response?.data?.error === "User not found" ||
							error.response?.data?.exists === false;

						console.log("404 Response details in fetchUserData:", {
							isUserNotFoundError,
							errorData: error.response?.data,
							statusText: error.response?.statusText,
							url: error.response?.config?.url,
						});

						// Only redirect if it's clearly a user-not-found error
						if (isUserNotFoundError) {
							console.log("User not found (404), redirecting to profile setup");

							// Save wallet info but navigate to profile setup
							setStorageItem(
								STORAGE_KEYS.WALLET_ADDRESS,
								normalizedWalletAddress
							);

							// Set state to indicate connected wallet but no profile
							setAuthState((prev) => ({
								...prev,
								user: null,
								error: null,
								isInitialized: true,
								isFetchingCriticalData: false,
								isLoading: false,
							}));

							// Navigate to profile setup page
							const currentPath = window.location.pathname;
							if (currentPath !== "/profile-setup") {
								showInfoMessage(
									"Your wallet is connected but you need to create a profile."
								);
								window.location.href = "/profile-setup";
							}

							return null;
						} else {
							// For other 404 errors, just log and set state without redirecting
							console.log("404 error but not user-not-found, not redirecting");
							setAuthState((prev) => ({
								...prev,
								error:
									"Error fetching user data: " +
									(error.message || "Unknown error"),
								isInitialized: true,
								isFetchingCriticalData: false,
								isLoading: false,
							}));
							return null;
						}
					}

					// Handle account suspended
					if (
						error.response?.data?.status === "suspended" ||
						error.response?.data?.error === "Account suspended"
					) {
						showErrorNotification(
							new Error(
								"Your account has been suspended. Please contact support."
							)
						);
						setAuthState((prev) => ({
							...prev,
							error: "Account suspended",
							isInitialized: true,
							isFetchingCriticalData: false,
							isLoading: false,
						}));

						// Navigate to connect page
						if (window.location.pathname !== "/connect") {
							window.location.href = "/connect";
						}

						return null;
					}

					// Handle wallet address format issue
					if (error.response?.data?.error === "Invalid wallet address format") {
						showErrorNotification(
							new Error(
								"Invalid wallet address format. Please check your wallet connection."
							)
						);
						setAuthState((prev) => ({
							...prev,
							error: "Invalid wallet address format",
							isInitialized: true,
							isFetchingCriticalData: false,
							isLoading: false,
						}));
						return null;
					}

					// Handle connection/database errors
					if (
						error.response?.data?.error?.includes("Failed to connect") ||
						error.response?.data?.error?.includes("Transaction failed") ||
						error.response?.data?.code === "INTERNAL_ERROR"
					) {
						const errorMessage =
							error.response?.data?.error ||
							error.response?.data?.message ||
							"Server error occurred";

						showErrorNotification(new Error(errorMessage));
						setAuthState((prev) => ({
							...prev,
							error: errorMessage,
							isInitialized: true,
							isFetchingCriticalData: false,
							isLoading: false,
						}));
						return null;
					}

					if (i === retries - 1) {
						showErrorNotification(
							new Error("Failed to fetch user data after multiple attempts.")
						);
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
			setAuthState((prev) => ({ ...prev, isLoading: true }));

			// Get the callback URL from the current URL
			const urlParams = new URLSearchParams(window.location.search);
			const callbackUrl = urlParams.get("callbackUrl") || "/dashboard";

			const result = await signInWithPopup(auth, googleProvider);
			if (result.user) {
				// Store the callback URL in session storage
				sessionStorage.setItem("auth_callback_url", callbackUrl);

				// Get the ID token
				const idToken = await result.user.getIdToken();

				// Call your backend to verify the token and get your JWT
				const response = await axios.post(`${API_URL}/auth/google`, {
					idToken,
					walletAddress: localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS),
				});

				if (response.data.token) {
					// Store the token
					localStorage.setItem(STORAGE_KEYS.token, response.data.token);
					localStorage.setItem(
						STORAGE_KEYS.USER,
						JSON.stringify(response.data.user)
					);

					// Update auth state
					setAuthState((prev) => ({
						...prev,
						token: response.data.token,
						user: response.data.user,
						isLoading: false,
					}));

					// Redirect to the callback URL
					window.location.href = callbackUrl;
					return response.data;
				}
			}
		} catch (error) {
			console.error("Google sign-in error:", error);
			setAuthState((prev) => ({
				...prev,
				error: error.message,
				isLoading: false,
			}));
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

	const authenticateWithWallet = async (walletAddress) => {
		try {
			// First check if user exists
			const userResponse = await axios.get(
				`${API_URL}/users/${walletAddress.toLowerCase()}`
			);

			if (userResponse.data?.user) {
				// User exists, get authentication token
				const authResponse = await axios.post(`${API_URL}/auth/wallet`, {
					walletAddress: walletAddress.toLowerCase(),
				});

				if (authResponse.data?.token) {
					// Store authentication data
					localStorage.setItem(STORAGE_KEYS.token, authResponse.data.token);
					localStorage.setItem(
						STORAGE_KEYS.USER,
						JSON.stringify(userResponse.data.user)
					);
					localStorage.setItem(
						STORAGE_KEYS.WALLET_ADDRESS,
						walletAddress.toLowerCase()
					);

					// Update state
					setAuthState((prev) => ({
						...prev,
						token: authResponse.data.token,
						user: userResponse.data.user,
						error: null,
						isInitialized: true,
						isFetchingCriticalData: false,
						isLoading: false,
					}));

					return {
						success: true,
						token: authResponse.data.token,
						user: userResponse.data.user,
					};
				}
			}

			// User doesn't exist or no token received
			return {
				success: false,
				needsProfile: true,
			};
		} catch (error) {
			if (error.response?.status === 404) {
				// User doesn't exist, clear any existing data
				localStorage.removeItem(STORAGE_KEYS.token);
				localStorage.removeItem(STORAGE_KEYS.USER);
				localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);

				return {
					success: false,
					needsProfile: true,
				};
			}

			console.error("Error in authenticateWithWallet:", error);
			throw error;
		}
	};

	const value = {
		...authState,
		signInWithGoogle,
		logout,
		isAuthenticated: !!authState.googleUser,
		fetchUserData,
		authenticateWithWallet,
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
