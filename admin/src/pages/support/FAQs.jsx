import React from "react";
import { Collapse, Card } from "antd";
import { FaQuestionCircle, FaChevronDown } from "react-icons/fa";

const { Panel } = Collapse;

const FAQs = () => {
	return (
		<div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaQuestionCircle className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">
							Frequently Asked Questions
						</h2>
						<p className="text-gray-200 text-sm">
							Find answers to common questions
						</p>
					</div>
				</div>
			</div>

			{/* FAQ Section */}
			<Card className="mt-6">
				<h3 className="text-lg font-semibold mb-3">FAQs</h3>
				<Collapse
					accordion
					expandIcon={({ isActive }) => (
						<FaChevronDown
							className={`transition-transform ${isActive ? "rotate-180" : ""}`}
						/>
					)}
				>
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
					<Panel header="How do I update my profile information?" key="4">
						<p>
							Go to your profile settings and edit your details. Click "Save
							Changes" to apply updates.
						</p>
					</Panel>
					<Panel header="Is my payment information secure?" key="5">
						<p>
							Yes, we use industry-standard encryption to protect all
							transactions and sensitive data.
						</p>
					</Panel>
					<Panel header="Can I delete my account?" key="6">
						<p>
							Yes, you can request account deletion in the settings, but note
							that this action is irreversible.
						</p>
					</Panel>
				</Collapse>
			</Card>
		</div>
	);
};

export default FAQs;
