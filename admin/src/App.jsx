import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAccount } from "./Context/AccountContext";
import { useAuth } from "./Context/AuthContext";
import LoadingOverlay from "./components/LoadingOverlay";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { ToastContainer } from "react-toastify";
import PropTypes from "prop-types";
import "react-toastify/dist/ReactToastify.css";

// Lazy load layouts
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

// Lazy load auth components
const ConnectWallet = lazy(() => import("./Components/Profile/ConnectWallet"));
const ProfileSetup = lazy(() => import("./pages/settings/ProfileSetup.jsx"));

// Lazy load dashboard components
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load products components
const ProductCatalog = lazy(() => import("./pages/products/AllProducts.jsx"));
const AddProduct = lazy(() => import("./pages/products/AddProduct"));
const Inventory = lazy(() => import("./pages/products/Inventory"));

// Lazy load finance components
const Finance = lazy(() => import("./pages/payments/PaymentOverview.jsx"));
const Payouts = lazy(() => import("./pages/payments/PayoutRequests.jsx"));

// Lazy load settings components
const ProfileSettings = lazy(() =>
	import("./pages/settings/ProfileSettings.jsx")
);

// Lazy load logout component
const Logout = lazy(() => import("./pages/Logout"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
	const { walletAddress, user, loading } = useAccount();
	const { user: authUser } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && (!walletAddress || !user || !authUser)) {
			navigate("/connect", { replace: true });
		}
	}, [walletAddress, user, authUser, loading, navigate]);

	if (loading) return <LoadingOverlay message="Loading..." />;
	if (!walletAddress || !user || !authUser) return null;

	return children;
};

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

const App = () => {
	return (
		<>
			<Suspense fallback={<LoadingOverlay message="Loading..." />}>
				<Routes>
					{/* Public Routes */}
					<Route path="/connect" element={<ConnectWallet />} />
					<Route path="/create-profile" element={<ProfileSetup />} />

					{/* Protected Routes with DashboardLayout */}
					<Route
						element={
							<ProtectedRoute>
								<DashboardLayout />
							</ProtectedRoute>
						}
					>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />

						{/* Products Routes */}
						<Route path="/products">
							<Route index element={<ProductCatalog />} />
							<Route path="add" element={<AddProduct />} />
							<Route path="inventory" element={<Inventory />} />
						</Route>

						{/* Finance Routes */}
						<Route path="/finance">
							<Route index element={<Finance />} />
							<Route path="payouts" element={<Payouts />} />
						</Route>

						{/* Settings Routes */}
						<Route path="/settings">
							<Route path="profile" element={<ProfileSettings />} />
						</Route>

						{/* Logout */}
						<Route path="/logout" element={<Logout />} />

						{/* 404 for authenticated routes */}
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
