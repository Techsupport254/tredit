import React, { useState, useEffect } from "react";
import {
	Card,
	Table,
	Spin,
	Statistic,
	Tag,
	Progress,
	DatePicker,
	Avatar,
	Tooltip,
} from "antd";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as ChartTooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	AreaChart,
	Area,
} from "recharts";
import {
	EyeOutlined,
	LikeOutlined,
	MessageOutlined,
	ShareAltOutlined,
	RiseOutlined,
} from "@ant-design/icons";
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import moment from "moment";

const { RangePicker } = DatePicker;

const platformColors = {
	YouTube: "#FF0000",
	Instagram: "#E1306C",
	Facebook: "#1877F2",
	TikTok: "#000000",
};

const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100">
				<p className="font-semibold text-gray-800 mb-2">
					{moment(label).format("MMM D, YYYY")}
				</p>
				<div className="space-y-1">
					{payload.map((entry, index) => (
						<div
							key={index}
							className="flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								<span className="text-sm text-gray-600">{entry.name}</span>
							</div>
							<span className="font-medium text-gray-800">
								{entry.value.toLocaleString()}
							</span>
						</div>
					))}
				</div>
			</div>
		);
	}
	return null;
};

const UploadsOverview = () => {
	const [uploads, setUploads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [dateRange, setDateRange] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			const data = await fetchUploadsData();
			setUploads(data);
			setLoading(false);
		};
		loadData();
	}, []);

	const processChartData = () => {
		const platformData = uploads.reduce((acc, cur) => {
			acc[cur.platform] = (acc[cur.platform] || 0) + cur.views;
			return acc;
		}, {});
		return Object.entries(platformData).map(([platform, views]) => ({
			platform,
			views,
			color: platformColors[platform],
		}));
	};

	const chartData = processChartData();

	const platformIcons = {
		YouTube: <FaYoutube className="text-red-500 text-lg" />,
		Instagram: <FaInstagram className="text-pink-500 text-lg" />,
		Facebook: <FaFacebook className="text-blue-600 text-lg" />,
		TikTok: <FaTiktok className="text-black text-lg" />,
	};

	const columns = [
		{
			title: "Content",
			dataIndex: "title",
			key: "title",
			render: (text, record) => (
				<div className="flex items-center space-x-4">
					<div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md shadow-md bg-gray-200">
						<img
							src={`https://picsum.photos/100/100?random=${record.key}`}
							alt="thumbnail"
							className="w-full h-full object-cover"
						/>
					</div>
					<div>
						<p className="font-semibold text-gray-800">{text}</p>
						<p className="text-xs text-gray-500">
							{moment(record.uploadDate).format("MMM D, YYYY")}
						</p>
					</div>
				</div>
			),
		},
		{
			title: "Platform",
			dataIndex: "platform",
			key: "platform",
			render: (platform) => (
				<div className="flex items-center space-x-2">
					{platformIcons[platform]}
				</div>
			),
		},
		{
			title: "Performance",
			key: "performance",
			render: (_, record) => (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-gray-500">Views</span>
						<span className="font-semibold">
							{record.views.toLocaleString()}
						</span>
					</div>
					<Progress
						percent={(record.engagementRate * 100).toFixed(1)}
						status="active"
						strokeColor={platformColors[record.platform]}
						showInfo={false}
						strokeWidth={6}
					/>
				</div>
			),
		},
		{
			title: "Engagement",
			key: "engagement",
			render: (_, record) => (
				<div className="grid grid-cols-3 gap-4 text-center">
					<div>
						<LikeOutlined className="text-gray-500 text-xl" />
						<p className="mt-1 font-medium">{record.likes.toLocaleString()}</p>
					</div>
					<div>
						<MessageOutlined className="text-gray-500 text-xl" />
						<p className="mt-1 font-medium">
							{record.comments.toLocaleString()}
						</p>
					</div>
					<div>
						<ShareAltOutlined className="text-gray-500 text-xl" />
						<p className="mt-1 font-medium">{record.shares.toLocaleString()}</p>
					</div>
				</div>
			),
		},
	];

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto">
				{loading ? (
					<Spin size="large" className="flex justify-center mt-10" />
				) : (
					<>
						{/* Statistics Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
							{[
								{
									title: "Total Views",
									value: uploads.reduce((a, c) => a + c.views, 0),
									icon: <EyeOutlined />,
									color: "#4F46E5",
								},
								{
									title: "Total Engagement",
									value: uploads.reduce((a, c) => a + c.likes + c.comments, 0),
									icon: <RiseOutlined />,
									color: "#10B981",
								},
								{
									title: "Average Retention",
									value: "72%",
									icon: <ShareAltOutlined />,
									color: "#3B82F6",
								},
								{
									title: "Top Platform",
									value: "YouTube",
									icon: <FaYoutube />,
									color: "#FF0000",
								},
							].map((metric, index) => (
								<Card
									key={index}
									className="hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden"
									style={{
										background: `linear-gradient(135deg, ${metric.color} 50%, rgba(255,255,255,0.1))`,
										borderRadius: "16px",
										padding: ".5rem",
										position: "relative",
									}}
								>
									{/* Subtle Overlay Glow */}
									<div className="absolute inset-0 bg-white opacity-5 pointer-events-none rounded-2xl"></div>

									{/* Content */}
									<div className="flex items-center justify-between relative z-10">
										<div>
											<p className="text-white text-opacity-80 text-sm tracking-wide uppercase">
												{metric.title}
											</p>
											<p className="text-2xl font-extrabold text-white">
												{typeof metric.value === "number"
													? metric.value.toLocaleString()
													: metric.value}
											</p>
										</div>

										{/* Animated Icon Bubble */}
										<div
											className="w-12 h-12 flex items-center justify-center bg-white bg-opacity-20 rounded-full shadow-md transform hover:scale-110 transition-transform duration-300"
											style={{
												backdropFilter: "blur(10px)",
												color: metric.color,
											}}
										>
											{metric.icon}
										</div>
									</div>
								</Card>
							))}
						</div>

						{/* Main Content Grid */}
						<div className="grid grid-cols-4 gap-6">
							{/* Data Table - 3/4 Width */}
							<Card className="col-span-3 border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										📄 Content Performance
									</h2>
									<p className="text-sm text-gray-500">
										Track the performance of your uploaded content
									</p>
								</div>

								<div className="overflow-x-auto w-full">
									<Table
										dataSource={uploads}
										columns={columns}
										pagination={{ pageSize: 5 }}
										rowClassName="hover:bg-blue-50 cursor-pointer transition-all duration-300"
										onRow={(record) => ({
											onClick: () => console.log("Row clicked:", record),
										})}
										scroll={{ x: "100%" }} // 🔹 Ensures table remains full width
										className="w-full"
									/>
								</div>
							</Card>

							{/* Platform Distribution - 1/4 Width */}
							<Card className="col-span-1 border border-gray-200 rounded-xl transition-all duration-300">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										📊 Platform Distribution
									</h2>
									<p className="text-sm text-gray-500">
										Analyze the distribution of views across platforms
									</p>
								</div>

								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={chartData}
											dataKey="views"
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={85}
											paddingAngle={3}
											label={({ name, percent }) =>
												`${name} ${(percent * 100).toFixed(0)}%`
											}
										>
											{chartData.map((entry, index) => (
												<Cell
													key={index}
													fill={entry.color}
													stroke="#ffffff"
													strokeWidth={2}
												/>
											))}
										</Pie>
										<Legend
											layout="vertical"
											align="right"
											verticalAlign="middle"
											formatter={(value) => (
												<span className="text-gray-700 font-medium">
													{value}
												</span>
											)}
										/>
										<ChartTooltip content={<CustomTooltip />} />
									</PieChart>
								</ResponsiveContainer>
							</Card>
						</div>

						{/* Trend Analysis */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
							{/* Views Trend Over Time */}
							<Card className="border border-gray-200 rounded-xl transition-all duration-300">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										📈 Views Trend Over Time
									</h2>
									<p className="text-sm text-gray-500">
										Monitor how your views are evolving over time
									</p>
								</div>

								<ResponsiveContainer width="100%" height={300}>
									<AreaChart data={uploads}>
										<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
										<XAxis
											dataKey="uploadDate"
											tickFormatter={(date) => moment(date).format("MMM D")}
										/>
										<YAxis />
										<ChartTooltip content={<CustomTooltip />} />
										<Area
											type="monotone"
											dataKey="views"
											stroke="#4F46E5"
											fill="#4F46E5"
											fillOpacity={0.15}
											strokeWidth={2}
										/>
										<Line
											type="monotone"
											dataKey="likes"
											stroke="#10B981"
											strokeWidth={2}
											dot={false}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</Card>

							{/* Engagement Analysis */}
							<Card className="border border-gray-200 rounded-xl transition-all duration-300">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										💬 Engagement Analysis
									</h2>
									<p className="text-sm text-gray-500">
										Compare user engagement across different content
									</p>
								</div>

								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={uploads}>
										<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
										<XAxis
											dataKey="uploadDate"
											tickFormatter={(date) => moment(date).format("MMM D")}
										/>
										<YAxis />
										<ChartTooltip content={<CustomTooltip />} />
										<Bar
											dataKey="likes"
											fill="#10B981"
											radius={[6, 6, 0, 0]}
											barSize={20}
										/>
										<Bar
											dataKey="comments"
											fill="#3B82F6"
											radius={[6, 6, 0, 0]}
											barSize={20}
										/>
									</BarChart>
								</ResponsiveContainer>
							</Card>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

const fetchUploadsData = async () => {
	// Simulated API call with realistic data
	return [
		{
			key: "1",
			title: "Tech Product Launch Event",
			platform: "YouTube",
			views: 24500,
			likes: 1200,
			comments: 180,
			shares: 350,
			engagementRate: 6.8,
			uploadDate: "2024-03-01",
		},
		{
			key: "2",
			title: "Spring Collection Lookbook",
			platform: "Instagram",
			views: 18600,
			likes: 2400,
			comments: 420,
			shares: 890,
			engagementRate: 8.2,
			uploadDate: "2024-02-28",
		},
		{
			key: "3",
			title: "CEO Leadership Interview",
			platform: "Facebook",
			views: 9200,
			likes: 450,
			comments: 65,
			shares: 120,
			engagementRate: 4.5,
			uploadDate: "2024-02-25",
		},
		{
			key: "4",
			title: "15-sec Recipe Challenge",
			platform: "TikTok",
			views: 43200,
			likes: 9800,
			comments: 1500,
			shares: 2400,
			engagementRate: 12.7,
			uploadDate: "2024-02-22",
		},
		{
			key: "5",
			title: "Software Tutorial Series",
			platform: "YouTube",
			views: 17800,
			likes: 850,
			comments: 130,
			shares: 210,
			engagementRate: 5.9,
			uploadDate: "2024-02-18",
		},
		{
			key: "6",
			title: "Behind the Scenes Reel",
			platform: "Instagram",
			views: 25400,
			likes: 3100,
			comments: 680,
			shares: 950,
			engagementRate: 9.1,
			uploadDate: "2024-02-15",
		},
	];
};

export default UploadsOverview;
