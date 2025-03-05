import { createContext, useContext, useEffect, useState } from "react";
import {
	auth,
	googleProvider,
	signInWithPopup,
	googleLogout,
} from "../../firebaseConfig";
import PropTypes from "prop-types";
import { useAccount } from "./AccountContext";
import axios from "axios"; // Import axios for API calls
import { toast } from "react-toastify";

// Update API URL to use the environment variable
const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const { completeUserProfile } = useAccount();
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(() => {
		// Retrieve user data from local storage if available
		const savedUser = localStorage.getItem("user");
		return savedUser ? JSON.parse(savedUser) : null;
	});
	const [youtube, setYoutube] = useState(null);
	const [loginHistory, setLoginHistory] = useState([]);

	const signInWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const userData = {
				uid: result.user.uid,
				name: result.user.displayName,
				email: result.user.email,
				profileImage: result.user.photoURL,
				id: result.user.uid,
			};
			setUser(userData);
			localStorage.setItem("user", JSON.stringify(userData)); // Save user data to local storage
			completeUserProfile(userData); // Update user profile in AccountContext
			return userData;
		} catch (error) {
			console.error("Google Sign-In Error:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await googleLogout(auth);
			setUser(null);
			setYoutube(null);
			localStorage.removeItem("user"); // Clear user data from local storage
			setTimeout(() => {
				window.location.reload(); // Reload the page to clear the cache
			}, 1000);
		} catch (error) {
			console.error("Sign Out Error:", error);
			throw error;
		}
	};

	const registerUser = async (userData) => {
		try {
			const response = await axios.post(`${API_URL}/users/register`, userData);
			if (response.data.success) {
				return response.data.user; // Return the registered user data
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("Registration error:", error);
			throw error; // Propagate the error
		}
	};

	// Rename the function to avoid conflict
	const updateUserProfile = (profileData) => {
		setUser((prevUser) => {
			const updatedUser = {
				...prevUser,
				...profileData, // Update user state with additional profile details
			};
			localStorage.setItem("user", JSON.stringify(updatedUser)); // Update local storage
			return updatedUser;
		});
	};

	const fetchYouTubeData = async () => {
		try {
			if (!user?.accessToken) {
				throw new Error("No access token available");
			}

			const response = await axios.get(
				"https://www.googleapis.com/youtube/v3/channels",
				{
					params: {
						part: "snippet,statistics",
						mine: true,
					},
					headers: {
						Authorization: `Bearer ${user.accessToken}`,
					},
				}
			);

			if (response.data.items && response.data.items.length > 0) {
				setYoutube(response.data.items[0]);
				return response.data.items[0];
			}
			return null;
		} catch (error) {
			console.error("Error fetching YouTube data:", error);
			return null;
		}
	};

	// Fetch user profile and login history
	const fetchUserProfile = async () => {
		try {
			const token = localStorage.getItem("auth_token");
			if (!token) {
				setLoading(false);
				return;
			}

			const [userResponse, historyResponse] = await Promise.all([
				axios.get(`${API_URL}/users/me`),
				axios.get(`${API_URL}/users/login-history`),
			]);

			setUser(userResponse.data);
			setLoginHistory(historyResponse.data);
		} catch (error) {
			console.error("Error fetching user profile:", error);
			// Clear invalid token
			localStorage.removeItem("auth_token");
			delete axios.defaults.headers.common["Authorization"];
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	// Initialize auth state
	useEffect(() => {
		fetchUserProfile();
	}, []);

	// Refresh login history
	const refreshLoginHistory = async () => {
		try {
			const response = await axios.get(`${API_URL}/users/login-history`);
			setLoginHistory(response.data);
		} catch (error) {
			console.error("Error fetching login history:", error);
			toast.error("Failed to fetch login history");
		}
	};

	const logout = () => {
		setUser(null);
		setLoginHistory([]);
		localStorage.removeItem("auth_token");
		delete axios.defaults.headers.common["Authorization"];
		toast.info("Logged out successfully");
	};

	const value = {
		loading,
		user,
		youtube,
		signInWithGoogle,
		signOut,
		registerUser,
		updateUserProfile,
		fetchYouTubeData,
		loginHistory,
		refreshLoginHistory,
		logout,
		fetchUserProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AuthProvider;
