import { message, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ApiError } from "./apiError";

// Show error message (for form validation errors)
export const showErrorMessage = (error, field = null) => {
	const messageText =
		error instanceof ApiError
			? error.getValidationErrors()?.[field] || error.getMessage()
			: error.message;

	message.error({
		content: messageText,
		duration: 3,
		icon: <ExclamationCircleOutlined />,
		style: {
			marginTop: "20vh",
		},
	});
};

// Show error notification (for system/network errors)
export const showErrorNotification = (error) => {
	const messageText =
		error instanceof ApiError ? error.getMessage() : error.message;

	notification.error({
		message: "Error",
		description: messageText,
		placement: "topRight",
		duration: 5,
		icon: <ExclamationCircleOutlined />,
		style: {
			backgroundColor: "#fff2f0",
			border: "1px solid #ffccc7",
		},
	});
};

// Show success message
export const showSuccessMessage = (messageText) => {
	message.success({
		content: messageText,
		duration: 3,
		style: {
			marginTop: "20vh",
		},
	});
};

// Show success notification
export const showSuccessNotification = (title, description) => {
	notification.success({
		message: title,
		description: description,
		placement: "topRight",
		duration: 5,
		style: {
			backgroundColor: "#f6ffed",
			border: "1px solid #b7eb8f",
		},
	});
};

// Show warning message
export const showWarningMessage = (messageText) => {
	message.warning({
		content: messageText,
		duration: 3,
		style: {
			marginTop: "20vh",
		},
	});
};

// Show warning notification
export const showWarningNotification = (title, description) => {
	notification.warning({
		message: title,
		description: description,
		placement: "topRight",
		duration: 5,
		style: {
			backgroundColor: "#fffbe6",
			border: "1px solid #ffe58f",
		},
	});
};

// Show info message
export const showInfoMessage = (messageText) => {
	message.info({
		content: messageText,
		duration: 3,
		style: {
			marginTop: "20vh",
		},
	});
};

// Show info notification
export const showInfoNotification = (title, description) => {
	notification.info({
		message: title,
		description: description,
		placement: "topRight",
		duration: 5,
		style: {
			backgroundColor: "#e6f7ff",
			border: "1px solid #91d5ff",
		},
	});
};

// Show blockchain error notification
export const showBlockchainError = (error) => {
	let errorMessage = "Blockchain Error";

	if (error.code === 4001) {
		errorMessage = "Transaction was rejected by user";
	} else if (error.code === -32002) {
		errorMessage = "Please check MetaMask. A request is pending";
	} else if (error.code === -32603) {
		errorMessage = "Smart contract error occurred";
	} else if (error.message) {
		errorMessage = error.message;
	}

	notification.error({
		message: "Blockchain Error",
		description: errorMessage,
		placement: "topRight",
		duration: 5,
		icon: <ExclamationCircleOutlined />,
		style: {
			backgroundColor: "#fff2f0",
			border: "1px solid #ffccc7",
		},
	});
};

// Show network error notification
export const showNetworkError = (error) => {
	const messageText = typeof error === "string" ? error : error.message;

	notification.error({
		message: "Network Error",
		description: `${messageText}\nPlease check your connection and try again.`,
		placement: "topRight",
		duration: 5,
		icon: <ExclamationCircleOutlined />,
		style: {
			backgroundColor: "#fff2f0",
			border: "1px solid #ffccc7",
		},
	});
};
