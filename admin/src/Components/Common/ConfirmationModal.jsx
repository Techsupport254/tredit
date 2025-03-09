import React from "react";
import PropTypes from "prop-types";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Confirm Action",
	message = "Are you sure you want to proceed?",
	confirmText = "Confirm",
	cancelText = "Cancel",
	type = "danger", // 'danger' | 'warning' | 'info'
}) => {
	if (!isOpen) return null;

	const getTypeStyles = () => {
		switch (type) {
			case "danger":
				return {
					icon: "text-red-500",
					button: "bg-red-600 hover:bg-red-700",
				};
			case "warning":
				return {
					icon: "text-yellow-500",
					button: "bg-yellow-600 hover:bg-yellow-700",
				};
			case "info":
				return {
					icon: "text-blue-500",
					button: "bg-blue-600 hover:bg-blue-700",
				};
			default:
				return {
					icon: "text-gray-500",
					button: "bg-gray-600 hover:bg-gray-700",
				};
		}
	};

	const styles = getTypeStyles();

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<div className="text-center mb-6">
					<FaExclamationTriangle
						className={`text-4xl ${styles.icon} mx-auto mb-4`}
					/>
					<h3 className="text-xl font-semibold mb-2">{title}</h3>
					<p className="text-gray-600">{message}</p>
				</div>
				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 border rounded-lg hover:bg-gray-50"
					>
						{cancelText}
					</button>
					<button
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={`px-4 py-2 text-white rounded-lg ${styles.button}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

ConfirmationModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	title: PropTypes.string,
	message: PropTypes.string,
	confirmText: PropTypes.string,
	cancelText: PropTypes.string,
	type: PropTypes.oneOf(["danger", "warning", "info"]),
};

export default ConfirmationModal;
