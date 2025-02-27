import TopStats from "../Components/Dashboard/TopStats";
import Sales from "../Components/Dashboard/Sales";
import CategorySales from "../Components/Dashboard/CategorySales";
import Recent from "../Components/Dashboard/Recent";

const Dashboard = () => {
	return (
		<div className="w-full min-h-screen p-0">
			{/* Top Stats Section */}
			<TopStats />

			{/* Sales Overview Section */}
			<Sales />

			{/* Category Sales Section */}
			<CategorySales />

			{/* Recent Transactions & Notifications */}
			<Recent />
		</div>
	);
};

export default Dashboard;
