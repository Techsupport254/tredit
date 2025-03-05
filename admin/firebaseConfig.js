import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";
import axios from "axios";

// ✅ Firebase Configuration using Vite environment variables
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Add Only VALID Google People API Scopes
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

// --- YouTube API Scopes ---
googleProvider.addScope("https://www.googleapis.com/auth/youtube");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.upload");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.force-ssl");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");
googleProvider.addScope(
	"https://www.googleapis.com/auth/youtube.channel-memberships.creator"
);
googleProvider.addScope("https://www.googleapis.com/auth/youtube.download");

// Create a user store
let currentUser = null;
const userListeners = new Set();

// Notify listeners when user changes
const notifyUserListeners = (user) => {
	userListeners.forEach((listener) => listener(user));
};

// Subscribe to user changes
const subscribeToUser = (listener) => {
	userListeners.add(listener);
	listener(currentUser);
	return () => userListeners.delete(listener);
};

// Get current user
const getCurrentUser = () => currentUser;

// Add this constant
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

// Fetch YouTube data
const fetchYouTubeData = async (accessToken) => {
	try {
		const response = await axios.get(
			"https://www.googleapis.com/youtube/v3/channels",
			{
				params: { part: "snippet,statistics", mine: true },
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
				},
			}
		);

		if (!response.data.items?.length) {
			console.warn("No YouTube channel found");
			return null;
		}

		return response.data.items[0];
	} catch (error) {
		console.error("Error fetching YouTube data:", error);
		return null;
	}
};

// Modify the signInWithGoogle function to check if user exists
const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const credential = GoogleAuthProvider.credentialFromResult(result);
		const token = await result.user.getIdToken(true);

		// Get YouTube data if available
		const youtubeData = credential?.accessToken
			? await fetchYouTubeData(credential.accessToken)
			: null;

		// Create enhanced user object
		const enhancedUser = {
			uid: result.user.uid,
			name: result.user.displayName || "",
			email: result.user.email || "",
			photoURL: result.user.photoURL || null,
			accessToken: token,
			googleAccessToken: credential?.accessToken || null,
			youtube: youtubeData,
			socialMedias: youtubeData
				? [
						{
							platform: "YouTube",
							accessToken: credential.accessToken,
							channelId: youtubeData.id,
							channelName: youtubeData.snippet?.title,
						},
				  ]
				: [],
			isNewUser: true,
		};

		// Check if user exists in your backend
		try {
			const response = await axios.get(`${API_URL}/users/${result.user.uid}`);
			if (response.data.success) {
				enhancedUser.isNewUser = false;
				enhancedUser.profile = response.data.user;
			}
		} catch (error) {
			if (error.response?.status !== 404) {
				console.error("Error checking user existence:", error);
			}
			// If 404, user doesn't exist, keep isNewUser as true
		}

		currentUser = enhancedUser;
		notifyUserListeners(enhancedUser);

		return enhancedUser;
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		throw error;
	}
};

// Enhanced googleLogout function
const googleLogout = async () => {
	try {
		await signOut(auth);
		currentUser = null;
		notifyUserListeners(null);
		console.log("User logged out successfully");
	} catch (error) {
		console.error("Logout Error:", error);
		throw error;
	}
};

// Listen to auth state changes
onAuthStateChanged(auth, async (firebaseUser) => {
	if (firebaseUser) {
		if (!currentUser) {
			const token = await firebaseUser.getIdToken();
			currentUser = {
				uid: firebaseUser.uid,
				name: firebaseUser.displayName || "",
				email: firebaseUser.email || "",
				photoURL: firebaseUser.photoURL || null,
				accessToken: token,
				socialMedias: [],
			};
			notifyUserListeners(currentUser);
		}
		console.log("User logged in:", currentUser);
	} else {
		currentUser = null;
		notifyUserListeners(null);
		console.log("User logged out");
	}
});

// Single consolidated export statement
export {
	auth,
	googleProvider,
	signInWithPopup,
	signInWithGoogle,
	googleLogout,
	getCurrentUser,
	subscribeToUser,
};
