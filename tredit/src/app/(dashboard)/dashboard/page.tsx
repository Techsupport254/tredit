"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import {
	Table,
	Tag,
	Progress,
	Spin,
	Dropdown,
	Menu,
	Avatar,
	Select,
} from "antd";
import {
	UserOutlined,
	ShoppingCartOutlined,
	AppstoreOutlined,
	DollarOutlined,
	DownOutlined,
	ShopOutlined,
	ExclamationCircleOutlined,
	CloseCircleOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	SyncOutlined,
} from "@ant-design/icons";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
	Cell,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import SummaryCard from "@/components/dashboard/SummaryCard";
import SalesTrendChart from "@/components/dashboard/SalesTrendChart";
import OrdersByStatusChart from "@/components/dashboard/OrdersByStatusChart";

// Status color config for chart and tags
const STATUS_CONFIG = {
	PENDING: { color: "#fbbf24", label: "Pending" },
	PROCESSING: { color: "#3b82f6", label: "Processing" },
	SHIPPED: { color: "#8b5cf6", label: "Shipped" },
	DELIVERED: { color: "#10b981", label: "Delivered" },
	COMPLETED: { color: "#22c55e", label: "Completed" },
	CANCELLED: { color: "#ef4444", label: "Cancelled" },
	DISPUTED: { color: "#f97316", label: "Disputed" },
};

export default function Dashboard() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [businesses, setBusinesses] = useState<any[]>([]);
	const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
	const [metrics, setMetrics] = useState({
		customers: 0,
		products: 0,
		orders: 0,
		sales: 0,
	});
	const [salesTrend, setSalesTrend] = useState<any[]>([]);
	const [productViews, setProductViews] = useState<any[]>([]);
	const [orders, setOrders] = useState<any[]>([]);
	const [topSold, setTopSold] = useState<any[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const [analytics, setAnalytics] = useState<any | null>(null);
	const [analyticsLoading, setAnalyticsLoading] = useState(false);
	const [timeRange, setTimeRange] = useState("auto");
	const timeRangeOptions = [
		{ value: "auto", label: "Auto" },
		{ value: "hourly", label: "Hourly" },
		{ value: "daily", label: "Daily" },
		{ value: "weekly", label: "Weekly" },
		{ value: "monthly", label: "Monthly" },
		{ value: "yearly", label: "Yearly" },
	];

	useEffect(() => {
		fetchBusinesses();
	}, []);

	useEffect(() => {
		// Restore selected business from localStorage
		const stored = localStorage.getItem("selectedBusinessId");
		if (stored && businesses.length > 0) {
			const found = businesses.find((b) => b.id === stored);
			if (found) setSelectedBusiness(found);
		}
	}, [businesses]);

	useEffect(() => {
		if (selectedBusiness) {
			localStorage.setItem("selectedBusinessId", selectedBusiness.id);
			fetchDashboardData(selectedBusiness.id, timeRange);
			fetchProducts(selectedBusiness.id);
			fetchOrders(selectedBusiness);
			fetchBusinessAnalytics(selectedBusiness.id);
		}
	}, [selectedBusiness, timeRange]);

	const fetchBusinesses = async () => {
		setLoading(true);
		try {
			const res = await axios.get("/api/businesses");
			setBusinesses(res.data);
			// If no localStorage, default to first
			if (!localStorage.getItem("selectedBusinessId") && res.data.length > 0) {
				setSelectedBusiness(res.data[0]);
			}
		} catch (e) {
			setBusinesses([]);
		}
		setLoading(false);
	};

	const fetchDashboardData = async (businessId: string, range = timeRange) => {
		setLoading(true);
		try {
			const statsRes = await axios.post("/api/business/combined-dashboard", {
				businessIds: [businessId],
				timeRange: range,
			});
			const data = statsRes.data;
			setMetrics(data.metrics);
			setSalesTrend(data.salesTrend);
			setProductViews(data.productViews);
			setOrders(data.orders);
			setTopSold(data.topSold);
		} catch (e) {
			// handle error
		}
		setLoading(false);
	};

	const fetchProducts = async (businessId: string) => {
		try {
			const res = await axios.get(`/api/business/${businessId}/products`);
			setProducts(res.data.products || []);
		} catch (e) {
			setProducts([]);
		}
	};

	const fetchOrders = async (business: any) => {
		if (!business) return;
		setLoading(true);
		try {
			const url = `/api/business/${business.id}/orders`;
			const res = await axios.get(url, {
				headers: { "Content-Type": "application/json" },
			});
			if (!res.data.ok) throw new Error("Failed to fetch orders");
			const data = res.data.data;
			setOrders(data.orders || []);
		} catch (e) {
			setOrders([]);
		}
		setLoading(false);
	};

	const fetchBusinessAnalytics = async (businessId: string) => {
		setAnalyticsLoading(true);
		try {
			const res = await axios.get(`/api/business/${businessId}/analytics`);
			if (!res.data.ok) throw new Error("Failed to fetch analytics");
			const data = res.data.data;
			setAnalytics(data);
		} catch (e) {
			setAnalytics(null);
		}
		setAnalyticsLoading(false);
	};

	const statusTagProps = (status: string) => {
		const upper = status.toUpperCase();
		const config = STATUS_CONFIG[upper as keyof typeof STATUS_CONFIG];
		let icon = null;
		if (upper === "DISPUTED")
			icon = <ExclamationCircleOutlined style={{ marginRight: 4 }} />;
		if (upper === "CANCELLED")
			icon = <CloseCircleOutlined style={{ marginRight: 4 }} />;
		if (upper === "COMPLETED")
			icon = <CheckCircleOutlined style={{ marginRight: 4 }} />;
		if (upper === "PENDING")
			icon = <ClockCircleOutlined style={{ marginRight: 4 }} />;
		if (upper === "PROCESSING")
			icon = <SyncOutlined spin style={{ marginRight: 4 }} />;
		return {
			color: config?.color + "22",
			textColor: config?.color,
			icon,
			label: config?.label || status,
		};
	};

	const columns = [
		{
			title: "Product",
			dataIndex: "productImage",
			key: "productImage",
			render: (img: string) => (
				<img
					src={img}
					alt="product"
					onError={(e: any) => {
						e.target.onerror = null;
						e.target.src = "https://via.placeholder.com/40?text=No+Img";
					}}
					style={{
						width: 40,
						height: 40,
						borderRadius: 8,
						objectFit: "cover",
						background: "#f3f4f6",
						border: "1px solid #e5e7eb",
					}}
				/>
			),
		},
		{
			title: "Order ID",
			dataIndex: "orderId",
			key: "orderId",
			className: "font-mono text-xs text-gray-700",
		},
		{
			title: "Customer Name",
			dataIndex: "customer",
			key: "customer",
			className: "font-medium text-gray-800",
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			className: "text-gray-500 text-xs",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (val: number) => (
				<span className="font-semibold text-gray-700">KES {val}</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				const { color, textColor, icon, label } = statusTagProps(status);
				return (
					<span
						style={{
							background: color,
							color: textColor,
							borderRadius: 999,
							padding: "3px 14px 3px 10px",
							display: "inline-flex",
							alignItems: "center",
							fontWeight: 600,
							fontSize: 13,
						}}
					>
						{icon}
						{label}
					</span>
				);
			},
		},
	];

	// Compute order status analytics
	const statusCounts = orders.reduce(
		(acc: Record<string, number>, order: any) => {
			const status = (
				order.status ||
				order.currentStatus ||
				"PENDING"
			).toUpperCase();
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	const statusData = Object.keys(STATUS_CONFIG).map((status) => ({
		status,
		label: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label,
		count: statusCounts[status] || 0,
	}));

	const filteredStatusData = statusData.filter((s) => s.count > 0);

	// For debugging: log the statuses
	console.log(
		"Order statuses:",
		orders.map((o) => o.status || o.currentStatus)
	);

	const pendingOrders = orders.filter(
		(order) =>
			(order.status || order.currentStatus || "").toString().toUpperCase() ===
			"PENDING"
	);
	const showOrders = pendingOrders.length > 0 ? pendingOrders : orders;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="min-h-screen p-0">
			{/* Business Selector */}
			<div className="flex items-center mb-8 p-0">
				<Dropdown
					menu={{
						items: businesses.map((biz: any) => ({
							key: biz.id,
							label: (
								<div
									className="flex items-center gap-2"
									onClick={() => setSelectedBusiness(biz)}
								>
									{biz.logo ? (
										<Avatar src={biz.logo} size={24} />
									) : (
										<ShopOutlined className="text-lg text-gray-400" />
									)}
									<span className="font-medium">{biz.name}</span>
								</div>
							),
						})),
					}}
					placement="bottomLeft"
				>
					<button className="px-4 py-2 rounded-lg bg-white shadow border font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
						{selectedBusiness && selectedBusiness.logo ? (
							<Avatar src={selectedBusiness.logo} size={24} />
						) : (
							<ShopOutlined className="text-lg text-gray-400" />
						)}
						<span>
							{selectedBusiness ? selectedBusiness.name : "Select Business"}
						</span>
						<DownOutlined className="ml-2 text-xs" />
					</button>
				</Dropdown>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 px-0">
				<SummaryCard
					title="Total Customers"
					value={metrics.customers}
					icon={<UserOutlined />}
					iconBg="#ede9fe"
					iconColor="#8b5cf6"
				/>
				<SummaryCard
					title="Total Products"
					value={metrics.products}
					icon={<AppstoreOutlined />}
					iconBg="#fff7ed"
					iconColor="#f59e42"
				/>
				<SummaryCard
					title="Total Orders"
					value={metrics.orders}
					icon={<ShoppingCartOutlined />}
					iconBg="#fee2e2"
					iconColor="#f87171"
				/>
				<SummaryCard
					title="Total Sales"
					value={metrics.sales}
					icon={<DollarOutlined />}
					iconBg="#d1fae5"
					iconColor="#34d399"
					isCurrency
				/>
			</div>

			{/* Charts */}
			<div className="flex items-center justify-end mb-2 px-8">
				<Select
					value={timeRange}
					onChange={setTimeRange}
					options={timeRangeOptions}
					style={{ width: 160 }}
					dropdownStyle={{ zIndex: 2000 }}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-8">
				<SalesTrendChart
					data={salesTrend}
					loading={loading}
					title="Sales Trend"
					description="Track your sales performance over time."
					height={360}
				/>
				<OrdersByStatusChart
					data={statusData}
					title="Orders by Status"
					description="Track your order distribution at a glance"
					height={360}
				/>
			</div>

			{/* Orders Table & Top Sold Items */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
				<div
					className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 overflow-x-auto"
					style={{ minHeight: 420 }}
				>
					<div className="font-semibold mb-4 text-lg text-gray-900">
						All Orders
					</div>
					<Table
						columns={columns}
						dataSource={showOrders}
						pagination={false}
						rowKey="orderId"
						size="middle"
						className="custom-orders-table"
						rowClassName={(_, idx) =>
							idx % 2 === 0 ? "bg-gray-50" : "bg-white"
						}
					/>
					{pendingOrders.length === 0 && (
						<div className="text-center text-gray-500 py-4">
							No pending orders. Showing all orders.
						</div>
					)}
				</div>
				<div className="bg-white rounded-xl shadow p-6">
					<div className="font-semibold mb-4 text-lg text-gray-900">
						Top Sold Items
					</div>
					{topSold.length === 0 && (
						<div className="text-gray-400 text-center py-8">
							No sales data yet.
						</div>
					)}
					{topSold
						.sort((a, b) => b.percent - a.percent)
						.map((item: any) => (
							<div
								key={item.productId || item.name}
								className="flex items-center mb-6"
							>
								<img
									src={item.image || "/placeholder.png"}
									alt={item.name}
									className="w-10 h-10 rounded-lg object-cover border mr-4"
									onError={(e) => {
										e.currentTarget.src = "/placeholder.png";
									}}
								/>
								<div className="flex-1">
									<div className="flex justify-between items-center mb-1">
										<span className="font-medium text-gray-800">
											{item.name}
										</span>
										<span className="font-bold text-gray-700">
											{item.percent}%
										</span>
									</div>
									<div className="w-full bg-gray-100 rounded-full h-3">
										<div
											className="h-3 rounded-full"
											style={{
												width: `${item.percent}%`,
												background: item.color || "#6366f1",
												transition: "width 0.4s",
											}}
										/>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
