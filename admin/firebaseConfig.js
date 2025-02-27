import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";

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
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile"); // Basic profile info
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email"); // Email
googleProvider.addScope("https://www.googleapis.com/auth/user.birthday.read"); // Birthday (Age)
googleProvider.addScope("https://www.googleapis.com/auth/user.gender.read"); // Gender
googleProvider.addScope("https://www.googleapis.com/auth/user.addresses.read"); // Location (Address)
googleProvider.addScope(
	"https://www.googleapis.com/auth/user.phonenumbers.read"
); // Phone Number (Optional)

// --- YouTube API Scopes ---
googleProvider.addScope("https://www.googleapis.com/auth/youtube");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.upload");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.force-ssl");
googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");

// ✅ Handle Authentication State Changes
onAuthStateChanged(auth, async (user) => {
	if (user) {
		console.log("User logged in:", user);
	} else {
		console.log("User logged out.");
	}
});

// ✅ Google Sign-In Function
export const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const credential = GoogleAuthProvider.credentialFromResult(result);
		const token = await result.user.getIdToken(true);
		console.log("Google Sign-In Success:", result.user);
		return { user: result.user, token };
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		throw error;
	}
};

// ✅ Logout Function
export const logout = async () => {
	try {
		await signOut(auth);
		console.log("User logged out successfully.");
	} catch (error) {
		console.error("Logout Error:", error);
	}
};

// ✅ Export Required Modules
export { auth, googleProvider, signOut, onAuthStateChanged };
