import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
	const containerClasses = fullScreen
		? "fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center"
		: "flex items-center justify-center h-64";

	return (
		<div className={containerClasses}>
			<div className="flex flex-col items-center justify-center w-full h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
				{message && <p className="text-gray-600 text-center">{message}</p>}
			</div>
		</div>
	);
};

LoadingSpinner.propTypes = {
	fullScreen: PropTypes.bool,
	message: PropTypes.string,
};

export default LoadingSpinner;
