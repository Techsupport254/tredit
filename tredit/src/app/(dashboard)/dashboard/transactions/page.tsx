"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Typography, Input, Spin, Alert, Pagination } from "antd";
import {
	SearchOutlined,
	DollarOutlined,
	SwapOutlined,
	FileDoneOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title } = Typography;

const TYPE_ICONS: Record<string, JSX.Element> = {
	escrow: <SwapOutlined className="text-blue-500" />,
	order: <FileDoneOutlined className="text-green-500" />,
	payment: <DollarOutlined className="text-purple-500" />,
};

const STATUS_COLORS: Record<string, string> = {
	ACTIVE: "blue",
	RELEASED: "green",
	REFUNDED: "red",
	PENDING: "gold",
	COMPLETED: "green",
	PAID: "green",
	FAILED: "red",
	CANCELLED: "red",
	PROCESSING: "blue",
	DISPUTED: "orange",
};

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	useEffect(() => {
		const fetchTransactions = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/transactions`); // Updated to use new endpoint
				if (!res.ok) throw new Error("Failed to fetch transactions");
				const data = await res.json();
				setTransactions(data || []);
			} catch (e: any) {
				setError(e.message || "Failed to fetch transactions");
				setTransactions([]);
			}
			setLoading(false);
		};
		fetchTransactions();
	}, []);

	const filtered = transactions.filter((tx) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			tx.id.toLowerCase().includes(q) ||
			(tx.buyerName && tx.buyerName.toLowerCase().includes(q)) ||
			(tx.sellerName && tx.sellerName.toLowerCase().includes(q)) ||
			(tx.type && tx.type.toLowerCase().includes(q))
		);
	});

	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	const columns = [
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (type: string) => (
				<span className="flex items-center gap-2 font-medium">
					{TYPE_ICONS[type] || null}
					{type.charAt(0).toUpperCase() + type.slice(1)}
				</span>
			),
		},
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
			render: (id: string) => (
				<span className="font-mono text-base font-semibold text-gray-700">
					{id.slice(0, 8)}...
				</span>
			),
		},
		{
			title: "Date",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => (
				<span className="text-gray-600">
					{format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
				</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag color={STATUS_COLORS[status] || "default"} className="capitalize">
					{status}
				</Tag>
			),
		},
		{
			title: "Amount (KES)",
			dataIndex: "amount",
			key: "amount",
			render: (amount: number) => (
				<span className="font-semibold text-gray-800">
					KES {Number(amount).toLocaleString()}
				</span>
			),
		},
		{
			title: "Buyer",
			dataIndex: "buyerName",
			key: "buyerName",
			render: (_: any, record: any) => (
				<span>{record.buyerName || record.buyerId || "-"}</span>
			),
		},
		{
			title: "Seller",
			dataIndex: "sellerName",
			key: "sellerName",
			render: (_: any, record: any) => (
				<span>{record.sellerName || record.sellerId || "-"}</span>
			),
		},
	];

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
							Transactions
						</Title>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							View and manage all transaction history
						</p>
					</div>
					<Input
						placeholder="Search by ID, buyer, seller, or type..."
						prefix={<SearchOutlined />}
						allowClear
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="w-64"
						size="middle"
					/>
				</div>
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<Spin size="large" />
						</div>
					) : error ? (
						<Alert type="error" message={error} />
					) : filtered.length === 0 ? (
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
								No transactions found.
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No transactions match your filters.
							</p>
						</div>
					) : (
						<Table
							dataSource={paginated}
							columns={columns}
							rowKey="id"
							pagination={false}
							className="modern-orders-table"
						/>
					)}
				</div>
				{/* Pagination controls */}
				{filtered.length > 0 && (
					<div className="flex justify-end mt-6">
						<Pagination
							current={page}
							pageSize={pageSize}
							total={filtered.length}
							showSizeChanger
							pageSizeOptions={[5, 10, 20, 50]}
							onChange={(p, ps) => {
								setPage(p);
								setPageSize(ps);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
