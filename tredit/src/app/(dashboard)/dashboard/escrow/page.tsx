"use client";

import { useEffect, useState } from "react";
import {
	Table,
	Tag,
	Typography,
	Input,
	Spin,
	Alert,
	Pagination,
	Button,
	Modal,
	Form,
	Input as AntInput,
} from "antd";
import {
	SearchOutlined,
	LockOutlined,
	UnlockOutlined,
	ClockCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
	PENDING: "gold",
	RELEASED: "green",
	REFUNDED: "red",
	DISPUTED: "orange",
	ACTIVE: "blue",
};

interface EscrowTransaction {
	id: string;
	amount: number;
	status: string;
	buyerId: string;
	buyerName: string;
	sellerId: string;
	sellerName: string;
	createdAt: string;
	updatedAt: string;
	conditions: any;
}

export default function EscrowPage() {
	const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		fetchEscrowTransactions();
	}, []);

	const fetchEscrowTransactions = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/transactions");
			if (!res.ok) throw new Error("Failed to fetch escrow transactions");
			const data = await res.json();
			setTransactions(data);
		} catch (e: any) {
			console.error("Error fetching escrow transactions:", e);
			setError(e.message || "Failed to fetch escrow transactions");
			setTransactions([]);
		}
		setLoading(false);
	};

	const handleCreateEscrow = async (values: any) => {
		try {
			const res = await fetch("/api/escrow/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!res.ok) throw new Error("Failed to create escrow");

			setIsCreateModalVisible(false);
			form.resetFields();
			fetchEscrowTransactions();
		} catch (e: any) {
			console.error("Error creating escrow:", e);
			setError(e.message || "Failed to create escrow");
		}
	};

	const handleReleaseEscrow = async (id: string) => {
		try {
			const res = await fetch(`/api/escrow/${id}/release`, {
				method: "POST",
			});

			if (!res.ok) throw new Error("Failed to release escrow");

			fetchEscrowTransactions();
		} catch (e: any) {
			console.error("Error releasing escrow:", e);
			setError(e.message || "Failed to release escrow");
		}
	};

	const handleRefundEscrow = async (id: string) => {
		try {
			const res = await fetch(`/api/escrow/${id}/refund`, {
				method: "POST",
			});

			if (!res.ok) throw new Error("Failed to refund escrow");

			fetchEscrowTransactions();
		} catch (e: any) {
			console.error("Error refunding escrow:", e);
			setError(e.message || "Failed to refund escrow");
		}
	};

	const handleDisputeEscrow = async (id: string) => {
		try {
			const res = await fetch(`/api/escrow/${id}/dispute`, {
				method: "POST",
			});

			if (!res.ok) throw new Error("Failed to dispute escrow");

			fetchEscrowTransactions();
		} catch (e: any) {
			console.error("Error disputing escrow:", e);
			setError(e.message || "Failed to dispute escrow");
		}
	};

	const filtered = transactions.filter((tx) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			tx.id.toLowerCase().includes(q) ||
			tx.buyerName.toLowerCase().includes(q) ||
			tx.sellerName.toLowerCase().includes(q) ||
			tx.status.toLowerCase().includes(q)
		);
	});

	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	const columns = [
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
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			render: (amount: number) => (
				<span className="font-semibold text-gray-800">
					KES {Number(amount).toLocaleString()}
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
			title: "Buyer",
			dataIndex: "buyerName",
			key: "buyerName",
			render: (_: any, record: EscrowTransaction) => (
				<span>{record.buyerName || record.buyerId || "-"}</span>
			),
		},
		{
			title: "Seller",
			dataIndex: "sellerName",
			key: "sellerName",
			render: (_: any, record: EscrowTransaction) => (
				<span>{record.sellerName || record.sellerId || "-"}</span>
			),
		},
		{
			title: "Created",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => (
				<span className="text-gray-600">
					{format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
				</span>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: EscrowTransaction) => (
				<div className="flex gap-2">
					{record.status === "PENDING" && (
						<>
							<Button
								type="primary"
								icon={<UnlockOutlined />}
								onClick={() => handleReleaseEscrow(record.id)}
							>
								Release
							</Button>
							<Button
								danger
								icon={<LockOutlined />}
								onClick={() => handleRefundEscrow(record.id)}
							>
								Refund
							</Button>
						</>
					)}
					{record.status === "ACTIVE" && (
						<Button
							type="primary"
							icon={<ClockCircleOutlined />}
							onClick={() => handleDisputeEscrow(record.id)}
						>
							Dispute
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
							Escrow Transactions
						</Title>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							View and manage all escrow transactions
						</p>
					</div>
					<div className="flex gap-4">
						<Input
							placeholder="Search by ID, buyer, seller, or status..."
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
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => setIsCreateModalVisible(true)}
						>
							Create Escrow
						</Button>
					</div>
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
								No escrow transactions found
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No escrow transactions match your filters.
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

			{/* Create Escrow Modal */}
			<Modal
				title="Create New Escrow"
				open={isCreateModalVisible}
				onCancel={() => setIsCreateModalVisible(false)}
				footer={null}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleCreateEscrow}
					className="space-y-4"
				>
					<Form.Item
						name="id"
						label="Escrow ID"
						rules={[{ required: true, message: "Please enter an escrow ID" }]}
					>
						<AntInput placeholder="Enter escrow ID" />
					</Form.Item>
					<Form.Item
						name="amount"
						label="Amount (KES)"
						rules={[{ required: true, message: "Please enter an amount" }]}
					>
						<AntInput type="number" placeholder="Enter amount" />
					</Form.Item>
					<Form.Item
						name="seller"
						label="Seller Address"
						rules={[{ required: true, message: "Please enter seller address" }]}
					>
						<AntInput placeholder="Enter seller's wallet address" />
					</Form.Item>
					<Form.Item
						name="conditions"
						label="Conditions"
						rules={[{ required: true, message: "Please enter conditions" }]}
					>
						<AntInput.TextArea placeholder="Enter escrow conditions" rows={4} />
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Create Escrow
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
