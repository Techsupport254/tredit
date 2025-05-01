import { Card, Typography, List, Tag, Button, Tooltip } from "antd";
import {
	ClockCircleOutlined,
	SyncOutlined,
	CarOutlined,
	ShoppingOutlined,
	CheckSquareOutlined,
	CloseCircleOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

const { Title, Text } = Typography;

const STATUS_CONFIG = {
	PENDING: {
		icon: <ClockCircleOutlined />,
		color: "#fbbf24",
		bgColor: "#fef9c3",
		textColor: "#b45309",
		label: "Pending",
	},
	PROCESSING: {
		icon: <SyncOutlined spin />,
		color: "#3b82f6",
		bgColor: "#e6f0fd",
		textColor: "#2563eb",
		label: "Processing",
	},
	SHIPPED: {
		icon: <CarOutlined />,
		color: "#8b5cf6",
		bgColor: "#ede9fe",
		textColor: "#6d28d9",
		label: "Shipped",
	},
	DELIVERED: {
		icon: <ShoppingOutlined />,
		color: "#10b981",
		bgColor: "#d1fae5",
		textColor: "#059669",
		label: "Delivered",
	},
	COMPLETED: {
		icon: <CheckSquareOutlined />,
		color: "#22c55e",
		bgColor: "#e7fbe9",
		textColor: "#15803d",
		label: "Completed",
	},
	CANCELLED: {
		icon: <CloseCircleOutlined />,
		color: "#ef4444",
		bgColor: "#fee2e2",
		textColor: "#b91c1c",
		label: "Cancelled",
	},
	DISPUTED: {
		icon: <ExclamationCircleOutlined />,
		color: "#f97316",
		bgColor: "#ffedd5",
		textColor: "#c2410c",
		label: "Disputed",
	},
};

interface Order {
	id: string;
	currentStatus: string;
	totalAmount: number;
	createdAt: string;
	business?: {
		name: string;
	};
}

interface OrdersByStatusProps {
	orders: Order[];
	onOrderClick?: (order: Order) => void;
}

export function OrdersByStatus({ orders, onOrderClick }: OrdersByStatusProps) {
	// Group orders by status
	const ordersByStatus = orders.reduce((acc, order) => {
		const status = order.currentStatus || "PENDING";
		if (!acc[status]) {
			acc[status] = [];
		}
		acc[status].push(order);
		return acc;
	}, {} as Record<string, Order[]>);

	// Define the order of status columns
	const statusOrder = [
		"PENDING",
		"PROCESSING",
		"SHIPPED",
		"DELIVERED",
		"COMPLETED",
		"CANCELLED",
		"DISPUTED",
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{statusOrder.map((status) => {
				const orders = ordersByStatus[status] || [];
				const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

				return (
					<Card
						key={status}
						className="h-full"
						title={
							<div className="flex items-center gap-2">
								<Tag
									icon={config.icon}
									color={config.color}
									style={{
										borderRadius: 999,
										fontWeight: 600,
										padding: "0 16px",
										background: config.bgColor,
										color: config.textColor,
										border: "none",
									}}
								>
									{config.label}
								</Tag>
								<span className="text-gray-500">({orders.length})</span>
							</div>
						}
					>
						<List
							dataSource={orders}
							renderItem={(order) => (
								<List.Item
									className="bg-white rounded-lg shadow-sm mb-2 p-3 cursor-pointer hover:shadow-md transition-shadow"
									onClick={() => onOrderClick?.(order)}
								>
									<div className="w-full">
										<div className="flex justify-between items-start mb-2">
											<Text strong className="text-gray-700">
												#{order.id.slice(0, 8)}
											</Text>
											<Text strong className="text-gray-800">
												KES {order.totalAmount.toLocaleString()}
											</Text>
										</div>
										<div className="flex justify-between items-center">
											<Text type="secondary" className="text-sm">
												{order.business?.name || "Unknown Business"}
											</Text>
											<Text type="secondary" className="text-sm">
												{format(new Date(order.createdAt), "MMM d, h:mm a")}
											</Text>
										</div>
									</div>
								</List.Item>
							)}
						/>
					</Card>
				);
			})}
		</div>
	);
}
