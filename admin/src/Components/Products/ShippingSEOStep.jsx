import React from "react";
import { Form, Input, InputNumber, Select, Switch, Tag, Card } from "antd";
import { DollarOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const ShippingSEOStep = ({
	tags,
	setTags,
	inputVisible,
	setInputVisible,
	inputValue,
	setInputValue,
}) => (
	<div className="space-y-6">
		<Card
			title="Shipping Information"
			className="shadow-sm hover:shadow-md transition-shadow"
		>
			{/* Shipping form items */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Form.Item name="shipping_cost" label="Shipping Cost">
					<InputNumber
						prefix={<DollarOutlined />}
						min={0}
						precision={2}
						style={{ width: "100%" }}
					/>
				</Form.Item>

				<Form.Item name="free_shipping" label="Free Shipping">
					<Switch />
				</Form.Item>

				<Form.Item name="shipping_time" label="Shipping Time">
					<Input placeholder="e.g., 2-3 business days" />
				</Form.Item>

				<Form.Item name="return_policy" label="Return Policy">
					<Select placeholder="Select return policy">
						<Option value="7">7 days return</Option>
						<Option value="14">14 days return</Option>
						<Option value="30">30 days return</Option>
					</Select>
				</Form.Item>
			</div>
		</Card>

		<Card
			title="SEO Information"
			className="shadow-sm hover:shadow-md transition-shadow"
		>
			{/* SEO form items */}
			<Form.Item name="meta_title" label="Meta Title">
				<Input placeholder="SEO-friendly title" />
			</Form.Item>

			<Form.Item name="meta_description" label="Meta Description">
				<TextArea
					placeholder="Brief description for search engines"
					rows={3}
					showCount
					maxLength={160}
				/>
			</Form.Item>

			<Form.Item label="Tags">
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<Tag
							key={tag}
							closable
							onClose={() => setTags(tags.filter((t) => t !== tag))}
						>
							{tag}
						</Tag>
					))}
					{inputVisible ? (
						<Input
							type="text"
							size="small"
							style={{ width: 78 }}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onBlur={() => {
								if (inputValue) {
									setTags([...tags, inputValue]);
								}
								setInputVisible(false);
								setInputValue("");
							}}
							onPressEnter={() => {
								if (inputValue) {
									setTags([...tags, inputValue]);
								}
								setInputVisible(false);
								setInputValue("");
							}}
						/>
					) : (
						<Tag
							onClick={() => setInputVisible(true)}
							className="cursor-pointer"
						>
							<PlusOutlined /> New Tag
						</Tag>
					)}
				</div>
			</Form.Item>
		</Card>
	</div>
);

export default ShippingSEOStep;
