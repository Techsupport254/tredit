import {
	lazy,
	Suspense,
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
} from "react";
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
import ConnectWallet from "./Components/Profile/ConnectWallet.jsx";

// Define API URL from environment variable
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

/**
 * Sets up Axios interceptors for adding auth tokens to requests
 * and handling authentication errors
 * @param {string} token - The JWT token to use for auth
 */
export const setupAxiosInterceptors = (token) => {
	try {
		// Clear any existing interceptors
		if (axios.interceptors) {
			try {
				if (
					axios.interceptors.request.handlers &&
					axios.interceptors.request.handlers.length > 0
				) {
					axios.interceptors.request.handlers.forEach((handler) => {
						if (handler && handler.id) {
							axios.interceptors.request.eject(handler.id);
						}
					});
				}
			} catch (e) {
				console.error("Error clearing request interceptors:", e);
			}

			try {
				if (
					axios.interceptors.response.handlers &&
					axios.interceptors.response.handlers.length > 0
				) {
					axios.interceptors.response.handlers.forEach((handler) => {
						if (handler && handler.id) {
							axios.interceptors.response.eject(handler.id);
						}
					});
				}
			} catch (e) {
				console.error("Error clearing response interceptors:", e);
			}
		}

		// Configure request interceptor to add Authorization header
		axios.interceptors.request.use(
			(config) => {
				// Clone config to avoid mutation
				const newConfig = { ...config };

				// Don't add token to requests to external domains
				const isApiRequest =
					!newConfig.url.startsWith("http") || newConfig.url.includes(API_URL);

				if (token && isApiRequest) {
					// Ensure headers object exists
					newConfig.headers = newConfig.headers || {};
					newConfig.headers.Authorization = `Bearer ${token}`;
				}
				return newConfig;
			},
			(error) => Promise.reject(error)
		);

		// Configure response interceptor for error handling
		axios.interceptors.response.use(
			(response) => response,
			(error) => {
				// Handle 401 Unauthorized errors
				if (error.response?.status === 401) {
					console.log("Unauthorized API request, clearing credentials");
					// Clear user data
					localStorage.removeItem(STORAGE_KEYS.token);
					localStorage.removeItem(STORAGE_KEYS.USER);
					localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);

					// Dispatch event to notify app of disconnection
					window.dispatchEvent(new Event("walletDisconnected"));
				}

				return Promise.reject(error);
			}
		);

		// Set default Authorization header for new requests
		if (token) {
			axios.defaults.headers.common.Authorization = `Bearer ${token}`;
			console.log("🔍 Authorization header set");
		} else {
			delete axios.defaults.headers.common.Authorization;
			console.log("🔍 Authorization header cleared");
		}

		console.log("🔍 Axios interceptors configured", { hasToken: !!token });
	} catch (error) {
		console.error("Error setting up axios interceptors:", error);
	}
};

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
const ProfileSetup = lazy(() => import("./pages/settings/ProfileSetup.jsx"));
const AccountSettings = lazy(() =>
	import("./pages/settings/AccountSettings.jsx")
);

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
const ProtectedRoute = ({
	children,
	requireAuth = true,
	requireProfile = false,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { connectionState, userState, user, isLoading } = useAccount();
	const { isAuthenticated } = useAuth();
	const [routeDecision, setRouteDecision] = useState("pending"); // pending, allowed, redirect
	const [redirectPath, setRedirectPath] = useState(null);
	const hasCheckedStorage = useRef(false);

	// First check localStorage for authentication data
	useEffect(() => {
		if (hasCheckedStorage.current) return;
		hasCheckedStorage.current = true;

		// Get stored credentials
		const storedToken = localStorage.getItem(STORAGE_KEYS.token);
		const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
		const storedWallet = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
		const hasStoredCreds = storedToken && storedUser && storedWallet;

		console.log("ProtectedRoute - localStorage check:", {
			path: location.pathname,
			hasStoredToken: !!storedToken,
			hasStoredUser: !!storedUser,
			hasStoredWallet: !!storedWallet,
			requireAuth,
		});

		// If public route, no need to check credentials
		if (!requireAuth) return;

		// For auth routes, check if we have stored credentials
		if (!hasStoredCreds) {
			// If no stored credentials and requiring auth, prepare to redirect
			if (location.pathname !== "/connect") {
				setRouteDecision("redirect");
				setRedirectPath("/connect");
			}
		}
	}, [location.pathname, requireAuth]);

	// Determine whether this route can be accessed
	useEffect(() => {
		// If still loading, maintain current decision
		if (isLoading) return;

		// Skip if already decided to redirect based on localStorage check
		if (routeDecision === "redirect" && redirectPath) return;

		// Start with a clean decision
		let decision = "pending";
		let redirectTo = null;

		// Public routes don't need auth checks
		if (!requireAuth) {
			decision = "allowed";
		}
		// Handle auth required routes
		else {
			// First check for stored credentials as backup
			const storedToken = localStorage.getItem(STORAGE_KEYS.token);
			const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
			const storedWallet = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
			const hasStoredCreds = storedToken && storedUser && storedWallet;

			// If no active connection but we have stored credentials, consider authenticated
			if (connectionState === "disconnected" && hasStoredCreds) {
				console.log("Using stored credentials since wallet is disconnected");
				decision = "allowed";
			}
			// Check connection state
			else if (connectionState === "disconnected" && !hasStoredCreds) {
				decision = "redirect";
				redirectTo = "/connect";
			}
			// Then authentication
			else if (!isAuthenticated && !hasStoredCreds) {
				decision = "redirect";
				redirectTo = "/connect";
			}
			// Then profile requirements
			else if (requireProfile && userState === USER_STATES.NO_PROFILE) {
				decision = "redirect";
				redirectTo = "/profile-setup";
			}
			// All checks passed
			else {
				decision = "allowed";
			}
		}

		// Update component state with decision
		setRouteDecision(decision);
		setRedirectPath(redirectTo);

		// Apply redirect if needed
		if (decision === "redirect" && redirectTo) {
			console.log(`Protected route redirecting to: ${redirectTo}`);
			navigate(redirectTo, { replace: true });
		}
	}, [
		connectionState,
		userState,
		isAuthenticated,
		requireAuth,
		requireProfile,
		navigate,
		isLoading,
		routeDecision,
		redirectPath,
	]);

	// Log for debugging
	useEffect(() => {
		console.log("ProtectedRoute state:", {
			path: location.pathname,
			requireAuth,
			requireProfile,
			decision: routeDecision,
			redirectPath,
			connectionState,
			userState,
			isAuthenticated,
			isLoading,
		});
	}, [
		location.pathname,
		requireAuth,
		requireProfile,
		routeDecision,
		redirectPath,
		connectionState,
		userState,
		isAuthenticated,
		isLoading,
	]);

	// Show loading while determining access
	if (isLoading || routeDecision === "pending") {
		return (
			<LoadingSpinner
				fullScreen
				size="large"
				message="Checking authorization..."
			/>
		);
	}

	// Only render children if explicitly allowed
	if (routeDecision === "allowed") {
		return children;
	}

	// Fallback loading state while redirect happens
	return <LoadingSpinner fullScreen size="large" message="Redirecting..." />;
};

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
	requireAuth: PropTypes.bool,
	requireProfile: PropTypes.bool,
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
	const [isInitialCheckComplete, setIsInitialCheckComplete] = useState(false);

	// Check if we're still loading
	const isLoading = authLoading || accountLoading;

	// Initialize Axios interceptors on mount - this should happen BEFORE any other useEffect
	useEffect(() => {
		const storedToken = localStorage.getItem(STORAGE_KEYS.token);
		if (storedToken) {
			console.log(
				"🔒 Setting up axios interceptors on app mount with stored token"
			);
			setupAxiosInterceptors(storedToken);
		} else {
			console.log("⚠️ No token found in localStorage on app mount");
		}
	}, []);

	// Perform initial app loading check before rendering any routes
	useEffect(() => {
		if (!isLoading) {
			// Wait a bit to ensure all connections and checks are complete
			const timer = setTimeout(() => {
				// Double check token setup before completing initialization
				const storedToken = localStorage.getItem(STORAGE_KEYS.token);
				if (storedToken) {
					// Make sure axios interceptors are set up
					setupAxiosInterceptors(storedToken);
				}

				setIsInitialCheckComplete(true);
				console.log("🚀 Initial app check complete, ready to render routes");
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [isLoading]);

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
			isInitialCheckComplete,
		});
	}

	// Show initial loading screen until all checks are complete
	if (!isInitialCheckComplete) {
		return (
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: "#3b81f6",
						colorLink: "#3b81f6",
					},
				}}
			>
				<LoadingSpinner
					fullScreen={true}
					message="Initializing application..."
					size="large"
					delay={200}
				/>
			</ConfigProvider>
		);
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
						<Route
							path="/"
							element={
								<ProtectedRoute requireAuth={false}>
									<ConnectWallet />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/connect"
							element={
								<ProtectedRoute requireAuth={false}>
									<ConnectWallet />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile-setup"
							element={
								<ProtectedRoute requireAuth={true}>
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

						{/* Protected Routes with DashboardLayout */}
						<Route
							element={
								<ProtectedRoute requireAuth={true}>
									<Suspense
										fallback={<LoadingSpinner message="Loading dashboard..." />}
									>
										<DashboardLayout />
									</Suspense>
								</ProtectedRoute>
							}
						>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/dashboard/businesses" element={<MyBusinesses />} />
							<Route path="/settings" element={<AccountSettings />} />
							<Route path="/dashboard/*" element={<Dashboard />} />

							{/* Business Routes */}
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

							{/* Other Protected Routes */}
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
						</Route>

						{/* Catch-all route */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</div>
			</ErrorBoundary>
		</ConfigProvider>
	);
};

export default App;
