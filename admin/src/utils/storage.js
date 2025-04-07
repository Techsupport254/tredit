export const STORAGE_KEYS = {
	USER: "user",
	WALLET_ADDRESS: "wallet_address",
	NETWORK_NAME: "network_name",
	BALANCE: "balance",
	token: "token", // API token
	FIREBASE_TOKEN: "firebase_token", // Firebase token
	GOOGLE_USER: "google_user",
	SELECTED_BUSINESS_ID: "selectedBusinessId",
};

const storage = {
	setItem: (key, value) => {
		try {
			// Handle tokens as plain strings
			if (key === STORAGE_KEYS.FIREBASE_TOKEN || key === STORAGE_KEYS.token) {
				localStorage.setItem(key, value);
			} else {
				localStorage.setItem(key, JSON.stringify(value));
			}
		} catch (error) {
			console.error(`Error storing ${key} in localStorage:`, error);
		}
	},

	getItem: (key) => {
		try {
			const item = localStorage.getItem(key);
			// Handle tokens as plain strings
			if (key === STORAGE_KEYS.FIREBASE_TOKEN || key === STORAGE_KEYS.token) {
				return item;
			}
			return item ? JSON.parse(item) : null;
		} catch (error) {
			console.error(`Error retrieving ${key} from localStorage:`, error);
			return null;
		}
	},

	removeItem: (key) => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing ${key} from localStorage:`, error);
		}
	},

	clear: () => {
		try {
			Object.values(STORAGE_KEYS).forEach((key) => {
				localStorage.removeItem(key);
			});
		} catch (error) {
			console.error("Error clearing localStorage:", error);
		}
	},
};

// Export individual functions for backward compatibility
export const setStorageItem = storage.setItem;
export const getStorageItem = storage.getItem;
export const removeStorageItem = storage.removeItem;
export const clearStorage = storage.clear;

export default storage;
