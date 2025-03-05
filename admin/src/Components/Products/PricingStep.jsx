import React from "react";
import { Form, InputNumber, Input, Button, Space, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { StyledCard, PriceInput } from "./StyledComponents";

const PricingStep = () => (
	<Row gutter={[24, 24]}>
		<Col span={24}>
			<StyledCard title="Pricing Information">
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="price"
							label="Regular Price (KES)"
							rules={[{ required: true }]}
						>
							<PriceInput
								addonBefore="KES"
								min={0}
								precision={2}
								formatter={(value) =>
									`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								parser={(value) => value.replace(/\KES\s?|(,*)/g, "")}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="discounted_price" label="Sale Price (KES)">
							<PriceInput
								addonBefore="KES"
								min={0}
								precision={2}
								formatter={(value) =>
									`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								parser={(value) => value.replace(/\KES\s?|(,*)/g, "")}
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="stock_quantity"
							label="Stock Quantity"
							rules={[{ required: true }]}
						>
							<InputNumber min={0} style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
							<Input placeholder="Unique product SKU" />
						</Form.Item>
					</Col>
				</Row>
			</StyledCard>
		</Col>

		<Col span={24}>
			<StyledCard title="Variants">
				<Form.List name="variants">
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Space
									key={key}
									style={{ display: "flex", marginBottom: 8 }}
									align="baseline"
								>
									<Form.Item
										{...restField}
										name={[name, "variant_name"]}
										rules={[
											{ required: true, message: "Missing variant name" },
										]}
									>
										<Input placeholder="Variant Name" />
									</Form.Item>
									<Form.Item {...restField} name={[name, "variant_price"]}>
										<PriceInput
											addonBefore="KES"
											placeholder="Price"
											min={0}
											precision={2}
										/>
									</Form.Item>
									<Form.Item {...restField} name={[name, "variant_stock"]}>
										<InputNumber placeholder="Stock" min={0} />
									</Form.Item>
									<DeleteOutlined onClick={() => remove(name)} />
								</Space>
							))}
							<Form.Item>
								<Button
									type="dashed"
									onClick={() => add()}
									block
									icon={<PlusOutlined />}
								>
									Add Variant
								</Button>
							</Form.Item>
						</>
					)}
				</Form.List>
			</StyledCard>
		</Col>
	</Row>
);

export default PricingStep;
