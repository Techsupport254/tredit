import React from "react";
import {
	FaCreditCard,
	FaWallet,
	FaMoneyBillWave,
	FaClock,
} from "react-icons/fa";
import { Button, List, Card } from "antd";

const transactions = [
	{
		id: 1,
		type: "Deposit",
		amount: "+$500.00",
		date: "Feb 22, 2025",
		status: "Completed",
	},
	{
		id: 2,
		type: "Withdrawal",
		amount: "-$150.00",
		date: "Feb 20, 2025",
		status: "Pending",
	},
	{
		id: 3,
		type: "Subscription",
		amount: "-$20.00",
		date: "Feb 18, 2025",
		status: "Completed",
	},
];

const PaymentOverview = () => {
	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaWallet className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Payment Overview</h2>
						<p className="text-gray-200 text-sm">
							Manage your balance and transactions
						</p>
					</div>
				</div>
			</div>

			{/* Balance Overview */}
			<div className="mt-6 bg-gray-100 p-4 rounded-lg text-center">
				<h3 className="text-lg font-semibold">Current Balance</h3>
				<p className="text-2xl font-bold text-green-600">$1,350.75</p>
				<Button
					type="primary"
					className="w-full mt-3 bg-blue-600 border-blue-600"
				>
					Add Funds
				</Button>
			</div>

			{/* Payment Methods */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">Payment Methods</h3>
				<div className="flex justify-between bg-gray-100 p-3 rounded-lg mt-2">
					<div className="flex items-center gap-3">
						<FaCreditCard className="text-blue-500 text-xl" />
						<p className="text-gray-700">Visa **** 1234</p>
					</div>
					<Button type="link" className="text-blue-600">
						Manage
					</Button>
				</div>
			</div>

			{/* Transaction History */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold">Recent Transactions</h3>
				<Card className="mt-2">
					<List
						dataSource={transactions}
						renderItem={({ id, type, amount, date, status }) => (
							<List.Item className="flex justify-between items-center p-3 border-b">
								<div>
									<p className="font-medium">{type}</p>
									<span className="text-gray-500 text-sm">{date}</span>
								</div>
								<div className="text-right">
									<p
										className={`font-semibold ${
											amount.startsWith("+") ? "text-green-600" : "text-red-600"
										}`}
									>
										{amount}
									</p>
									<span className="text-gray-500 text-sm">{status}</span>
								</div>
							</List.Item>
						)}
					/>
				</Card>
			</div>
		</div>
	);
};

export default PaymentOverview;
