const STORAGE_KEYS = {
	USER: "tredit_user",
	AUTH_TOKEN: "tredit_auth_token",
	WALLET_ADDRESS: "tredit_wallet_address",
	NETWORK_NAME: "tredit_network_name",
	BALANCE: "tredit_balance",
	LOGIN_HISTORY: "tredit_login_history",
};

export const setStorageItem = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error storing ${key} in localStorage:`, error);
	}
};

export const getStorageItem = (key) => {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : null;
	} catch (error) {
		console.error(`Error retrieving ${key} from localStorage:`, error);
		return null;
	}
};

export const removeStorageItem = (key) => {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing ${key} from localStorage:`, error);
	}
};

export const clearStorage = () => {
	try {
		Object.values(STORAGE_KEYS).forEach((key) => {
			localStorage.removeItem(key);
		});
	} catch (error) {
		console.error("Error clearing localStorage:", error);
	}
};

export { STORAGE_KEYS };
