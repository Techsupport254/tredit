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
let currentToken = null;
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

// Get current token
const getCurrentToken = () => currentToken;

// Update axios default authorization header
const updateAxiosAuth = async (user) => {
	if (user) {
		const token = await user.getIdToken(true);
		currentToken = token;
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		currentToken = null;
		delete axios.defaults.headers.common["Authorization"];
	}
};

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

// Listen to auth state changes
onAuthStateChanged(auth, async (firebaseUser) => {
	if (firebaseUser) {
		await updateAxiosAuth(firebaseUser);
		if (!currentUser) {
			currentUser = {
				uid: firebaseUser.uid,
				name: firebaseUser.displayName || "",
				email: firebaseUser.email || "",
				photoURL: firebaseUser.photoURL || null,
				accessToken: currentToken,
				socialMedias: [],
			};
			notifyUserListeners(currentUser);
		}
		console.log("User logged in:", currentUser);
	} else {
		currentUser = null;
		currentToken = null;
		delete axios.defaults.headers.common["Authorization"];
		notifyUserListeners(null);
		console.log("User logged out");
	}
});

// Modify the signInWithGoogle function
const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const credential = GoogleAuthProvider.credentialFromResult(result);

		// Update axios auth header
		await updateAxiosAuth(result.user);

		// Get YouTube data if available
		const youtubeData = credential?.accessToken
			? await fetchYouTubeData(credential.accessToken)
			: null;

		// Store tokens in backend
		try {
			await axios.post(`${API_URL}/users/update-tokens`, {
				accessToken: credential.accessToken,
				refreshToken: credential.refreshToken,
				expiresIn: credential.expiresIn,
			});
		} catch (error) {
			console.error("Error storing tokens:", error);
		}

		// Create enhanced user object
		const enhancedUser = {
			uid: result.user.uid,
			name: result.user.displayName || "",
			email: result.user.email || "",
			photoURL: result.user.photoURL || null,
			accessToken: currentToken,
			googleAccessToken: credential?.accessToken || null,
			refreshToken: credential?.refreshToken || null,
			tokenExpiry: credential?.expiresIn
				? new Date(Date.now() + credential.expiresIn * 1000)
				: null,
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
		currentToken = null;
		delete axios.defaults.headers.common["Authorization"];
		notifyUserListeners(null);
		console.log("User logged out successfully");
	} catch (error) {
		console.error("Logout Error:", error);
		throw error;
	}
};

// Export additional functions
export {
	auth,
	googleProvider,
	signInWithPopup,
	signInWithGoogle,
	googleLogout,
	getCurrentUser,
	getCurrentToken,
	subscribeToUser,
};
