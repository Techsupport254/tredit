import { notification } from "antd";

const showSuccessMessage = (message) => {
	notification.success({
		message: "Success",
		description: message,
		placement: "topRight",
		duration: 3,
	});
};

const showErrorNotification = (message) => {
	notification.error({
		message: "Error",
		description: message,
		placement: "topRight",
		duration: 5,
	});
};

const showInfoMessage = (message) => {
	notification.info({
		message: "Info",
		description: message,
		placement: "topRight",
		duration: 3,
	});
};

const showWarningMessage = (message) => {
	notification.warning({
		message: "Warning",
		description: message,
		placement: "topRight",
		duration: 4,
	});
};

export {
	showSuccessMessage,
	showErrorNotification,
	showInfoMessage,
	showWarningMessage,
};
