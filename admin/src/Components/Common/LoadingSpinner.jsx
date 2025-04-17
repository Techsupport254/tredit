import React from "react";
import PropTypes from "prop-types";
import { Spin } from "antd";

/**
 * Enhanced loading spinner with multiple size and display options
 */
const LoadingSpinner = ({
	fullScreen = false,
	message = "Loading...",
	size = "default",
	overlay = false,
	delay = 0, // Delay in ms before showing spinner
	className = "",
}) => {
	const [visible, setVisible] = React.useState(delay === 0);

	React.useEffect(() => {
		if (delay > 0) {
			const timer = setTimeout(() => setVisible(true), delay);
			return () => clearTimeout(timer);
		}
	}, [delay]);

	if (!visible) return null;

	// Container classes based on options
	const containerClasses = fullScreen
		? "fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center"
		: overlay
		? "absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center"
		: "flex items-center justify-center p-4 " + className;

	// Size mappings for Ant Design Spin
	const spinSize =
		{
			small: "small",
			default: "default",
			large: "large",
		}[size] || "default";

	return (
		<div className={containerClasses}>
			<div className="flex flex-col items-center justify-center text-center">
				<Spin size={spinSize} />
				{message && <p className="text-gray-600 text-center mt-3">{message}</p>}
			</div>
		</div>
	);
};

LoadingSpinner.propTypes = {
	fullScreen: PropTypes.bool,
	message: PropTypes.string,
	size: PropTypes.oneOf(["small", "default", "large"]),
	overlay: PropTypes.bool,
	delay: PropTypes.number,
	className: PropTypes.string,
};

export default LoadingSpinner;
