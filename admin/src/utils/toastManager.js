import { toast } from "react-toastify";

// Toast IDs to prevent duplicates
export const TOAST_IDS = {
	WALLET_CONNECT: "wallet_connect",
	WALLET_DISCONNECT: "wallet_disconnect",
	GOOGLE_SIGNIN: "google_signin",
	PROFILE_UPDATE: "profile_update",
	NETWORK_SWITCH: "network_switch",
	SERVER_ERROR: "server_error",
};

// Toast types
export const TOAST_TYPES = {
	SUCCESS: "success",
	ERROR: "error",
	INFO: "info",
	LOADING: "loading",
};

// Toast durations in milliseconds
export const TOAST_DURATIONS = {
	SHORT: 3000,
	MEDIUM: 5000,
	LONG: 8000,
	VERY_LONG: 10000,
};

// Keep track of active toasts
const activeToasts = new Set();

// Helper to dismiss existing toast if it exists
const dismissExistingToast = (toastId) => {
	if (activeToasts.has(toastId)) {
		toast.dismiss(toastId);
		activeToasts.delete(toastId);
	}
};

// Helper to get appropriate duration based on type and content
const getDuration = (type, message) => {
	if (type === TOAST_TYPES.LOADING) return false;
	if (type === TOAST_TYPES.ERROR) return TOAST_DURATIONS.LONG;
	if (message.includes("\n")) return TOAST_DURATIONS.VERY_LONG;
	return TOAST_DURATIONS.MEDIUM;
};

// Toast functions
export const showToast = (message, type = TOAST_TYPES.INFO, toastId) => {
	dismissExistingToast(toastId);

	const duration = getDuration(type, message);
	const newToast = toast[
		type === TOAST_TYPES.LOADING ? "loading" : type.toLowerCase()
	](message, {
		toastId,
		position: "top-right",
		autoClose: duration,
		hideProgressBar: type === TOAST_TYPES.LOADING,
		closeOnClick: type !== TOAST_TYPES.LOADING,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
		style: {
			minWidth: "300px",
		},
	});

	if (toastId) {
		activeToasts.add(toastId);
	}

	return newToast;
};

export const showLoadingToast = (message, toastId) => {
	return showToast(message, TOAST_TYPES.LOADING, toastId);
};

export const updateToast = (toastId, message, type = TOAST_TYPES.INFO) => {
	if (!toast.isActive(toastId)) {
		return showToast(message, type, toastId);
	}

	const duration = getDuration(type, message);
	toast.update(toastId, {
		render: message,
		type: type === TOAST_TYPES.LOADING ? "default" : type.toLowerCase(),
		isLoading: type === TOAST_TYPES.LOADING,
		autoClose: duration,
		closeOnClick: type !== TOAST_TYPES.LOADING,
	});
};

export const dismissToast = (toastId) => {
	dismissExistingToast(toastId);
};

// Common toast messages
export const showWalletConnectSuccess = (address, message) => {
	const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
	const successMessage =
		message ||
		`Wallet Connected Successfully!\n` +
			`Address: ${displayAddress}\n` +
			`Network: Polygon Amoy Testnet\n` +
			`You can now access all platform features.`;
	showToast(successMessage, TOAST_TYPES.SUCCESS, TOAST_IDS.WALLET_CONNECT);
};

export const showWalletDisconnect = () => {
	showToast(
		"Wallet Disconnected Successfully\n" +
			"You have been safely logged out.\n" +
			"Connect your wallet again to access your account.",
		TOAST_TYPES.INFO,
		TOAST_IDS.WALLET_DISCONNECT
	);
};

export const showMetaMaskError = (error) => {
	let errorMessage = "MetaMask Error";
	if (error.code === 4001) {
		errorMessage = "Action cancelled. Please try again.";
	} else if (error.code === -32002) {
		errorMessage = "Please check MetaMask. A request is pending.";
	} else if (error.code === -32603) {
		errorMessage = "MetaMask encountered an error. Please try again.";
	} else if (error.message) {
		errorMessage = error.message;
	}
	showToast(errorMessage, TOAST_TYPES.ERROR, TOAST_IDS.WALLET_CONNECT);
};

export const showNetworkError = (error) => {
	const message = typeof error === "string" ? error : error.message;
	showToast(
		`Network Error\n${message}\nPlease check your connection and try again.`,
		TOAST_TYPES.ERROR,
		TOAST_IDS.NETWORK_SWITCH
	);
};

export const showSignatureError = (error) => {
	let message = "Failed to sign message";
	if (error.code === 4001) {
		message = "Message signing rejected. Please sign the message to connect.";
	} else if (error.message) {
		message = error.message;
	}
	showToast(message, TOAST_TYPES.ERROR, TOAST_IDS.WALLET_CONNECT);
};
