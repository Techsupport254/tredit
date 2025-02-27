import React, { useState } from "react";
import { Input, Button, Select, Upload, Card, Form, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddProduct = () => {
	const [form] = Form.useForm();
	const [image, setImage] = useState(null);

	// Handle Image Upload
	const handleUpload = (file) => {
		const reader = new FileReader();
		reader.onload = () => setImage(reader.result);
		reader.readAsDataURL(file);
		return false;
	};

	// Handle Form Submission
	const handleSubmit = (values) => {
		console.log("Product Added:", values);
		message.success("Product added successfully!");
	};

	return (
		<div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header */}
			<div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold">Add New Product</h2>
				<p className="text-gray-200 text-sm mt-1">
					Fill in the details to list a new product.
				</p>
			</div>

			{/* Product Form */}
			<Card className="mt-6 shadow-md rounded-lg p-6">
				<Form layout="vertical" form={form} onFinish={handleSubmit}>
					{/* Product Name */}
					<Form.Item
						name="name"
						label="Product Name"
						rules={[{ required: true, message: "Product name is required" }]}
					>
						<Input placeholder="Enter product name" />
					</Form.Item>

					{/* Category Selection */}
					<Form.Item
						name="category"
						label="Category"
						rules={[{ required: true, message: "Select a category" }]}
					>
						<Select placeholder="Select category">
							<Option value="Electronics">Electronics</Option>
							<Option value="Fashion">Fashion</Option>
							<Option value="Accessories">Accessories</Option>
							<Option value="Home & Living">Home & Living</Option>
						</Select>
					</Form.Item>

					{/* Price */}
					<Form.Item
						name="price"
						label="Price ($)"
						rules={[{ required: true, message: "Enter the price" }]}
					>
						<Input type="number" min="1" placeholder="Enter product price" />
					</Form.Item>

					{/* Stock Quantity */}
					<Form.Item
						name="stock"
						label="Stock Quantity"
						rules={[{ required: true, message: "Enter stock quantity" }]}
					>
						<Input type="number" min="0" placeholder="Enter stock quantity" />
					</Form.Item>

					{/* Image Upload */}
					<Form.Item name="image" label="Upload Product Image">
						<Upload
							beforeUpload={handleUpload}
							showUploadList={false}
							accept="image/*"
						>
							<Button icon={<UploadOutlined />}>Upload Image</Button>
						</Upload>
						{image && (
							<div className="mt-3">
								<img
									src={image}
									alt="Product Preview"
									className="w-32 h-32 object-cover rounded-lg border"
								/>
							</div>
						)}
					</Form.Item>

					{/* Submit Button */}
					<Form.Item>
						<Button type="primary" htmlType="submit" className="w-full">
							Add Product
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default AddProduct;
