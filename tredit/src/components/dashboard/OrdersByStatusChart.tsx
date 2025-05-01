import React from "react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";

const STATUS_CONFIG = {
	PENDING: { color: "#fbbf24", label: "Pending" },
	PROCESSING: { color: "#3b82f6", label: "Processing" },
	SHIPPED: { color: "#8b5cf6", label: "Shipped" },
	DELIVERED: { color: "#10b981", label: "Delivered" },
	COMPLETED: { color: "#22c55e", label: "Completed" },
	CANCELLED: { color: "#ef4444", label: "Cancelled" },
	DISPUTED: { color: "#f97316", label: "Disputed" },
};

interface OrdersByStatusChartProps {
	data: { status: string; label: string; count: number }[];
	title?: string;
	description?: string;
	height?: number;
}

const OrdersByStatusChart: React.FC<OrdersByStatusChartProps> = ({
	data,
	title = "Orders by Status",
	description = "Track your order distribution at a glance",
	height = 340,
}) => {
	const filteredData = data.filter((s) => s.count > 0);
	const total = filteredData.reduce((sum, s) => sum + s.count, 0);

	return (
		<div
			className="col-span-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between"
			style={{ minHeight: height }}
		>
			<div className="mb-2">
				<div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
				<div className="text-gray-500 text-sm mb-2">{description}</div>
			</div>
			<div
				className="flex flex-col items-center justify-center"
				style={{ height: height - 70 }}
			>
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={filteredData}
							dataKey="count"
							nameKey="label"
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={90}
							paddingAngle={2}
							label={({ percent, x, y, name }) =>
								percent > 0.05 ? (
									<text
										x={x}
										y={y}
										fill="#23272E"
										textAnchor="middle"
										dominantBaseline="central"
										fontSize={13}
										fontWeight={600}
									>
										{`${Math.round(percent * 100)}%`}
									</text>
								) : null
							}
							isAnimationActive={true}
						>
							{filteredData.map((entry) => (
								<Cell
									key={entry.status}
									fill={
										STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]
											.color
									}
								/>
							))}
						</Pie>
						<Tooltip
							formatter={(value: any, name: any, props: any) => [
								value,
								"Orders",
							]}
							contentStyle={{ borderRadius: 10, fontSize: 14 }}
						/>
						<Legend
							verticalAlign="bottom"
							align="center"
							iconType="circle"
							formatter={(value: string) => {
								const found = filteredData.find((d) => d.label === value);
								if (!found) return value;
								return (
									<span style={{ color: "#23272E", fontWeight: 500 }}>
										{value} ({found.count})
									</span>
								);
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="mt-4 text-center">
					<span className="text-2xl font-bold text-gray-900">{total}</span>
					<span className="text-gray-500 ml-1">orders</span>
				</div>
			</div>
		</div>
	);
};

export default OrdersByStatusChart;
