import React, { useState } from "react";
import { Input, Button, Card, Select, message } from "antd";
import { FaBuilding, FaPhone, FaGlobe, FaSave } from "react-icons/fa";

const { Option } = Select;

const BusinessInfo = () => {
	const [business, setBusiness] = useState({
		name: "Tech Innovators",
		category: "Technology",
		phone: "+1234567890",
		website: "https://techinnovators.com",
		description: "A leading tech company providing innovative solutions.",
	});

	const handleInputChange = (e) => {
		setBusiness({ ...business, [e.target.name]: e.target.value });
	};

	const handleCategoryChange = (value) => {
		setBusiness({ ...business, category: value });
	};

	const handleSave = () => {
		message.success("Business information updated successfully!");
	};

	return (
		<div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="text-center bg-gradient-to-r from-green-500 to-blue-600 p-6 rounded-lg text-white">
				<h2 className="text-xl font-semibold">Business Information</h2>
				<p className="text-gray-200 text-sm">
					Update your business details for better visibility.
				</p>
			</div>

			{/* Business Info Form */}
			<Card className="mt-6">
				<h3 className="text-lg font-semibold mb-3">Edit Business Details</h3>

				<label className="text-sm font-semibold">Business Name</label>
				<Input
					name="name"
					value={business.name}
					onChange={handleInputChange}
					prefix={<FaBuilding className="text-gray-400" />}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Category</label>
				<Select
					value={business.category}
					onChange={handleCategoryChange}
					className="w-full mb-3"
				>
					<Option value="Technology">Technology</Option>
					<Option value="Retail">Retail</Option>
					<Option value="Health & Wellness">Health & Wellness</Option>
					<Option value="Finance">Finance</Option>
					<Option value="Education">Education</Option>
				</Select>

				<label className="text-sm font-semibold">Contact Phone</label>
				<Input
					name="phone"
					type="tel"
					value={business.phone}
					onChange={handleInputChange}
					prefix={<FaPhone className="text-gray-400" />}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Website</label>
				<Input
					name="website"
					type="url"
					value={business.website}
					onChange={handleInputChange}
					prefix={<FaGlobe className="text-gray-400" />}
					className="mb-3"
				/>

				<label className="text-sm font-semibold">Business Description</label>
				<Input.TextArea
					name="description"
					value={business.description}
					onChange={handleInputChange}
					rows={3}
					className="mb-3"
				/>

				<Button
					type="primary"
					icon={<FaSave />}
					className="w-full bg-green-500 mt-4"
					onClick={handleSave}
				>
					Save Changes
				</Button>
			</Card>
		</div>
	);
};

export default BusinessInfo;
