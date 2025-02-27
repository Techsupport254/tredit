import React from "react";
import { Form, Input, Button, Card, Collapse } from "antd";
import {
	FaHeadset,
	FaEnvelope,
	FaPhoneAlt,
	FaQuestionCircle,
} from "react-icons/fa";

const { Panel } = Collapse;

const ContactSupport = () => {
	const handleSubmit = (values) => {
		console.log("Submitted:", values);
	};

	return (
		<div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
				<div className="flex items-center gap-4">
					<FaHeadset className="text-4xl" />
					<div>
						<h2 className="text-xl font-semibold">Contact Support</h2>
						<p className="text-gray-200 text-sm">We're here to help you</p>
					</div>
				</div>
			</div>

			{/* Support Form */}
			<Card className="mt-6">
				<h3 className="text-lg font-semibold">Send us a Message</h3>
				<Form layout="vertical" onFinish={handleSubmit}>
					<Form.Item
						label="Your Name"
						name="name"
						rules={[{ required: true, message: "Please enter your name" }]}
					>
						<Input placeholder="John Doe" />
					</Form.Item>

					<Form.Item
						label="Your Email"
						name="email"
						rules={[{ required: true, message: "Please enter your email" }]}
					>
						<Input placeholder="example@email.com" type="email" />
					</Form.Item>

					<Form.Item
						label="Message"
						name="message"
						rules={[{ required: true, message: "Please enter your message" }]}
					>
						<Input.TextArea rows={4} placeholder="Describe your issue..." />
					</Form.Item>

					<Button type="primary" htmlType="submit" className="w-full">
						Send Message
					</Button>
				</Form>
			</Card>

			{/* Contact Options */}
			<div className="mt-6 space-y-4">
				<div className="flex items-center bg-gray-100 p-4 rounded-lg">
					<FaEnvelope className="text-blue-600 text-2xl mr-4" />
					<div>
						<p className="font-medium">Email Support</p>
						<p className="text-gray-600">support@example.com</p>
					</div>
				</div>

				<div className="flex items-center bg-gray-100 p-4 rounded-lg">
					<FaPhoneAlt className="text-green-600 text-2xl mr-4" />
					<div>
						<p className="font-medium">Phone Support</p>
						<p className="text-gray-600">+1 (800) 123-4567</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactSupport;
