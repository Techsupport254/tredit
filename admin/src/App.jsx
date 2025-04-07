import { lazy, Suspense, useEffect, useState, useRef, useMemo } from "react";
import {
	Routes,
	Route,
	Navigate,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import {
	useAccount,
	CONNECTION_STATES,
	USER_STATES,
} from "./Context/AccountContext";
import { useAuth } from "./Context/AuthContext";
import LoadingSpinner from "./Components/Common/LoadingSpinner";
import AuthLoader from "./Components/AuthLoader";
import NotFoundPage, { Dashboard404Page } from "./pages/NotFoundPage.jsx";
import PropTypes from "prop-types";
import axios from "axios";
import { getStorageItem, STORAGE_KEYS } from "./utils/storage";
import { App as AntApp } from "antd";
import { ConfigProvider } from "antd";
import ErrorBoundary from "./Components/ErrorBoundary";
import { AuthProvider } from "./Context/AuthContext";
import { AccountProvider } from "./Context/AccountContext";
import { LayoutProvider } from "./Context/LayoutContext";
import { BusinessProvider } from "./Context/BusinessContext";
import { CloseCircleFilled } from "@ant-design/icons";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Button, Spin } from "antd";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/connect", "/profile-setup"];

// Define lazy loading with better error handling and preload hints
const lazyWithPreload = (factory) => {
	const Component = lazy(factory);
	Component.preload = factory;
	return Component;
};

// Preload critical components
const DashboardLayout = lazyWithPreload(() =>
	import("./layouts/DashboardLayout")
);

// Preload commonly accessed components
const ConnectWallet = lazy(() =>
	import("./Components/Profile/ConnectWallet.jsx")
);
const ProfileSetup = lazy(() => import("./pages/settings/ProfileSetup.jsx"));

// Product & Service Details
const ProductDetails = lazy(() =>
	import("./pages/products/ProductDetails.jsx")
);
const ServiceDetails = lazy(() =>
	import("./pages/services/ServiceDetails.jsx")
);

// Dashboard component
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));

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
	import("./pages/Business/ListingsManager.jsx")
);
const StockControl = lazy(() => import("./pages/Business/StockControl.jsx"));
const BusinessOrders = lazy(() =>
	import("./pages/Business/BusinessOrders.jsx")
);
const Analytics = lazy(() => import("./pages/Business/Analytics.jsx"));

// Analytics components
const CustomerInsights = lazy(() =>
	import("./pages/analytics/CustomerInsights.jsx?t=" + Date.now())
);
const ProductPerformance = lazy(() =>
	import("./pages/analytics/ProductPerformance.jsx?t=" + Date.now())
);

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

// Add YouTube callback component
const YouTubeCallback = lazy(() => import("./pages/youtube/Callback"));

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

// ProtectedRoute component - updated for faster navigation
const ProtectedRoute = ({ children }) => {
	const navigate = useNavigate();
	const {
		token,
		connectionState,
		userState,
		walletAddress,
		isInitialized,
		isLoading,
		checkWeb3Provider,
	} = useAccount();

	// Add state to track authentication check completion
	const [authCheckComplete, setAuthCheckComplete] = useState(false);
	const authCheckRef = useRef(false);
	const location = useLocation();

	// Store wallet address in localStorage when available
	useEffect(() => {
		if (walletAddress) {
			localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, walletAddress);
		}
	}, [walletAddress]);

	// Check for stored token and wallet address on mount
	useEffect(() => {
		const storedToken = localStorage.getItem(STORAGE_KEYS.token);
		const storedWallet = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);

		if (storedToken && storedWallet && !token) {
			// We have stored credentials but no token in state, trigger a recheck
			checkWeb3Provider();
		}
	}, [token, checkWeb3Provider]);

	// Perform initial web3 provider check only once at mount
	useEffect(() => {
		if (!authCheckRef.current && !isLoading) {
			authCheckRef.current = true;
			// Use a small delay to prevent blocking rendering
			setTimeout(() => {
				checkWeb3Provider();
				setAuthCheckComplete(true);
			}, 100);
		}
	}, [isLoading, checkWeb3Provider]);

	// Handle direct redirects for clearly unauthenticated states
	if (connectionState === CONNECTION_STATES.NO_PROVIDER) {
		return (
			<Navigate to="/connect" replace state={{ from: location.pathname }} />
		);
	}

	if (
		userState === USER_STATES.NO_PROFILE &&
		connectionState === CONNECTION_STATES.CONNECTED
	) {
		return (
			<Navigate
				to="/profile-setup"
				replace
				state={{ from: location.pathname }}
			/>
		);
	}

	// Check if we're on a public route
	const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
	if (isPublicRoute) {
		// If we're on a public route and fully authenticated, redirect to dashboard
		if (token && walletAddress && userState === USER_STATES.HAS_PROFILE) {
			return <Navigate to="/dashboard" replace />;
		}
		// Otherwise, allow access to public routes
		return <>{children}</>;
	}

	// Fast path - if we have both a token and wallet address, or auth is complete,
	// render children immediately, authentication will happen in background
	if ((token && walletAddress) || authCheckComplete) {
		// User appears authenticated, render children immediately
		return <>{children}</>;
	}

	// Only show loading for short duration while checking authentication
	return <LoadingSpinner message="Verifying access..." />;
};

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

// Business redirect components to handle ID parameters
const BusinessRedirect = () => {
	const { id } = useParams();

	// Handle invalid IDs
	if (!id || id === "*" || id === "undefined") {
		console.error("Invalid business ID in redirect:", id);
		return <Navigate to="/dashboard/businesses" replace />;
	}

	return <Navigate to={`/dashboard/businesses/${id}`} replace />;
};

const BusinessEditRedirect = () => {
	const { id } = useParams();

	// Handle invalid IDs
	if (!id || id === "*" || id === "undefined") {
		console.error("Invalid business ID in edit redirect:", id);
		return <Navigate to="/dashboard/businesses" replace />;
	}

	return <Navigate to={`/dashboard/businesses/${id}/edit`} replace />;
};

const App = () => {
	const { token, loading: authLoading } = useAuth();
	const {
		connectionState,
		userState,
		loading: accountLoading,
		walletAddress,
	} = useAccount();

	// Check if we're still loading
	const isLoading = authLoading || accountLoading;

	// Skip debug logging in production
	if (process.env.NODE_ENV !== "production") {
		console.log("🔍 App.jsx - Current state:", {
			connectionState,
			userState,
			walletAddress: walletAddress
				? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
				: null,
			hasToken: !!token,
			isLoading,
		});
	}

	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: "#3b81f6",
					colorLink: "#3b81f6",
				},
			}}
		>
			<ErrorBoundary>
				<div className="min-h-screen">
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Navigate to="/connect" replace />} />
						<Route
							path="/connect"
							element={
								<Suspense
									fallback={
										<LoadingSpinner message="Loading connect page..." />
									}
								>
									<ConnectWallet />
								</Suspense>
							}
						/>

						{/* User must be connected but profile not required */}
						<Route
							path="/profile-setup"
							element={
								<ProtectedRoute>
									<Suspense
										fallback={
											<LoadingSpinner message="Loading profile setup..." />
										}
									>
										<ProfileSetup />
									</Suspense>
								</ProtectedRoute>
							}
						/>

						{/* Protected Routes - require both connection and profile */}
						<Route
							path="/dashboard/*"
							element={
								<ProtectedRoute>
									<Suspense
										fallback={<LoadingSpinner message="Loading dashboard..." />}
									>
										<DashboardLayout />
									</Suspense>
								</ProtectedRoute>
							}
						/>

						{/* Add direct routes outside of nested routes for common paths - fast redirect */}
						<Route
							path="/businesses"
							element={<Navigate to="/dashboard/businesses" replace />}
						/>
						<Route
							path="/businesses/create"
							element={<Navigate to="/dashboard/businesses/create" replace />}
						/>
						<Route path="/businesses/:id" element={<BusinessRedirect />} />
						<Route
							path="/businesses/:id/edit"
							element={<BusinessEditRedirect />}
						/>
						{/* Keep other direct routes for common paths */}
						{[
							"/analytics/*",
							"/transactions/*",
							"/disputes/*",
							"/communications/*",
							"/settings/*",
							"/products/*",
							"/services/*",
						].map((path) => (
							<Route
								key={path}
								path={path}
								element={<Navigate to={`/dashboard${path}`} replace />}
							/>
						))}

						{/* Keep a catch-all route at the root level for unauthenticated users */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</div>
			</ErrorBoundary>
		</ConfigProvider>
	);
};

export default App;
