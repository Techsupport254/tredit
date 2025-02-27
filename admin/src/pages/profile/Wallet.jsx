import React from "react";
import { FaWallet, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Button, List, Card } from "antd";

const transactions = [
	{
		id: 1,
		type: "Deposit",
		amount: "+$500.00",
		date: "Feb 21, 2025",
		icon: <FaArrowDown className="text-green-500" />,
	},
	{
		id: 2,
		type: "Withdrawal",
		amount: "-$200.00",
		date: "Feb 18, 2025",
		icon: <FaArrowUp className="text-red-500" />,
	},
	{
		id: 3,
		type: "Deposit",
		amount: "+$1,000.00",
		date: "Feb 10, 2025",
		icon: <FaArrowDown className="text-green-500" />,
	},
];

const Wallet = () => {
	const balance = "$3,250.00"; // Example balance, can be fetched dynamically

	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Wallet Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaWallet className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">My Wallet</h2>
						<p className="text-gray-200 text-sm">Manage your funds</p>
					</div>
				</div>
				<h1 className="text-2xl font-bold">{balance}</h1>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-between mt-6">
				<Button
					type="primary"
					className="w-1/2 mr-2"
					icon={<FaArrowDown />}
					style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
				>
					Deposit
				</Button>
				<Button
					type="primary"
					className="w-1/2 ml-2"
					icon={<FaArrowUp />}
					style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
				>
					Withdraw
				</Button>
			</div>

			{/* Transaction History */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">Recent Transactions</h3>
				<Card className="mt-2">
					<List
						dataSource={transactions}
						renderItem={({ id, type, amount, date, icon }) => (
							<List.Item className="flex justify-between items-center p-3 border-b">
								<div className="flex items-center gap-3">
									{icon}
									<div>
										<p className="font-medium">{type}</p>
										<span className="text-gray-500 text-sm">{date}</span>
									</div>
								</div>
								<p className="font-semibold">{amount}</p>
							</List.Item>
						)}
					/>
				</Card>
			</div>
		</div>
	);
};

export default Wallet;
