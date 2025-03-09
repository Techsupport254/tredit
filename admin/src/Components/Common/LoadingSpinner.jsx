import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
	const containerClasses = fullScreen
		? "fixed inset-0 bg-white bg-opacity-90 z-50 flex justify-center items-center"
		: "flex justify-center items-center h-64";

	return (
		<div className={containerClasses}>
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
				{message && <p className="text-gray-600">{message}</p>}
			</div>
		</div>
	);
};

LoadingSpinner.propTypes = {
	fullScreen: PropTypes.bool,
	message: PropTypes.string,
};

export default LoadingSpinner;
