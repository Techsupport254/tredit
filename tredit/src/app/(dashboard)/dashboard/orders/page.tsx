"use client";

import { useEffect, useState } from "react";
import { Spin, Alert, Table, Tag, Typography, Input } from "antd";
import {
	CheckCircleOutlined,
	SyncOutlined,
	ClockCircleOutlined,
	SearchOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const STATUS_TABS = [
	{ key: "ALL", label: "All Orders" },
	{ key: "PROCESSING", label: "Processing" },
	{ key: "PENDING", label: "Pending" },
	{ key: "COMPLETED", label: "Completed" },
];

const statusTag = (status: string) => {
	if (status === "COMPLETED")
		return (
			<Tag
				icon={<CheckCircleOutlined />}
				color="#22c55e"
				style={{
					borderRadius: 999,
					fontWeight: 600,
					padding: "0 16px",
					background: "#e7fbe9",
					color: "#15803d",
					border: "none",
				}}
			>
				Completed
			</Tag>
		);
	if (status === "PROCESSING")
		return (
			<Tag
				icon={<SyncOutlined spin />}
				color="#3b82f6"
				style={{
					borderRadius: 999,
					fontWeight: 600,
					padding: "0 16px",
					background: "#e6f0fd",
					color: "#2563eb",
					border: "none",
				}}
			>
				Processing
			</Tag>
		);
	return (
		<Tag
			icon={<ClockCircleOutlined />}
			color="#fbbf24"
			style={{
				borderRadius: 999,
				fontWeight: 600,
				padding: "0 16px",
				background: "#fef9c3",
				color: "#b45309",
				border: "none",
			}}
		>
			Pending
		</Tag>
	);
};

export default function DashboardOrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("ALL");
	const [search, setSearch] = useState("");
	const [pendingCount, setPendingCount] = useState<number>(0);

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/dashboard/orders/all");
				if (!res.ok) throw new Error("Failed to fetch orders");
				const data = await res.json();
				setOrders(data.orders || []);
				setPendingCount(
					data.orders.filter((o: any) => o.status === "PENDING").length
				);
			} catch (err: any) {
				setError(err.message || "Failed to load orders");
			} finally {
				setLoading(false);
			}
		};
		fetchOrders();
	}, []);

	const filteredOrders = orders.filter((order) => {
		const matchesStatus =
			activeTab === "ALL" ? true : order.status === activeTab;
		const matchesSearch =
			search.trim() === "" ||
			order.id.toLowerCase().includes(search.toLowerCase()) ||
			order.business?.name?.toLowerCase().includes(search.toLowerCase());
		return matchesStatus && matchesSearch;
	});

	const columns = [
		{
			title: <span className="font-semibold text-gray-700">Order ID</span>,
			dataIndex: "id",
			key: "id",
			render: (id: string) => (
				<span className="font-mono text-base font-semibold text-gray-700">
					{id.slice(0, 8)}...
				</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Business</span>,
			dataIndex: ["business", "name"],
			key: "business",
			render: (_: any, record: any) => (
				<span className="text-gray-800 font-medium">
					{record.business?.name || "-"}
				</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Date</span>,
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => (
				<span className="text-gray-600">{new Date(date).toLocaleString()}</span>
			),
		},
		{
			title: <span className="font-semibold text-gray-700">Status</span>,
			dataIndex: "status",
			key: "status",
			render: (status: string) => statusTag(status),
		},
		{
			title: <span className="font-semibold text-gray-700">Total</span>,
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount: number) => (
				<span className="font-semibold text-gray-800">
					KES {amount.toLocaleString()}
				</span>
			),
		},
	];

	return (
		<div className="min-h-screen w-full flex flex-col items-center bg-[#f6f7fb] py-10 px-2">
			<Title
				level={2}
				className="text-3xl font-bold text-gray-900 mb-8 mt-2 tracking-tight"
			>
				Orders{" "}
				<span className="ml-2 text-base font-normal text-gray-500">
					({pendingCount} Pending)
				</span>
			</Title>
			<div className="w-full max-w-6xl">
				{/* Filter bar */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
					<div className="flex flex-row gap-2 overflow-x-auto">
						{STATUS_TABS.map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`px-4 py-2 rounded-full font-medium transition-colors duration-150 text-sm focus:outline-none ${
									activeTab === tab.key
										? "bg-blue-600 text-white"
										: "bg-transparent text-gray-600 hover:bg-blue-50"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
					<div className="flex flex-row gap-2 items-center mt-2 sm:mt-0">
						<Input
							placeholder="Search Order ID or Business"
							prefix={<SearchOutlined />}
							allowClear
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-56"
							size="middle"
						/>
					</div>
				</div>
				<div
					className="overflow-x-auto rounded-xl"
					style={{ background: "#fff" }}
				>
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<Spin size="large" />
						</div>
					) : error ? (
						<Alert type="error" message={error} />
					) : filteredOrders.length === 0 ? (
						<div className="flex flex-col items-center py-12">
							<svg
								width="120"
								height="120"
								fill="none"
								viewBox="0 0 64 64"
								className="mb-6 opacity-80"
								style={{ maxWidth: "100%", height: "auto" }}
							>
								<rect
									x="8"
									y="20"
									width="48"
									height="32"
									rx="6"
									fill="#e0e7ef"
								/>
								<rect
									x="16"
									y="28"
									width="32"
									height="16"
									rx="3"
									fill="#b6c6e3"
								/>
								<path
									d="M20 44V36a4 4 0 014-4h16a4 4 0 014 4v8"
									stroke="#3b82f6"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<circle cx="24" cy="48" r="2" fill="#3b82f6" />
								<circle cx="40" cy="48" r="2" fill="#3b82f6" />
							</svg>
							<Title level={4} className="mb-2 text-gray-700 font-semibold">
								No orders found.
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No orders match your filters.
							</p>
						</div>
					) : (
						<Table
							dataSource={filteredOrders}
							columns={columns}
							rowKey="id"
							pagination={{ pageSize: 10 }}
							className="modern-orders-table border-0"
							style={{ background: "#fff", border: "none" }}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
