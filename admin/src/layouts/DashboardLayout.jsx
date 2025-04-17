import { Suspense, memo, useState, useEffect } from "react";
import { Outlet, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Mainbar from "../Components/Mainbar";
import Breadcrumbs from "../Components/Breadcrumb";
import LoadingOverlay from "../components/LoadingOverlay";
import LoadingSpinner from "../Components/Common/LoadingSpinner";
import { Dashboard404Page } from "../pages/NotFoundPage.jsx";
import { lazy } from "react";

// Lazy load components with specific chunk names
const Dashboard = lazy(() =>
	import(/* webpackChunkName: "dashboard" */ "../pages/Dashboard.jsx")
);
const MyBusinesses = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/BusinessList.jsx"
	)
);
const CreateBusiness = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/CreateBusiness.jsx"
	)
);
const EditBusiness = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/EditBusiness.jsx"
	)
);
const BusinessDetails = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/BusinessDetails.jsx"
	)
);
const ListingsManager = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/ListingsManager.jsx"
	)
);
const StockControl = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/StockControl.jsx"
	)
);
const BusinessOrders = lazy(() =>
	import(
		/* webpackChunkName: "businesses" */ "../pages/Business/BusinessOrders.jsx"
	)
);
const Analytics = lazy(() =>
	import(/* webpackChunkName: "analytics" */ "../pages/Business/Analytics.jsx")
);
const ProductDetails = lazy(() =>
	import(
		/* webpackChunkName: "products" */ "../pages/products/ProductDetails.jsx"
	)
);
const ServiceDetails = lazy(() =>
	import(
		/* webpackChunkName: "services" */ "../pages/services/ServiceDetails.jsx"
	)
);
const CustomerInsights = lazy(() =>
	import(
		/* webpackChunkName: "analytics" */ "../pages/analytics/CustomerInsights.jsx"
	)
);
const ProductPerformance = lazy(() =>
	import(
		/* webpackChunkName: "analytics" */ "../pages/analytics/ProductPerformance.jsx"
	)
);
const TransactionOverview = lazy(() =>
	import(
		/* webpackChunkName: "transactions" */ "../pages/transactions/Overview.jsx"
	)
);
const EscrowManagement = lazy(() =>
	import(
		/* webpackChunkName: "transactions" */ "../pages/transactions/Escrow.jsx"
	)
);
const PaymentHistory = lazy(() =>
	import(
		/* webpackChunkName: "transactions" */ "../pages/transactions/History.jsx"
	)
);
const PayoutSettings = lazy(() =>
	import(
		/* webpackChunkName: "transactions" */ "../pages/transactions/Payouts.jsx"
	)
);
const ActiveDisputes = lazy(() =>
	import(/* webpackChunkName: "disputes" */ "../pages/disputes/Active.jsx")
);
const ResolutionCenter = lazy(() =>
	import(/* webpackChunkName: "disputes" */ "../pages/disputes/Resolution.jsx")
);
const DisputeHistory = lazy(() =>
	import(/* webpackChunkName: "disputes" */ "../pages/disputes/History.jsx")
);
const Messages = lazy(() =>
	import(
		/* webpackChunkName: "communications" */ "../pages/communications/Messages.jsx"
	)
);
const Announcements = lazy(() =>
	import(
		/* webpackChunkName: "communications" */ "../pages/communications/Announcements.jsx"
	)
);
const NotificationSettings = lazy(() =>
	import(
		/* webpackChunkName: "communications" */ "../pages/communications/Settings.jsx"
	)
);
const AccountSettings = lazy(() =>
	import(
		/* webpackChunkName: "settings" */ "../pages/settings/AccountSettings.jsx"
	)
);
const Security = lazy(() =>
	import(/* webpackChunkName: "settings" */ "../pages/settings/Security.jsx")
);
const ApiKeys = lazy(() =>
	import(/* webpackChunkName: "settings" */ "../pages/settings/ApiKeys.jsx")
);
const Logout = lazy(() =>
	import(/* webpackChunkName: "logout" */ "../pages/Logout")
);

// Lightweight route suspense with optimized fallback
const SuspenseRoute = ({ component: Component }) => (
	<Suspense fallback={<div className="p-4">Loading...</div>}>
		<Component />
	</Suspense>
);

// Memoize the DashboardLayout to prevent unnecessary re-renders
const DashboardLayout = memo(() => {
	const [isReady, setIsReady] = useState(false);

	// Add a small delay before rendering content to reduce flickering
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsReady(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	// Show a loading indicator until ready
	if (!isReady) {
		return (
			<LoadingSpinner
				fullScreen
				size="large"
				message="Loading dashboard..."
				delay={100}
			/>
		);
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Breadcrumbs />
				<div className="flex-1 overflow-auto">
					<Mainbar>
						<Suspense
							fallback={<LoadingSpinner overlay message="Loading content..." />}
						>
							<Routes>
								<Route
									index
									element={<SuspenseRoute component={Dashboard} />}
								/>
								<Route
									path="dashboard"
									element={<SuspenseRoute component={Dashboard} />}
								/>

								{/* Business Hub Routes */}
								<Route path="businesses">
									<Route
										index
										element={<SuspenseRoute component={MyBusinesses} />}
									/>
									<Route
										path="create"
										element={<SuspenseRoute component={CreateBusiness} />}
									/>
									<Route
										path=":id([a-f0-9-]+)"
										element={<SuspenseRoute component={BusinessDetails} />}
									/>
									<Route
										path=":id([a-f0-9-]+)/edit"
										element={<SuspenseRoute component={EditBusiness} />}
									/>
									<Route
										path="listings"
										element={<SuspenseRoute component={ListingsManager} />}
									/>
									<Route
										path="inventory"
										element={<SuspenseRoute component={StockControl} />}
									/>
									<Route
										path="orders"
										element={<SuspenseRoute component={BusinessOrders} />}
									/>
									<Route
										path="analytics"
										element={<SuspenseRoute component={Analytics} />}
									/>
									{/* Redirect invalid business paths to business list */}
									<Route
										path="*"
										element={<Navigate to="/dashboard/businesses" replace />}
									/>
								</Route>

								{/* Product & Service Routes */}
								<Route
									path="products/:id"
									element={<SuspenseRoute component={ProductDetails} />}
								/>
								<Route path="products/*" element={<Dashboard404Page />} />
								<Route
									path="services/:id"
									element={<SuspenseRoute component={ServiceDetails} />}
								/>
								<Route path="services/*" element={<Dashboard404Page />} />

								{/* Analytics Routes */}
								<Route path="analytics">
									<Route
										index
										element={<SuspenseRoute component={Analytics} />}
									/>
									<Route
										path="customers"
										element={<SuspenseRoute component={CustomerInsights} />}
									/>
									<Route
										path="products"
										element={<SuspenseRoute component={ProductPerformance} />}
									/>
									<Route path="*" element={<Dashboard404Page />} />
								</Route>

								{/* Transaction Hub Routes */}
								<Route path="transactions">
									<Route
										path="overview"
										element={<SuspenseRoute component={TransactionOverview} />}
									/>
									<Route
										path="escrow"
										element={<SuspenseRoute component={EscrowManagement} />}
									/>
									<Route
										path="history"
										element={<SuspenseRoute component={PaymentHistory} />}
									/>
									<Route
										path="payouts"
										element={<SuspenseRoute component={PayoutSettings} />}
									/>
									<Route path="*" element={<Dashboard404Page />} />
								</Route>

								{/* Dispute Management Routes */}
								<Route path="disputes">
									<Route
										path="active"
										element={<SuspenseRoute component={ActiveDisputes} />}
									/>
									<Route
										path="resolution"
										element={<SuspenseRoute component={ResolutionCenter} />}
									/>
									<Route
										path="history"
										element={<SuspenseRoute component={DisputeHistory} />}
									/>
									<Route path="*" element={<Dashboard404Page />} />
								</Route>

								{/* Communication Routes */}
								<Route path="communications">
									<Route
										path="messages"
										element={<SuspenseRoute component={Messages} />}
									/>
									<Route
										path="announcements"
										element={<SuspenseRoute component={Announcements} />}
									/>
									<Route
										path="settings"
										element={<SuspenseRoute component={NotificationSettings} />}
									/>
									<Route path="*" element={<Dashboard404Page />} />
								</Route>

								{/* Settings Routes */}
								<Route path="settings">
									<Route
										path="account"
										element={<SuspenseRoute component={AccountSettings} />}
									/>
									<Route
										path="security"
										element={<SuspenseRoute component={Security} />}
									/>
									<Route
										path="api"
										element={<SuspenseRoute component={ApiKeys} />}
									/>
									<Route path="*" element={<Dashboard404Page />} />
								</Route>

								<Route
									path="logout"
									element={<SuspenseRoute component={Logout} />}
								/>

								{/* Catch-all route for dashboard */}
								<Route path="*" element={<Dashboard404Page />} />
							</Routes>
						</Suspense>
					</Mainbar>
				</div>
			</div>
		</div>
	);
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;
