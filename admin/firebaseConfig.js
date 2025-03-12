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
console.log("Current user:", currentUser);

// Get current token
const getCurrentToken = () => currentToken;

// Update axios default authorization header
const updateAxiosAuth = async (user) => {
	if (user) {
		try {
			const tokenResult = await user.getIdTokenResult();
			const expirationTime = new Date(tokenResult.expirationTime).getTime();
			const now = Date.now();
			const fiveMinutes = 5 * 60 * 1000;

			if (expirationTime - now < fiveMinutes) {
				currentToken = await user.getIdToken(true); // Force refresh
			} else {
				currentToken = tokenResult.token;
			}

			axios.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
		} catch (error) {
			console.error("Error updating auth token:", error);
			currentToken = null;
			delete axios.defaults.headers.common["Authorization"];
		}
	} else {
		currentToken = null;
		delete axios.defaults.headers.common["Authorization"];
	}
};

// Add this constant
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

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

// Sign in with Google
const signInWithGoogle = async (retryCount = 0) => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const user = result.user;
		console.log("Firebase user data:", {
			displayName: user.displayName,
			email: user.email,
			photoURL: user.photoURL,
			uid: user.uid,
		});

		// Update axios auth header
		await updateAxiosAuth(user);

		// Create user object
		const enhancedUser = {
			uid: user.uid,
			name: user.displayName || "",
			email: user.email || "",
			photoURL: user.photoURL || null,
			accessToken: await user.getIdToken(),
			isNewUser: result.additionalUserInfo?.isNewUser || false,
		};

		console.log("Enhanced user object:", enhancedUser);

		// Store token in backend
		try {
			await axios.post(`${API_URL}/users/update-tokens`, {
				idToken: await user.getIdToken(),
			});
		} catch (error) {
			console.error("Error storing token:", error);
			if (retryCount === 0 && error.response?.status === 401) {
				await user.getIdToken(true); // Force token refresh
				return signInWithGoogle(retryCount + 1);
			}
		}

		currentUser = enhancedUser;
		notifyUserListeners(enhancedUser);

		return {
			userData: enhancedUser,
			token: await user.getIdToken(),
		};
	} catch (error) {
		if (error.code === "auth/network-request-failed" && retryCount < 2) {
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 * (retryCount + 1))
			);
			return signInWithGoogle(retryCount + 1);
		}
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

// Export functions
export {
	auth,
	googleProvider,
	signInWithGoogle,
	googleLogout,
	getCurrentUser,
	getCurrentToken,
	subscribeToUser,
};
