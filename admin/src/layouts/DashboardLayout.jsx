import { Suspense } from "react";
import Sidebar from "../Components/Sidebar";
import Mainbar from "../Components/Mainbar";
import Breadcrumbs from "../Components/Breadcrumb";
import LoadingOverlay from "../components/LoadingOverlay";

const DashboardLayout = () => {
	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Breadcrumbs />
				<div className="flex-1 overflow-auto">
					<Suspense fallback={<LoadingOverlay message="Loading content..." />}>
						<Mainbar />
					</Suspense>
				</div>
			</div>
		</div>
	);
};

export default DashboardLayout;
