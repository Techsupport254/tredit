import React from "react";
import { Form, Input, Select, Row, Col } from "antd";
import { StyledCard } from "./StyledComponents";

const { Option } = Select;
const { TextArea } = Input;

const BasicInfoStep = () => (
	<Row gutter={[24, 24]}>
		<Col span={24}>
			<StyledCard title="Basic Information">
				<Form.Item
					name="name"
					label="Product Name"
					rules={[{ required: true, message: "Please enter product name" }]}
				>
					<Input
						placeholder="Enter a catchy product name"
						maxLength={100}
						showCount
					/>
				</Form.Item>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="category_id"
							label="Category"
							rules={[{ required: true }]}
						>
							<Select placeholder="Select category" showSearch>
								<Option value="1">Electronics</Option>
								<Option value="2">Fashion</Option>
								<Option value="3">Home & Living</Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="brand" label="Brand">
							<Input placeholder="Brand name" />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					name="short_description"
					label="Short Description"
					rules={[{ required: true }]}
				>
					<TextArea
						placeholder="Brief product description (150 characters)"
						maxLength={150}
						showCount
						rows={2}
					/>
				</Form.Item>

				<Form.Item
					name="description"
					label="Full Description"
					rules={[{ required: true }]}
				>
					<TextArea
						placeholder="Detailed product description"
						rows={4}
						showCount
						maxLength={1000}
					/>
				</Form.Item>
			</StyledCard>
		</Col>
	</Row>
);

export default BasicInfoStep;
