import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter, FaTimes, FaStore } from "react-icons/fa";
import BusinessCard from "../../Components/Business/BusinessCard";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import { showError } from "../../utils/notifications";

const BusinessList = () => {
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState("all");
	const [filters, setFilters] = useState({
		status: "all",
		type: "all",
		verificationStatus: "all",
	});
	const [searchTerm, setSearchTerm] = useState("");

	const tabs = [
		{ id: "all", label: "All Businesses", count: 0, icon: FaStore },
		{ id: "active", label: "Active", count: 0, icon: FaStore },
		{ id: "pending", label: "Pending", count: 0, icon: FaStore },
		{ id: "closed", label: "Closed", count: 0, icon: FaStore },
	];

	useEffect(() => {
		fetchBusinesses();
	}, []);

	const fetchBusinesses = async () => {
		try {
			const response = await fetch("http://localhost:8000/api/businesses");
			if (response.ok) {
				const data = await response.json();
				setBusinesses(data.data);
			} else {
				showError("Failed to fetch businesses");
			}
		} catch (error) {
			console.error("Error fetching businesses:", error);
			showError("An error occurred while fetching businesses");
		} finally {
			setLoading(false);
		}
	};

	const filteredBusinesses = businesses.filter((business) => {
		const matchesSearch =
			business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			business.description.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesFilters =
			(filters.status === "all" || business.status === filters.status) &&
			(filters.type === "all" || business.type === filters.type) &&
			(filters.verificationStatus === "all" ||
				business.verificationStatus === filters.verificationStatus);

		return matchesSearch && matchesFilters;
	});

	// Update tab counts based on filtered businesses
	tabs[0].count = filteredBusinesses.length;
	tabs[1].count = filteredBusinesses.filter(
		(b) => b.status === "active"
	).length;
	tabs[2].count = filteredBusinesses.filter(
		(b) => b.status === "pending"
	).length;
	tabs[3].count = filteredBusinesses.filter(
		(b) => b.status === "closed"
	).length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Tabs */}
			<div className="sticky top-0 z-20 bg-white border-b border-gray-200">
				<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
					{/* Search and Actions - Always visible */}
					<div className="flex items-center justify-between h-16 border-b border-gray-200 md:border-none">
						<div className="relative flex-1 max-w-sm">
							<FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Filter businesses"
								className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-2 ml-2">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								<FaFilter className="w-4 h-4" />
							</button>
							<Link
								to="/businesses/create"
								className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								<FaPlus className="w-4 h-4 mr-2" />
								New Business
							</Link>
						</div>
					</div>

					{/* Tabs Row - Scrollable on mobile */}
					<div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<div className="flex min-w-max space-x-1 h-14">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
											${
												activeTab === tab.id
													? "bg-indigo-50 text-indigo-600"
													: "text-gray-600 hover:bg-gray-100"
											}`}
									>
										<Icon className="w-4 h-4 mr-2" />
										<span>{tab.label}</span>
										<span
											className={`ml-2 px-2 py-0.5 text-xs rounded-full
											${
												activeTab === tab.id
													? "bg-indigo-100 text-indigo-600"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{tab.count}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
				{/* Results Count */}
				<div className="mb-4">
					<p className="text-sm text-gray-600">
						Showing{" "}
						<span className="font-medium text-gray-900">
							{filteredBusinesses.length}
						</span>{" "}
						{filteredBusinesses.length === 1 ? "business" : "businesses"}
					</p>
				</div>

				{/* Business List */}
				{loading ? (
					<div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg">
						<LoadingSpinner size={40} />
						<p className="mt-4 text-sm text-gray-500">Loading businesses...</p>
					</div>
				) : (
					<>
						{filteredBusinesses.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg">
								<div className="p-4 mb-4 text-gray-400 bg-gray-100 rounded-full">
									<FaStore className="w-8 h-8" />
								</div>
								<h3 className="mb-2 text-lg font-medium text-gray-900">
									No businesses found
								</h3>
								<p className="text-sm text-gray-500">
									Try adjusting your search or filters
								</p>
							</div>
						) : (
							<div
								className={
									view === "grid"
										? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
										: "space-y-4"
								}
							>
								{filteredBusinesses.map((business) => (
									<BusinessCard
										key={business.id}
										business={business}
										view={view}
									/>
								))}
							</div>
						)}
					</>
				)}

				{/* Mobile FAB - Larger touch target */}
				<Link
					to="/businesses/create"
					className="fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 text-white bg-indigo-600 rounded-full shadow-lg md:hidden hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<FaPlus className="w-7 h-7" />
				</Link>
			</div>

			{/* Mobile Filters Modal */}
			{showFilters && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
					<div className="absolute bottom-0 w-full bg-white rounded-t-xl">
						<div className="flex items-center justify-between p-4 border-b">
							<h3 className="text-lg font-medium">Filters</h3>
							<button
								onClick={() => setShowFilters(false)}
								className="p-2 text-gray-500 hover:text-gray-700"
							>
								<FaTimes className="w-5 h-5" />
							</button>
						</div>
						<div className="p-4 space-y-4">
							<div>
								<label className="block mb-2 text-sm font-medium text-gray-700">
									Status
								</label>
								<select
									className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={filters.status}
									onChange={(e) =>
										setFilters({
											...filters,
											status: e.target.value,
										})
									}
								>
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="closed">Closed</option>
								</select>
							</div>
							<div>
								<label className="block mb-2 text-sm font-medium text-gray-700">
									Type
								</label>
								<select
									className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={filters.type}
									onChange={(e) =>
										setFilters({
											...filters,
											type: e.target.value,
										})
									}
								>
									<option value="all">All Types</option>
									<option value="product">Product</option>
									<option value="service">Service</option>
								</select>
							</div>
							<div>
								<label className="block mb-2 text-sm font-medium text-gray-700">
									Verification
								</label>
								<select
									className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={filters.verificationStatus}
									onChange={(e) =>
										setFilters({
											...filters,
											verificationStatus: e.target.value,
										})
									}
								>
									<option value="all">All Verification</option>
									<option value="pending">Pending</option>
									<option value="verified">Verified</option>
									<option value="rejected">Rejected</option>
								</select>
							</div>
							<div>
								<label className="block mb-2 text-sm font-medium text-gray-700">
									View
								</label>
								<div className="flex gap-2">
									<button
										className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
											view === "grid"
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-700"
										}`}
										onClick={() => setView("grid")}
									>
										Grid
									</button>
									<button
										className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
											view === "list"
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-700"
										}`}
										onClick={() => setView("list")}
									>
										List
									</button>
								</div>
							</div>
						</div>
						<div className="p-4 border-t">
							<button
								onClick={() => setShowFilters(false)}
								className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
							>
								Apply Filters
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BusinessList;
