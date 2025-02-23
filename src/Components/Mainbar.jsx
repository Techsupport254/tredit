import { Alert } from "antd"; // Import Ant Design ErrorBoundary
import Breadcrumb from "./Breadcrumb";
import Routes from "../routes"; // Import the dynamic Routes component

const Mainbar = () => {
	return (
		<div className="p-2 sm:p-1 flex-1 flex flex-col bg-white overflow-hidden">
			{/* Breadcrumb Navigation */}
			<Breadcrumb />

			{/* Main Content - Dynamic Routes with Error Boundary */}
			<Alert.ErrorBoundary>
				<div className="overflow-y-auto">
					<Routes />
				</div>
			</Alert.ErrorBoundary>
		</div>
	);
};

export default Mainbar;
