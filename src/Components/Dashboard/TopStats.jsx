import { Card, Col, Row, Progress } from "antd";
import {
	UserOutlined,
	ShoppingCartOutlined,
	DollarOutlined,
	ArrowUpOutlined,
} from "@ant-design/icons";

const TopStats = () => {
	const statsData = [
		{
			title: "Total Sales",
			value: "11,250",
			icon: <DollarOutlined />,
			color: "bg-blue-100 text-blue-700",
			progress: 70,
		},
		{
			title: "New Customers",
			value: "325",
			icon: <UserOutlined />,
			color: "bg-green-100 text-green-700",
			progress: 50,
		},
		{
			title: "Pending Orders",
			value: "85",
			icon: <ShoppingCartOutlined />,
			color: "bg-red-100 text-red-700",
			progress: 30,
		},
		{
			title: "Revenue Growth",
			value: "18.7%",
			icon: <ArrowUpOutlined />,
			color: "bg-orange-100 text-orange-700",
			progress: 18.7,
		},
	];

	return (
		<div className="w-full px-0 sm:px-4 lg:px-8 xl:px-12 py-0 sm:py-4 lg:py-6">
			<Row gutter={[12, 12]} justify="center">
				{statsData.map((stat, index) => (
					<Col
						key={index}
						xs={12} // 2 items per row on extra small screens
						sm={12} // 2 items per row on small screens
						md={6} // 4 items per row on medium screens
						lg={6} // 4 items per row on large screens
						className="flex p-0"
					>
						<Card
							className="rounded-xl shadow-lg flex flex-col justify-between w-full bg-white 
							px-0 py-3 sm:px-3 sm:py-4 md:px-4 md:py-0 lg:px-5 lg:py-8"
						>
							<div className="flex flex-col items-center text-center w-full">
								{/* Icon Container */}
								<div
									className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full ${stat.color}`}
									style={{ fontSize: "1.5rem", minWidth: "50px" }} // Adaptive icon scaling
								>
									{stat.icon}
								</div>

								{/* Title */}
								<p className="text-gray-500 text-xs sm:text-sm md:text-base mt-2 font-medium">
									{stat.title}
								</p>

								{/* Value */}
								<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
									{stat.value}
								</p>

								{/* Responsive Progress Bar */}
								<div className="w-full mt-3">
									<Progress
										percent={stat.progress}
										status="active"
										showInfo={false}
										strokeColor="#1890ff"
										strokeWidth={4} // Slightly thinner for better balance
										className="w-full"
									/>
								</div>
							</div>
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
};

export default TopStats;
