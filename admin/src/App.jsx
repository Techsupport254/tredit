import { lazy, Suspense, useEffect } from "react";
import {
	Routes,
	Route,
	Navigate,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { useAccount } from "./Context/AccountContext";
import { useAuth } from "./Context/AuthContext";
import LoadingSpinner from "./Components/Common/LoadingSpinner";
import AuthLoader from "./components/AuthLoader";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PropTypes from "prop-types";
import axios from "axios";
import { getStorageItem, STORAGE_KEYS } from "./utils/storage";
import { App as AntApp } from "antd";

// Preload critical components
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

// Preload commonly accessed components
const ConnectWallet = lazy(() => {
	const component = import("./Components/Profile/ConnectWallet");
	// Trigger preload of ProfileSetup
	import("./pages/settings/ProfileSetup.jsx");
	return component;
});

const ProfileSetup = lazy(() => import("./pages/settings/ProfileSetup.jsx"));

// Preload dashboard and its sub-components
const Dashboard = lazy(() => {
	const component = import("./pages/Dashboard");
	// Preload commonly accessed components
	import("./pages/businesses/MyBusinesses.jsx");
	import("./pages/settings/AccountSettings.jsx");
	return component;
});

// Business Hub components with preloading
const MyBusinesses = lazy(() => import("./pages/Business/BusinessList.jsx"));
const CreateBusiness = lazy(() =>
	import("./pages/Business/CreateBusiness.jsx")
);
const EditBusiness = lazy(() => import("./pages/Business/EditBusiness.jsx"));
const BusinessDetails = lazy(() =>
	import("./pages/Business/BusinessDetails.jsx")
);
const ListingsManager = lazy(() =>
	import("./pages/businesses/ListingsManager.jsx")
);
const StockControl = lazy(() => import("./pages/businesses/StockControl.jsx"));
const ServiceContracts = lazy(() =>
	import("./pages/businesses/ServiceContracts.jsx")
);
const Orders = lazy(() => import("./pages/businesses/Orders.jsx"));
const Analytics = lazy(() => import("./pages/businesses/Analytics.jsx"));

// Transaction Hub components
const TransactionOverview = lazy(() =>
	import("./pages/transactions/Overview.jsx")
);
const EscrowManagement = lazy(() => import("./pages/transactions/Escrow.jsx"));
const PaymentHistory = lazy(() => import("./pages/transactions/History.jsx"));
const PayoutSettings = lazy(() => import("./pages/transactions/Payouts.jsx"));

// Dispute Management components
const ActiveDisputes = lazy(() => import("./pages/disputes/Active.jsx"));
const ResolutionCenter = lazy(() => import("./pages/disputes/Resolution.jsx"));
const DisputeHistory = lazy(() => import("./pages/disputes/History.jsx"));

// Communication components
const Messages = lazy(() => import("./pages/communications/Messages.jsx"));
const Announcements = lazy(() =>
	import("./pages/communications/Announcements.jsx")
);
const NotificationSettings = lazy(() =>
	import("./pages/communications/Settings.jsx")
);

// Settings components
const AccountSettings = lazy(() =>
	import("./pages/settings/AccountSettings.jsx")
);
const Security = lazy(() => import("./pages/settings/Security.jsx"));
const ApiKeys = lazy(() => import("./pages/settings/ApiKeys.jsx"));

const Logout = lazy(() => import("./pages/Logout"));

// Route-based code splitting wrapper
const RouteWrapper = ({ children }) => {
	return (
		<Suspense fallback={<LoadingSpinner message="Loading page..." />}>
			{children}
		</Suspense>
	);
};

// Content Loading Wrapper
const ContentLoadingWrapper = ({ children, isLoading, message }) => {
	if (isLoading) {
		return (
			<div className="flex-1 p-4 bg-white rounded-lg shadow-sm">
				<LoadingSpinner message={message} />
			</div>
		);
	}
	return children;
};

// Simplified Protected Route Component
const ProtectedRoute = ({ children }) => {
	const {
		walletAddress,
		isLoading: accountLoading,
		isConnecting,
		isFetchingUserData,
		user: accountUser,
		isInitialized: accountInitialized,
	} = useAccount();
	const {
		isLoading: authLoading,
		isFetchingCriticalData,
		user: authUser,
		isInitialized: authInitialized,
		error: authError,
	} = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	// Check if we're still loading anything
	const isLoading =
		!authInitialized ||
		!accountInitialized ||
		authLoading ||
		accountLoading ||
		isConnecting ||
		isFetchingCriticalData ||
		isFetchingUserData;

	// Check if we have a user profile from any source
	const hasProfile = !!(accountUser || authUser);

	// Check if we got a 404 error indicating no user exists
	const userNotFound = authError?.response?.status === 404;

	useEffect(() => {
		if (!isLoading) {
			if (!walletAddress) {
				// If wallet is not connected, redirect to connect page
				navigate("/connect", { state: { from: location }, replace: true });
			} else if (
				(!hasProfile || userNotFound) &&
				location.pathname !== "/profile-setup"
			) {
				// If wallet is connected but no profile exists or we got a 404, redirect to profile setup
				console.log("Redirecting to profile setup - No profile found");
				navigate("/profile-setup", {
					state: { from: location },
					replace: true,
				});
			}
		}
	}, [isLoading, walletAddress, hasProfile, userNotFound, location, navigate]);

	const loadingMessage = authLoading
		? "Loading authentication..."
		: accountLoading
		? "Loading account..."
		: isConnecting
		? "Connecting wallet..."
		: isFetchingCriticalData
		? "Loading user data..."
		: isFetchingUserData
		? "Loading profile..."
		: "Loading...";

	// Show loading state while checking conditions
	if (isLoading) {
		return (
			<ContentLoadingWrapper isLoading={true} message={loadingMessage}>
				<RouteWrapper>{children}</RouteWrapper>
			</ContentLoadingWrapper>
		);
	}

	// Only render children if we have a wallet address and either a profile or we're on the profile setup page
	if (walletAddress && (hasProfile || location.pathname === "/profile-setup")) {
		return <RouteWrapper>{children}</RouteWrapper>;
	}

	return null;
};

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

const App = () => {
	const {
		isLoading: authLoading,
		isFetchingCriticalData,
		isInitialized: authInitialized,
	} = useAuth();
	const {
		walletAddress,
		isLoading: accountLoading,
		isConnecting,
		isFetchingUserData,
		isInitialized: accountInitialized,
	} = useAccount();

	const isLoading =
		!authInitialized ||
		!accountInitialized ||
		authLoading ||
		accountLoading ||
		isConnecting ||
		isFetchingCriticalData ||
		isFetchingUserData;

	const loadingMessage = authLoading
		? "Loading authentication..."
		: accountLoading
		? "Loading account..."
		: isConnecting
		? "Connecting wallet..."
		: isFetchingCriticalData
		? "Loading user data..."
		: isFetchingUserData
		? "Loading profile..."
		: "Loading...";

	if (isLoading) {
		return (
			<AntApp>
				<div className="min-h-screen bg-gray-50">
					<div className="flex-1 p-4">
						<LoadingSpinner fullScreen message={loadingMessage} />
					</div>
				</div>
			</AntApp>
		);
	}

	return (
		<AntApp>
			<Routes>
				{/* Public Routes */}
				<Route
					path="/connect"
					element={
						<RouteWrapper>
							<ConnectWallet />
						</RouteWrapper>
					}
				/>
				<Route
					path="/profile-setup"
					element={
						<RouteWrapper>
							<ProfileSetup />
						</RouteWrapper>
					}
				/>

				{/* Protected Routes */}
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<Navigate to="/dashboard" replace />} />
					<Route path="dashboard" element={<Dashboard />} />

					{/* Business Hub Routes */}
					<Route path="businesses">
						<Route index element={<MyBusinesses />} />
						<Route path="create" element={<CreateBusiness />} />
						<Route path=":id" element={<BusinessDetails />} />
						<Route path=":id/edit" element={<EditBusiness />} />
						<Route path="listings" element={<ListingsManager />} />
						<Route path="inventory" element={<StockControl />} />
						<Route path="contracts" element={<ServiceContracts />} />
						<Route path="orders" element={<Orders />} />
						<Route path="analytics" element={<Analytics />} />
					</Route>

					{/* Transaction Hub Routes */}
					<Route path="transactions">
						<Route path="overview" element={<TransactionOverview />} />
						<Route path="escrow" element={<EscrowManagement />} />
						<Route path="history" element={<PaymentHistory />} />
						<Route path="payouts" element={<PayoutSettings />} />
					</Route>

					{/* Dispute Management Routes */}
					<Route path="disputes">
						<Route path="active" element={<ActiveDisputes />} />
						<Route path="resolution" element={<ResolutionCenter />} />
						<Route path="history" element={<DisputeHistory />} />
					</Route>

					{/* Communication Routes */}
					<Route path="communications">
						<Route path="messages" element={<Messages />} />
						<Route path="announcements" element={<Announcements />} />
						<Route path="settings" element={<NotificationSettings />} />
					</Route>

					{/* Settings Routes */}
					<Route path="settings">
						<Route path="account" element={<AccountSettings />} />
						<Route path="security" element={<Security />} />
						<Route path="api" element={<ApiKeys />} />
					</Route>

					<Route path="logout" element={<Logout />} />
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Routes>
		</AntApp>
	);
};

export default App;
