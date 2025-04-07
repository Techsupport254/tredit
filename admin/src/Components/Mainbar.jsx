import { Alert } from "antd"; // Import Ant Design ErrorBoundary
import { memo } from "react";
import PropTypes from "prop-types";

// Memoize the Mainbar component to prevent unnecessary re-renders
const Mainbar = memo(({ children }) => {
	return (
		<div className="p-2">
			<Alert.ErrorBoundary>
				{/* The Routes are now rendered in DashboardLayout, no need for Outlet here */}
				{children}
			</Alert.ErrorBoundary>
		</div>
	);
});

Mainbar.displayName = "Mainbar";

Mainbar.propTypes = {
	children: PropTypes.node,
};

export default Mainbar;
