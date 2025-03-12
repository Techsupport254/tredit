import ErrorBoundary from "../Components/ErrorBoundary";
import {
	showErrorMessage,
	showErrorNotification,
	showSuccessMessage,
	showSuccessNotification,
	showWarningMessage,
	showWarningNotification,
	showInfoMessage,
	showInfoNotification,
	showBlockchainError,
	showNetworkError,
} from "./notifications.jsx";
import { ApiError, ErrorCodes } from "./apiError";

// API response handler
export const handleApiResponse = async (response) => {
	if (!response.ok) {
		const error = await response.json();
		throw new ApiError(error.error);
	}
	return response.json();
};

// Export ErrorBoundary component
export { ErrorBoundary };

// Re-export notification functions
export {
	showErrorMessage,
	showErrorNotification,
	showSuccessMessage,
	showSuccessNotification,
	showWarningMessage,
	showWarningNotification,
	showInfoMessage,
	showInfoNotification,
	showBlockchainError,
	showNetworkError,
};

// Re-export ApiError and ErrorCodes
export { ApiError, ErrorCodes };
