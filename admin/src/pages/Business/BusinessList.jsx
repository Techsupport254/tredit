import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import BusinessCard from "../../Components/Business/BusinessCard";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import { useBusiness } from "../../Context/BusinessContext";
import { useAuth } from "../../Context/AuthContext";
import { STORAGE_KEYS } from "../../utils/storage";
import { Tabs, Empty, Input, Button, Badge, Space, Card } from "antd";
import {
	PlusOutlined,
	SearchOutlined,
	FilterOutlined,
	ShopOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
} from "@ant-design/icons";

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

// Define tabs for Ant Design Tabs component
const tabs = [
	{ key: "all", label: "All Businesses", icon: <ShopOutlined /> },
	{ key: "active", label: "Active", icon: <CheckCircleOutlined /> },
	{ key: "pending", label: "Pending", icon: <ClockCircleOutlined /> },
	{ key: "closed", label: "Closed", icon: <CloseCircleOutlined /> },
];

const BusinessList = () => {
	const { businesses, isLoading: loading, fetchAllBusinesses } = useBusiness();
	const { user } = useAuth();
	const navigate = useNavigate();

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
		const loadBusinesses = async () => {
			try {
				// Check for token before making the request
				const token = localStorage.getItem(STORAGE_KEYS.token);
				if (!token) {
					console.error(
						"Authentication token not found when loading businesses"
					);
					navigate("/connect");
					return;
				}

				console.log(
					"Loading businesses with token:",
					token.substring(0, 10) + "..." + token.substring(token.length - 5)
				);
				const result = await fetchAllBusinesses();

				if (!result) {
					console.warn("No businesses data returned from API");
				} else {
					console.log(`Loaded ${result.length} businesses successfully`);
				}
			} catch (error) {
				console.error("Failed to load businesses:", error);
				if (error.response?.status === 401 || error.response?.status === 403) {
					// If unauthorized, redirect to connect page
					navigate("/connect");
				}
			}
		};

		if (!isMounted.current) {
			loadBusinesses();
			isMounted.current = true;
		}
	}, [fetchAllBusinesses, navigate]);

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

	const handleTabChange = useCallback((tabKey) => {
		setActiveTab(tabKey);
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

	// Generate items for Ant Design Tabs
	const tabItems = useMemo(() => {
		return tabs.map((tab) => ({
			key: tab.key,
			label: (
				<Space align="center">
					{tab.icon}
					<span>{tab.label}</span>
					<span className="inline-flex items-center justify-center text-xs font-medium rounded-full bg-blue-100 text-blue-800 min-w-[20px] h-5 px-1.5">
						{tabCounts[tab.key]}
					</span>
				</Space>
			),
			children: (
				<div className="business-list-content">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-64">
							<LoadingSpinner size={40} />
							<p className="mt-4 text-sm text-gray-500">
								Loading businesses...
							</p>
						</div>
					) : filteredBusinesses.length === 0 ? (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span>
									{activeTab === "all"
										? "No businesses found. Create your first business!"
										: `No ${activeTab} businesses found`}
								</span>
							}
						>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={() => navigate("/dashboard/businesses/create")}
							>
								Create Business
							</Button>
						</Empty>
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
				</div>
			),
		}));
	}, [loading, filteredBusinesses, tabCounts, activeTab, view, navigate]);

	return (
		<div className="min-h-screen">
			<Card className="border">
				<div className="flex items-center justify-between">
					<Input
						placeholder="Search businesses"
						prefix={<SearchOutlined />}
						value={searchTerm}
						onChange={handleSearchChange}
						style={{ maxWidth: 300 }}
					/>
					<Space>
						<Button icon={<FilterOutlined />} onClick={toggleFilters}>
							Filter
						</Button>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => navigate("/dashboard/businesses/create")}
						>
							New Business
						</Button>
					</Space>
				</div>

				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}
					items={tabItems}
					tabBarGutter={24}
				/>
			</Card>

			{/* Mobile FAB */}
			<Link
				to="/dashboard/businesses/create"
				className="fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 text-white bg-blue-600 rounded-full shadow-lg md:hidden hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				<FaPlus className="w-7 h-7" />
			</Link>

			{/* Mobile Filters Modal */}
			{showFilters && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden ">
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
