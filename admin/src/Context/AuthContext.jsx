import { createContext, useContext, useEffect, useState } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	setPersistence,
	browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";
import axios from "axios";
import { message } from "antd";
import { useAccount } from "./AccountContext";
import { saveProfileToBlockchain } from "../utils/ipfsHelper";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const { walletAddress } = useAccount();
	const [user, setUser] = useState({
		uid: null,
		walletAddress: null,
		role: "seller",
		name: null,
		email: null,
		photoURL: null,
		phone: null,
		gender: null,
		dob: null,
		location: null,
		bio: null,
		accessToken: null,
		socialMedias: [],
	});
	const [loading, setLoading] = useState(true);
	const [youtube, setYoutube] = useState(null);
	const apiURL = import.meta.env.VITE_PUBLIC_API_URL;

	// Update user wallet address when it changes
	useEffect(() => {
		if (walletAddress) {
			setUser((prev) => ({ ...prev, walletAddress }));
		}
	}, [walletAddress]);

	// Handle authentication state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
		return () => unsubscribe();
	}, []);

	// Fetch YouTube data when access token is available
	useEffect(() => {
		if (user.accessToken) {
			fetchYouTubeData(user.accessToken);
		}
	}, [user.accessToken]);

	// Handle authentication state changes
	const handleAuthStateChange = async (currentUser) => {
		if (currentUser) {
			const token = localStorage.getItem("googleAccessToken");
			if (!token) {
				console.error("OAuth token not found.");
				setLoading(false);
				return;
			}

			updateUserState(currentUser, token);
		} else {
			clearUserData();
		}
		setLoading(false);
	};

	// Update user state with Firebase and Google data
	const updateUserState = (currentUser, token) => {
		setUser((prev) => ({
			...prev,
			uid: currentUser.uid,
			name: currentUser.displayName || "N/A",
			email: currentUser.email || "N/A",
			photoURL: currentUser.photoURL || null,
			accessToken: token,
		}));
	};

	// Clear user data on logout
	const clearUserData = () => {
		setUser({
			uid: null,
			name: null,
			email: null,
			photoURL: null,
			phone: null,
			gender: null,
			dob: null,
			location: null,
			bio: null,
			accessToken: null,
			socialMedias: [],
		});
		setYoutube(null);
	};

	// Sign in with Google
	const signInWithGoogle = async () => {
		try {
			await setPersistence(auth, browserLocalPersistence);
			const result = await signInWithPopup(auth, googleProvider);
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const token = credential?.accessToken;

			if (!token) {
				throw new Error("Failed to retrieve OAuth access token from Google.");
			}

			localStorage.setItem("googleAccessToken", token);
			updateUserState(result.user, token);

			await fetchGoogleUserInfo(token);
			await fetchYouTubeData(token);
		} catch (error) {
			console.error("Google Sign-In Error:", error);
			message.error("Failed to sign in with Google.");
		}
	};

	// Fetch Google user info
	const fetchGoogleUserInfo = async (token) => {
		if (!token) return;

		try {
			const response = await axios.get(
				"https://people.googleapis.com/v1/people/me",
				{
					params: {
						personFields:
							"names,emailAddresses,phoneNumbers,birthdays,genders,addresses,biographies",
					},
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					},
				}
			);

			const data = response.data;
			setUser((prev) => ({
				...prev,
				name: data.names?.[0]?.displayName || prev.name || "N/A",
				email: data.emailAddresses?.[0]?.value || prev.email || "N/A",
				phone: data.phoneNumbers?.[0]?.value || "Not Available",
				gender: data.genders?.[0]?.value || "Not Specified",
				dob: data.birthdays?.[0]?.date
					? `${data.birthdays[0].date.year}-${data.birthdays[0].date.month}-${data.birthdays[0].date.day}`
					: "Not Available",
				location: data.addresses?.[0]?.formattedValue || "Not Available",
				bio: data.biographies?.[0]?.value || "No Bio Available",
			}));
		} catch (error) {
			console.error(
				"Error fetching Google user info:",
				error.response?.data || error.message
			);
			message.error("Failed to fetch Google profile data.");
		}
	};

	// Fetch YouTube data
	const fetchYouTubeData = async (token) => {
		if (!token) {
			console.warn("No valid OAuth token found. Prompting Google Sign-In...");
			await signInWithGoogle();
			return;
		}

		try {
			const response = await axios.get(
				"https://www.googleapis.com/youtube/v3/channels",
				{
					params: { part: "snippet,statistics", mine: true },
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					},
				}
			);

			if (!response.data.items || response.data.items.length === 0) {
				console.warn("No YouTube channel found.");
				message.warning("No YouTube channel linked to this account.");
				return;
			}

			const channelData = response.data.items[0];
			setYoutube(channelData);
			setUser((prev) => ({
				...prev,
				socialMedias: [
					...(Array.isArray(prev.socialMedias) ? prev.socialMedias : []),
					{ platform: "YouTube", accessToken: token },
				],
			}));
		} catch (error) {
			console.error(
				"Error fetching YouTube channel info:",
				error.response?.data || error.message
			);
			message.error(
				"Failed to fetch YouTube data. Ensure you have granted YouTube permissions."
			);
		}
	};

	// Logout user
	const logout = async () => {
		try {
			await signOut(auth);
			localStorage.removeItem("googleAccessToken");
			clearUserData();
			message.success("Successfully logged out.");
		} catch (error) {
			console.error("Error during sign-out:", error);
			message.error("Logout failed.");
		}
	};

	// Register user
	const registerUser = async (userData) => {
		if (!userData?.walletAddress) {
			message.error("Wallet address is required to register.");
			return;
		}

		setLoading(true);
		try {
			const response = await axios.post(`${apiURL}/users/register`, {
				walletAddress: userData.walletAddress,
				role: userData.role || "seller",
				name: userData.name,
				email: userData.email,
				phoneNumber: userData.phone,
				gender: userData.gender,
				dob: userData.dob,
				location: userData.location,
				bio: userData.bio,
				profileImage: userData.photoURL,
				accessToken: userData.accessToken,
			});

			if (response.data.success) {
				const newUser = response.data.user;
				message.success("User registered successfully!");
				setUser((prev) => ({
					...prev,
					uid: newUser.id,
					walletAddress: newUser.walletAddress,
					role: newUser.role,
					name: newUser.name,
					email: newUser.email,
					photoURL: newUser.profileImage,
					phone: newUser.phoneNumber,
					gender: newUser.gender,
					dob: newUser.dob,
					location: newUser.location,
					bio: newUser.bio,
				}));

				await saveProfileToBlockchain(newUser, (status) => console.log(status));
			} else {
				message.warning(response.data.message || "Wallet already registered.");
			}
		} catch (error) {
			const errorMessage =
				error.response?.data?.message || "An error occurred while registering.";
			console.error(
				"Error registering user:",
				error.response?.data || error.message
			);
			message.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				loading,
				signInWithGoogle,
				logout,
				fetchYouTubeData,
				youtube,
				registerUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
