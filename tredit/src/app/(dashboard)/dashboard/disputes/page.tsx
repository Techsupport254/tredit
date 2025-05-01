"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Typography, Input, Spin, Alert, Pagination } from "antd";
import {
	SearchOutlined,
	WarningOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ClockCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
	OPEN: "blue",
	RESOLVED: "green",
	CLOSED: "gray",
	PENDING: "gold",
	ESCALATED: "orange",
	REJECTED: "red",
};

const SEVERITY_COLORS: Record<string, string> = {
	HIGH: "red",
	MEDIUM: "orange",
	LOW: "blue",
};

export default function DisputesPage() {
	const [disputes, setDisputes] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	useEffect(() => {
		const fetchDisputes = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/business/all/disputes`);
				if (!res.ok) throw new Error("Failed to fetch disputes");
				const data = await res.json();
				setDisputes(data || []);
			} catch (e: any) {
				setError(e.message || "Failed to fetch disputes");
				setDisputes([]);
			}
			setLoading(false);
		};
		fetchDisputes();
	}, []);

	const filtered = disputes.filter((dispute) => {
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return (
			dispute.id.toLowerCase().includes(q) ||
			(dispute.title && dispute.title.toLowerCase().includes(q)) ||
			(dispute.reporterName &&
				dispute.reporterName.toLowerCase().includes(q)) ||
			(dispute.status && dispute.status.toLowerCase().includes(q))
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
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (title: string) => (
				<span className="font-medium text-gray-800">{title}</span>
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
			title: "Severity",
			dataIndex: "severity",
			key: "severity",
			render: (severity: string) => (
				<Tag
					color={SEVERITY_COLORS[severity] || "default"}
					className="capitalize"
				>
					{severity}
				</Tag>
			),
		},
		{
			title: "Reported By",
			dataIndex: "reporterName",
			key: "reporterName",
			render: (_: any, record: any) => (
				<span>{record.reporterName || record.reporterId || "-"}</span>
			),
		},
		{
			title: "Reported At",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: string) => (
				<span className="text-gray-600">
					{format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
				</span>
			),
		},
		{
			title: "Last Updated",
			dataIndex: "updatedAt",
			key: "updatedAt",
			render: (date: string) => (
				<span className="text-gray-600">
					{format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
				</span>
			),
		},
	];

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900 py-8">
			<div className="mx-auto px-4 sm:px-6 lg:px-0">
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<Title level={2} className="text-2xl font-bold text-gray-900 mb-2">
							Disputes
						</Title>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							View and manage all dispute cases
						</p>
					</div>
					<Input
						placeholder="Search by ID, title, reporter, or status..."
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
								<path
									d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8z"
									fill="#e0e7ef"
								/>
								<path
									d="M32 16c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16z"
									fill="#b6c6e3"
								/>
								<path
									d="M32 24v16M24 32h16"
									stroke="#3b82f6"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
							<Title level={4} className="mb-2 text-gray-700 font-semibold">
								No disputes found
							</Title>
							<p className="text-gray-500 text-base text-center max-w-md">
								No disputes match your filters.
							</p>
						</div>
					) : (
						<Table
							dataSource={paginated}
							columns={columns}
							rowKey="id"
							pagination={false}
							className="modern-disputes-table"
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
