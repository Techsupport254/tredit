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
import LoadingOverlay from "./components/LoadingOverlay";
import AuthLoader from "./components/AuthLoader";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { ToastContainer } from "react-toastify";
import PropTypes from "prop-types";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getStorageItem, STORAGE_KEYS } from "./utils/storage";

// Lazy load layouts with preload
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

// Preload critical components
const ConnectWallet = lazy(() => {
	const component = import("./Components/Profile/ConnectWallet");
	// Trigger preload of ProfileSetup
	import("./pages/settings/ProfileSetup.jsx");
	return component;
});

const ProfileSetup = lazy(() => import("./pages/settings/ProfileSetup.jsx"));

// Lazy load dashboard components with preload
const Dashboard = lazy(() => {
	const component = import("./pages/Dashboard");
	// Preload commonly accessed components
	import("./pages/businesses/MyBusinesses.jsx");
	import("./pages/settings/AccountSettings.jsx");
	return component;
});

// Business Hub components
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

// Simplified Protected Route Component
const ProtectedRoute = ({ children }) => {
	const {
		walletAddress,
		isLoading: accountLoading,
		isConnecting,
		user: accountUser,
		isInitialized: accountInitialized,
	} = useAccount();
	const {
		isLoading: authLoading,
		isFetchingCriticalData,
		user: authUser,
		isInitialized: authInitialized,
	} = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const isLoading =
		!authInitialized ||
		!accountInitialized ||
		authLoading ||
		accountLoading ||
		isConnecting ||
		isFetchingCriticalData;

	const storedUser = getStorageItem(STORAGE_KEYS.USER);
	const hasProfile = accountUser || authUser || storedUser;

	useEffect(() => {
		if (!isLoading && !walletAddress) {
			navigate("/connect", { state: { from: location }, replace: true });
		} else if (
			!isLoading &&
			!hasProfile &&
			location.pathname !== "/profile-setup"
		) {
			navigate("/profile-setup", { state: { from: location }, replace: true });
		}
	}, [isLoading, walletAddress, hasProfile, location.pathname]);

	if (isLoading) {
		return (
			<LoadingOverlay
				message={
					authLoading
						? "Loading authentication..."
						: accountLoading
						? "Loading account..."
						: isConnecting
						? "Connecting wallet..."
						: isFetchingCriticalData
						? "Loading user data..."
						: "Loading..."
				}
			/>
		);
	}

	return children;
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
		isFetchingBalance,
		isInitialized: accountInitialized,
	} = useAccount();

	const isLoading =
		!authInitialized ||
		!accountInitialized ||
		authLoading ||
		accountLoading ||
		isConnecting ||
		isFetchingCriticalData ||
		isFetchingBalance;

	if (isLoading) {
		return (
			<LoadingOverlay
				message={
					authLoading
						? "Loading authentication..."
						: accountLoading
						? "Loading account..."
						: isConnecting
						? "Connecting wallet..."
						: isFetchingCriticalData
						? "Loading user data..."
						: isFetchingBalance
						? "Fetching balance..."
						: "Loading..."
				}
			/>
		);
	}

	return (
		<>
			<Suspense fallback={<LoadingOverlay message="Loading page..." />}>
				<Routes>
					{/* Public Routes */}
					<Route path="/connect" element={<ConnectWallet />} />
					<Route path="/profile-setup" element={<ProfileSetup />} />

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
			</Suspense>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</>
	);
};

export default App;
