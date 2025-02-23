import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom"; // Replace Switch with Routes
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { Spin } from "antd";

// Mapping paths to actual component file names
const pageMapping = {
	"/": "Dashboard",
	"/products": "AllProducts",
	"/products/add": "AddProduct",
	"/products/inventory": "Inventory",
	"/products/categories": "Categories",
	"/orders": "AllOrders",
	"/orders/pending": "PendingOrders",
	"/orders/completed": "CompletedOrders",
	"/orders/refunds": "ReturnsRefunds",
	"/payments": "PaymentOverview",
	"/payments/payouts": "PayoutRequests",
	"/payments/history": "TransactionHistory",
	"/analytics/sales": "SalesAnalytics",
	"/analytics/products": "ProductPerformance",
	"/analytics/customers": "CustomerInsights",
	"/customers": "AllCustomers",
	"/customers/reviews": "FeedbackReviews",
	"/customers/queries": "CustomerQueries",
	"/disputes": "AllDisputes",
	"/disputes/open": "OpenDisputes",
	"/disputes/resolved": "ResolvedDisputes",
	"/settings/profile": "ProfileSettings",
	"/settings/business": "BusinessInfo",
	"/settings/payments": "PaymentSettings",
	"/settings/security": "Security",
	"/support/help": "HelpCenter",
	"/support/contact": "ContactSupport",
	"/support/faqs": "FAQs",
	"/profile": "MyProfile",
	"/profile/verification": "VerificationStatus",
	"/profile/security": "AccountSecurity",
	"/profile/wallet": "Wallet",
	"/profile/edit": "EditProfile",
	"/logout": "Logout",
};

// Function to dynamically import components based on corrected names
const lazyLoadComponent = (path) => {
	// Handle the root route separately.
	if (path === "/") {
		console.debug("Loading component for route '/' -> Dashboard");
		return lazy(() =>
			import("./pages/Dashboard.jsx")
				.then((module) => {
					console.debug("Successfully loaded Dashboard.jsx");
					return module;
				})
				.catch((error) => {
					console.error("Error loading Dashboard.jsx:", error);
					return import("./pages/NotFoundPage.jsx");
				})
		);
	}

	const parts = path.split("/");
	const category = parts[1]; // e.g., "products", "orders", etc.
	const componentName = pageMapping[path];

	if (!componentName) {
		console.warn(`No component mapping found for route: ${path}`);
		return lazy(() => import("./pages/NotFoundPage.jsx"));
	}

	const formattedPath = `./pages/${category}/${componentName}.jsx`;
	console.debug(`Loading component for route '${path}' -> ${formattedPath}`);

	return lazy(() =>
		import(/* @vite-ignore */ formattedPath)
			.then((module) => {
				console.debug(`Successfully loaded ${formattedPath}`);
				return module;
			})
			.catch((error) => {
				console.error(`Error loading ${formattedPath}:`, error);
				return import("./pages/NotFoundPage.jsx");
			})
	);
};

const RoutesComponent = () => {
	return (
		<Suspense
			fallback={
				<div className="text-center p-6">
					<Spin
						size="large"
						style={{
							height: "100%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					/>
				</div>
			}
		>
			<Routes>
				{Object.keys(pageMapping).map((path) => {
					const Component = lazyLoadComponent(path);
					console.debug(`Registering route: ${path}`);
					return <Route key={path} path={path} element={<Component />} />;
				})}
				{/* Fallback Route */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Suspense>
	);
};

export default RoutesComponent;
