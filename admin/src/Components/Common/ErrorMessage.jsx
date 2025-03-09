import React from "react";
import PropTypes from "prop-types";
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorMessage = ({
	message = "An error occurred",
	fullScreen = false,
}) => {
	const containerClasses = fullScreen
		? "fixed inset-0 bg-white flex justify-center items-center"
		: "flex justify-center items-center h-64";

	return (
		<div className={containerClasses}>
			<div className="text-center">
				<FaExclamationTriangle className="text-red-500 text-4xl mb-4 mx-auto" />
				<p className="text-gray-700 text-lg">{message}</p>
			</div>
		</div>
	);
};

ErrorMessage.propTypes = {
	message: PropTypes.string,
	fullScreen: PropTypes.bool,
};

export default ErrorMessage;
