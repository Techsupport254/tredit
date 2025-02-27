import React, { useState } from "react";
import { Input, Card, Collapse } from "antd";
import {
	FaSearch,
	FaQuestionCircle,
	FaInfoCircle,
	FaRegLightbulb,
} from "react-icons/fa";

const { Panel } = Collapse;

const HelpCenter = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	return (
		<div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaQuestionCircle className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Help Center</h2>
						<p className="text-gray-200 text-sm">
							Find answers and get support
						</p>
					</div>
				</div>
			</div>

			{/* Search Bar */}
			<div className="mt-6">
				<Input
					size="large"
					placeholder="Search for help articles..."
					prefix={<FaSearch className="text-gray-400" />}
					value={searchQuery}
					onChange={handleSearch}
				/>
			</div>

			{/* Help Categories */}
			<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Card className="flex items-center p-4 cursor-pointer hover:shadow-lg transition">
					<FaInfoCircle className="text-blue-600 text-3xl mr-4" />
					<div>
						<h3 className="font-medium">Getting Started</h3>
						<p className="text-gray-500 text-sm">
							Learn the basics of our platform
						</p>
					</div>
				</Card>

				<Card className="flex items-center p-4 cursor-pointer hover:shadow-lg transition">
					<FaRegLightbulb className="text-yellow-500 text-3xl mr-4" />
					<div>
						<h3 className="font-medium">Tips & Tricks</h3>
						<p className="text-gray-500 text-sm">
							Enhance your experience with useful tips
						</p>
					</div>
				</Card>
			</div>

			{/* FAQ Section */}
			<Card className="mt-6">
				<h3 className="text-lg font-semibold mb-3">
					Frequently Asked Questions
				</h3>
				<Collapse accordion>
					<Panel header="How do I reset my password?" key="1">
						<p>
							Go to your account settings, select "Reset Password," and follow
							the instructions sent to your email.
						</p>
					</Panel>
					<Panel header="Where can I find my transaction history?" key="2">
						<p>
							Visit the "Transaction History" section in your account to view
							past payments.
						</p>
					</Panel>
					<Panel header="How can I contact support?" key="3">
						<p>
							You can reach our support team via email at support@example.com or
							through live chat.
						</p>
					</Panel>
				</Collapse>
			</Card>
		</div>
	);
};

export default HelpCenter;
