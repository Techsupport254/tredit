import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Sidebar from "./Components/Sidebar";
import Mainbar from "./Components/Mainbar";
import { useLayoutContext } from "./Context/LayoutContext";
import { useAccount } from "./Context/AccountContext";
import ConnectWallet from "./pages/ConnectWallet"; // Ensure this component exists
import ProfileSetup from "./pages/profile/ProfileSetup"; // Component for profile creation
import ErrorBoundary from "./Components/ErrorBoundary"; // Error boundary component

// Custom loading spinner
const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

const AppContent = () => {
	const { isSidebarOpen } = useLayoutContext();
	const { isConnected, profile, isLoading, profileFetched } = useAccount();
	const location = useLocation();

	// --- Fallback logic for URL paths ---

	// If the user navigates to "/connect" and the wallet is already connected,
	// fall back to the dashboard.
	if (location.pathname === "/connect" && isConnected) {
		return <Navigate to="/" replace />;
	}

	// If the user navigates to "/profile" with the query "create-profile=true" and
	// a valid profile already exists, fall back to the dashboard.
	const searchParams = new URLSearchParams(location.search);
	const createProfileQuery = searchParams.get("create-profile") === "true";
	if (
		location.pathname === "/profile" &&
		createProfileQuery &&
		isConnected &&
		profile
	) {
		return <Navigate to="/" replace />;
	}
	console.log(profile);

	// 1. If wallet is not connected, render the ConnectWallet component.
	if (!isConnected) {
		return <ConnectWallet />;
	}

	// 2. While data is loading, display a full-screen spinner.
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
				<div className="relative">
					<Spin
						indicator={antIcon}
						tip="Loading your profile..."
						className="text-purple-600"
					/>
					{/* Animated background dots */}
					<div className="absolute inset-0 -z-10 opacity-30">
						<div className="absolute w-24 h-24 bg-purple-200 rounded-full -top-8 -left-8 animate-pulse"></div>
						<div className="absolute w-32 h-32 bg-blue-200 rounded-full -bottom-12 -right-12 animate-pulse delay-100"></div>
					</div>
				</div>
				<p className="mt-8 text-gray-600 animate-fade-in">
					Fetching your data from the decentralized network...
				</p>
			</div>
		);
	}

	// 3. Once loading is complete, if no valid profile exists (i.e. profile is null or profile.did is empty),
	// render the ProfileSetup component (for profile creation).
	if (profileFetched && !profile) {
		return <ProfileSetup />;
	}

	// 4. If the profile is valid, render the main dashboard
	return (
		<div className="flex h-screen bg-gray-100 overflow-hidden">
			<Sidebar isOpen={isSidebarOpen} />
			<div className="flex-1 md:w-4/5 flex flex-col bg-white shadow-lg rounded-l-2xl overflow-hidden transition-all duration-300">
				<Mainbar />
			</div>
		</div>
	);
};

const App = () => (
	<ErrorBoundary>
		<AppContent />
	</ErrorBoundary>
);

export default App;
