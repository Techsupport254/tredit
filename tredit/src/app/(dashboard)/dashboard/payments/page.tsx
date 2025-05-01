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
	Select,
} from "antd";
import {
	SearchOutlined,
	DollarOutlined,
	PlusOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title } = Typography;
const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
	COMPLETED: "green",
	PENDING: "gold",
	FAILED: "red",
	PROCESSING: "blue",
	CANCELLED: "red",
};

interface Payment {
	id: string;
	amount: number;
	status: string;
	payerId: string;
	payerName: string;
	payeeId: string;
	payeeName: string;
	createdAt: string;
	updatedAt: string;
	paymentMethod: string;
	currency: string;
}

export default function PaymentsPage() {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
	const [form] = Form.useForm();

	useEffect(() => {
		fetchPayments();
	}, []);

	const fetchPayments = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/payments");
			if (!res.ok) throw new Error("Failed to fetch payments");
			const data = await res.json();
			setPayments(data);
		} catch (e: any) {
			console.error("Error fetching payments:", e);
			setError(e.message || "Failed to fetch payments");
			setPayments([]);
		}
		setLoading(false);
	};

	const handleCreatePayment = async (values: any) => {
		try {
			const res = await fetch("/api/payments/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!res.ok) throw new Error("Failed to create payment");

			setIsCreateModalVisible(false);
			form.resetFields();
			fetchPayments();
		} catch (e: any) {
			console.error("Error creating payment:", e);
			setError(e.message || "Failed to create payment");
		}
	};

	const filtered = payments.filter((payment) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			payment.id.toLowerCase().includes(q) ||
			payment.payerName.toLowerCase().includes(q) ||
			payment.payeeName.toLowerCase().includes(q) ||
			payment.status.toLowerCase().includes(q) ||
			payment.paymentMethod.toLowerCase().includes(q)
		);
	});

	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
			case "FAILED":
			case "CANCELLED":
				return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
			case "PROCESSING":
				return <LoadingOutlined style={{ color: "#1890ff" }} />;
			default:
				return <DollarOutlined style={{ color: "#faad14" }} />;
		}
	};

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
			render: (amount: number, record: Payment) => (
				<span className="font-semibold text-gray-800">
					{record.currency} {Number(amount).toLocaleString()}
				</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => (
				<Tag
					icon={getStatusIcon(status)}
					color={STATUS_COLORS[status] || "default"}
					className="capitalize px-3 py-1"
				>
					{status.toLowerCase()}
				</Tag>
			),
		},
		{
			title: "Payment Method",
			dataIndex: "paymentMethod",
			key: "paymentMethod",
			render: (method: string) => (
				<span className="capitalize">{method.toLowerCase()}</span>
			),
		},
		{
			title: "Payer",
			dataIndex: "payerName",
			key: "payerName",
			render: (_: any, record: Payment) => (
				<span>{record.payerName || record.payerId || "-"}</span>
			),
		},
		{
			title: "Payee",
			dataIndex: "payeeName",
			key: "payeeName",
			render: (_: any, record: Payment) => (
				<span>{record.payeeName || record.payeeId || "-"}</span>
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
	];

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
							Payments
						</Title>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							View and manage all payment transactions
						</p>
					</div>
					<div className="flex gap-4">
						<Input
							placeholder="Search by ID, payer, payee, or status..."
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
							Create Payment
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
							<DollarOutlined
								style={{ fontSize: "48px" }}
								className="text-gray-300 mb-4"
							/>
							<Title level={4} className="mb-2 text-gray-700 font-semibold">
								No payments found
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No payments match your search criteria.
							</p>
						</div>
					) : (
						<Table
							dataSource={paginated}
							columns={columns}
							rowKey="id"
							pagination={false}
							className="modern-payments-table"
						/>
					)}
				</div>
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

			{/* Create Payment Modal */}
			<Modal
				title="Create New Payment"
				open={isCreateModalVisible}
				onCancel={() => setIsCreateModalVisible(false)}
				footer={null}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleCreatePayment}
					className="space-y-4"
				>
					<Form.Item
						name="payeeId"
						label="Payee Address"
						rules={[{ required: true, message: "Please enter payee address" }]}
					>
						<Input placeholder="Enter payee's wallet address" />
					</Form.Item>
					<Form.Item
						name="amount"
						label="Amount"
						rules={[{ required: true, message: "Please enter amount" }]}
					>
						<Input type="number" placeholder="Enter amount" />
					</Form.Item>
					<Form.Item
						name="currency"
						label="Currency"
						rules={[{ required: true, message: "Please select currency" }]}
					>
						<Select placeholder="Select currency">
							<Option value="KES">KES</Option>
							<Option value="USD">USD</Option>
							<Option value="ETH">ETH</Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="paymentMethod"
						label="Payment Method"
						rules={[
							{ required: true, message: "Please select payment method" },
						]}
					>
						<Select placeholder="Select payment method">
							<Option value="CRYPTO">Cryptocurrency</Option>
							<Option value="MPESA">M-PESA</Option>
							<Option value="BANK">Bank Transfer</Option>
						</Select>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" block>
							Create Payment
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
