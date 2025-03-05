import { Alert } from "antd"; // Import Ant Design ErrorBoundary
import { Outlet } from "react-router-dom";

const Mainbar = () => {
	return (
		<div className="p-2">
			<Alert.ErrorBoundary>
				<Outlet />
			</Alert.ErrorBoundary>
		</div>
	);
};

export default Mainbar;
