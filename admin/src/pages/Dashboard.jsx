import { Card } from "antd";
import TopStats from "../Components/Dashboard/TopStats";
import Sales from "../Components/Dashboard/Sales";
import CategorySales from "../Components/Dashboard/CategorySales";
import Recent from "../Components/Dashboard/Recent";
import { useEffect } from "react";

const Dashboard = () => {
	// Handle page reload after registration
	useEffect(() => {
		const shouldReload = localStorage.getItem("should_reload");
		if (shouldReload) {
			localStorage.removeItem("should_reload");
			window.location.reload();
		}
	}, []);

	return (
		<div className="min-h-full bg-gray-50">
			{/* Welcome Section */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
				<p className="mt-1 text-sm text-gray-500">
					Here's what's happening with your store today.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="mb-8">
				<TopStats />
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				{/* Sales Chart - Takes up 2 columns on large screens */}
				<Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
					<h2 className="text-lg font-medium mb-4">Sales Overview</h2>
					<Sales />
				</Card>

				{/* Category Distribution - Takes up 1 column */}
				<Card className="shadow-sm hover:shadow-md transition-shadow">
					<h2 className="text-lg font-medium mb-4">Category Distribution</h2>
					<CategorySales />
				</Card>
			</div>

			{/* Recent Activity Section */}
			<Card className="shadow-sm hover:shadow-md transition-shadow mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-medium">Recent Activity</h2>
					<button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
						View All
					</button>
				</div>
				<Recent />
			</Card>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card
					className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
					onClick={() => (window.location.href = "/products/add")}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-blue-100 rounded-lg">
							<i className="fas fa-plus text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium">Add Product</h3>
							<p className="text-sm text-gray-500">List a new item for sale</p>
						</div>
					</div>
				</Card>

				<Card
					className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
					onClick={() => (window.location.href = "/orders/pending")}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-yellow-100 rounded-lg">
							<i className="fas fa-clock text-yellow-600" />
						</div>
						<div>
							<h3 className="font-medium">Pending Orders</h3>
							<p className="text-sm text-gray-500">
								View orders awaiting action
							</p>
						</div>
					</div>
				</Card>

				<Card
					className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
					onClick={() => (window.location.href = "/analytics/sales")}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-green-100 rounded-lg">
							<i className="fas fa-chart-line text-green-600" />
						</div>
						<div>
							<h3 className="font-medium">Analytics</h3>
							<p className="text-sm text-gray-500">Check your performance</p>
						</div>
					</div>
				</Card>

				<Card
					className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
					onClick={() => (window.location.href = "/support/help")}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-purple-100 rounded-lg">
							<i className="fas fa-headset text-purple-600" />
						</div>
						<div>
							<h3 className="font-medium">Get Help</h3>
							<p className="text-sm text-gray-500">Contact support team</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default Dashboard;
