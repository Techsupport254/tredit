import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	Area,
} from "recharts";
import React from "react";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function getMonthName(val: any) {
	if (typeof val === "number") return MONTHS[val - 1];
	if (typeof val === "string") {
		// Try to parse as date string
		const d = new Date(val);
		if (!isNaN(d.getTime())) return MONTHS[d.getMonth()];
		// Try to parse as month name
		if (MONTHS.includes(val)) return val;
	}
	return val;
}

interface SalesTrendChartProps {
	data: any[];
	loading?: boolean;
	title?: string;
	description?: string;
	height?: number;
	granularity?: "monthly" | "weekly";
}

function robustNormalizeMonthlyData(data: any[]) {
	// Accepts: [{ month: 4, current: 1000, last: 500 }, { month: '2023-04-01', ... }, ...]
	// or [{ month: 'April', ... }]
	// Output: [{ month: 'January', current: X, last: Y }, ...]
	const monthMap: Record<string, { current: number; last: number }> = {};
	data.forEach((d) => {
		const m = getMonthName(d.month || d.date || d.label);
		if (!monthMap[m]) monthMap[m] = { current: 0, last: 0 };
		if (typeof d.current === "number") monthMap[m].current = d.current;
		if (typeof d.last === "number") monthMap[m].last = d.last;
		// If backend gives separate arrays for current/last year, merge here
		if (typeof d.value === "number" && d.year) {
			if (d.year === new Date().getFullYear()) monthMap[m].current = d.value;
			else monthMap[m].last = d.value;
		}
	});
	return MONTHS.map((month) => ({
		month,
		current: monthMap[month]?.current ?? 0,
		last: monthMap[month]?.last ?? 0,
	}));
}

function processRawSalesData(
	rawData: any[]
): { month: string; current: number; last: number }[] {
	// Find all years in the data
	const years = Array.from(
		new Set(rawData.map((entry) => new Date(entry.createdAt).getFullYear()))
	).sort((a, b) => b - a); // Descending
	const [currentYear, lastYear] = years;

	// Initialize month maps
	const currentYearMap: Record<string, number> = {};
	const lastYearMap: Record<string, number> = {};

	rawData.forEach((entry) => {
		const date = new Date(entry.createdAt);
		const year = date.getFullYear();
		const monthIdx = date.getMonth(); // 0-based
		const monthName = MONTHS[monthIdx];
		const total = entry._sum?.totalAmount ?? 0;
		if (year === currentYear) {
			currentYearMap[monthName] = (currentYearMap[monthName] || 0) + total;
		} else if (year === lastYear) {
			lastYearMap[monthName] = (lastYearMap[monthName] || 0) + total;
		}
	});

	// Merge into chart format
	return MONTHS.map((month) => ({
		month,
		current: currentYearMap[month] || 0,
		last: lastYearMap[month] || 0,
	}));
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
	data,
	loading,
	title = "Sales Trend",
	description = "Track your sales performance over time.",
	height = 340,
	granularity = "monthly",
}) => {
	// If data is in raw backend format, process it
	let chartData = data;
	if (data && data.length && data[0]._sum && data[0].createdAt) {
		chartData = processRawSalesData(data);
	} else if (granularity === "monthly") {
		chartData = robustNormalizeMonthlyData(data);
	}

	return (
		<div
			className="col-span-1 md:col-span-3 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between"
			style={{ minHeight: height }}
		>
			<div className="mb-2">
				<div className="font-bold text-lg text-gray-900 mb-1">{title}</div>
				<div className="text-gray-500 text-sm mb-2">{description}</div>
			</div>
			<div style={{ width: "100%", height: height - 70 }}>
				<ResponsiveContainer>
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
						<XAxis
							dataKey="month"
							tick={{ fontSize: 14, fill: "#23272E" }}
							axisLine={false}
							tickLine={false}
							interval={0}
						/>
						<YAxis
							tick={{ fontSize: 14, fill: "#23272E" }}
							axisLine={false}
							tickLine={false}
							tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
						/>
						<Tooltip
							contentStyle={{ borderRadius: 12, fontSize: 14 }}
							formatter={(value: any) =>
								value >= 1000 ? `${value / 1000}K` : value
							}
						/>
						<Legend
							verticalAlign="top"
							align="right"
							iconType="circle"
							wrapperStyle={{ top: 0, right: 0, fontSize: 14 }}
						/>
						<Area
							type="monotone"
							dataKey="current"
							stroke="#6366f1"
							fill="#6366f1"
							fillOpacity={0.08}
							name="Current year"
							strokeWidth={3}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
						/>
						<Line
							type="monotone"
							dataKey="current"
							stroke="#6366f1"
							name="Current year"
							strokeWidth={3}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="last"
							stroke="#ef4444"
							name="Last year"
							strokeWidth={3}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default SalesTrendChart;
