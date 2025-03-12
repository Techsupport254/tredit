import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter, FaTimes, FaStore } from "react-icons/fa";
import BusinessCard from "../../Components/Business/BusinessCard";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import { useBusiness } from "../../Context/BusinessContext";
import { useAuth } from "../../Context/AuthContext";

// Move helper functions outside component to prevent recreation
const fuzzyMatch = (text, search) => {
	if (!search) return true;
	const searchLower = search.toLowerCase();
	const textLower = text?.toLowerCase() || "";
	let searchIndex = 0;
	for (
		let i = 0;
		i < textLower.length && searchIndex < searchLower.length;
		i++
	) {
		if (textLower[i] === searchLower[searchIndex]) {
			searchIndex++;
		}
	}
	return searchIndex === searchLower.length;
};

const calculateSearchScore = (business, searchTerm) => {
	if (!searchTerm) return 1;

	const searchLower = searchTerm.toLowerCase();
	const fields = [
		business.name || "",
		business.description || "",
		business.category || "",
		...(business.tags || []),
		...(business.serviceCategories || []),
		business.businessModel || "",
		business.operationMode || "",
	];

	let score = 0;
	fields.forEach((field) => {
		const fieldLower = field.toLowerCase();
		if (fieldLower.includes(searchLower)) {
			score += 3;
		} else if (fuzzyMatch(fieldLower, searchLower)) {
			score += 1;
		}
	});

	return score;
};

const tabs = [
	{ id: "all", label: "All Businesses", icon: FaStore },
	{ id: "active", label: "Active", icon: FaStore },
	{ id: "pending", label: "Pending", icon: FaStore },
	{ id: "closed", label: "Closed", icon: FaStore },
];

const BusinessList = () => {
	const { businesses, isLoading: loading, fetchAllBusinesses } = useBusiness();
	const { user } = useAuth();

	// Use refs to track mount state
	const isMounted = useRef(false);

	// Memoize initial state
	const initialFilters = useMemo(
		() => ({
			status: "all",
			type: "all",
			verificationStatus: "all",
		}),
		[]
	);

	// State
	const [view] = useState("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [activeTab, setActiveTab] = useState("all");
	const [filters, setFilters] = useState(initialFilters);
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch data only once on mount
	useEffect(() => {
		if (!isMounted.current) {
			fetchAllBusinesses();
			isMounted.current = true;
		}
	}, [fetchAllBusinesses]);

	// Memoized handlers
	const handleFilterChange = useCallback((field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
	}, []);

	const toggleFilters = useCallback(() => {
		setShowFilters((prev) => !prev);
	}, []);

	const handleSearchChange = useCallback((e) => {
		setSearchTerm(e.target.value);
	}, []);

	const handleTabChange = useCallback((tabId) => {
		setActiveTab(tabId);
	}, []);

	// Memoized filtered businesses
	const filteredBusinesses = useMemo(() => {
		if (!Array.isArray(businesses)) return [];

		return businesses
			.filter((business) => {
				if (activeTab !== "all") {
					if (activeTab === "active" && business.status !== "active")
						return false;
					if (activeTab === "pending" && business.status !== "pending")
						return false;
					if (activeTab === "closed" && business.status !== "closed")
						return false;
				}

				return (
					(filters.status === "all" || business.status === filters.status) &&
					(filters.type === "all" || business.type === filters.type) &&
					(filters.verificationStatus === "all" ||
						business.verificationStatus === filters.verificationStatus)
				);
			})
			.map((business) => ({
				...business,
				searchScore: calculateSearchScore(business, searchTerm),
			}))
			.filter((business) => business.searchScore > 0)
			.sort((a, b) => b.searchScore - a.searchScore);
	}, [businesses, filters, searchTerm, activeTab]);

	// Memoize tab counts
	const tabCounts = useMemo(
		() => ({
			all: filteredBusinesses.length,
			active: filteredBusinesses.filter((b) => b.status === "active").length,
			pending: filteredBusinesses.filter((b) => b.status === "pending").length,
			closed: filteredBusinesses.filter((b) => b.status === "closed").length,
		}),
		[filteredBusinesses]
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Tabs */}
			<div className="sticky top-0 z-20 bg-white border-b border-gray-200">
				<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
					{/* Search and Actions */}
					<div className="flex items-center justify-between h-16 border-b border-gray-200 md:border-none">
						<div className="relative flex-1 max-w-sm">
							<FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Filter businesses"
								className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								value={searchTerm}
								onChange={handleSearchChange}
							/>
						</div>
						<div className="flex items-center gap-2 ml-2">
							<button
								onClick={toggleFilters}
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

					{/* Tabs */}
					<div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<div className="flex min-w-max space-x-1 h-14">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => handleTabChange(tab.id)}
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
											{tabCounts[tab.id]}
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
				) : filteredBusinesses.length === 0 ? (
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
							<BusinessCard key={business.id} business={business} view={view} />
						))}
					</div>
				)}

				{/* Mobile FAB */}
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
								onClick={toggleFilters}
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
									onChange={(e) => handleFilterChange("status", e.target.value)}
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
									onChange={(e) => handleFilterChange("type", e.target.value)}
								>
									<option value="all">All Types</option>
									<option value="product">Product</option>
									<option value="service">Service</option>
								</select>
							</div>
							<div>
								<label className="block mb-2 text-sm font-medium text-gray-700">
									Verification Status
								</label>
								<select
									className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={filters.verificationStatus}
									onChange={(e) =>
										handleFilterChange("verificationStatus", e.target.value)
									}
								>
									<option value="all">All Statuses</option>
									<option value="pending">Pending</option>
									<option value="verified">Verified</option>
									<option value="rejected">Rejected</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BusinessList;
