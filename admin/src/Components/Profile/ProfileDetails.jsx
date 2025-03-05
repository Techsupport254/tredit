import { useState } from "react";
import {
	Collapse,
	Button,
	Tooltip,
	Form,
	Input,
	Select,
	DatePicker,
} from "antd";
import {
	UserOutlined,
	CaretRightOutlined,
	EditOutlined,
	CheckCircleFilled,
	CloseOutlined,
	SaveOutlined,
} from "@ant-design/icons";
import moment from "moment";
import PropTypes from "prop-types";
import styled from "styled-components";

const { Option } = Select;

const StyledCollapse = styled(Collapse)`
	background: white;
	border-radius: 16px !important;
	overflow: hidden;

	.ant-collapse-header {
		padding: 16px 24px !important;
	}

	.ant-collapse-content-box {
		padding: 20px !important;
	}
`;

const StatusIcon = styled.div`
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 8px;

	.complete-icon {
		color: #10b981;
		font-size: 18px;
	}

	.edit-button {
		padding: 4px 8px;
		height: auto;
		font-size: 12px;
		border-radius: 6px;
	}
`;

const FieldWrapper = styled.div`
	background: ${(props) => (props.isEditing ? "#ffffff" : "#f8fafc")};
	border-radius: 8px;
	padding: 12px;
	transition: all 0.3s ease;
	border: 1px solid ${(props) => (props.isEditing ? "#e2e8f0" : "transparent")};

	&:hover {
		background: ${(props) => (props.isEditing ? "#ffffff" : "#f1f5f9")};
	}

	.field-label {
		color: #64748b;
		font-size: 0.875rem;
		margin-bottom: 4px;
	}

	.field-value {
		color: #1e293b;
		font-weight: 500;
	}

	.ant-form-item {
		margin-bottom: 0;
	}

	.ant-input,
	.ant-select-selector,
	.ant-picker {
		border-radius: 6px;
		border-color: #e2e8f0;

		&:hover,
		&:focus {
			border-color: #3b82f6;
			box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
		}
	}
`;

const ProfileDetails = ({ profileFields, editData, onSave }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [form] = Form.useForm();

	const isProfileComplete = () => {
		const requiredFields = profileFields.filter((field) => !field.optional);
		return requiredFields.every(({ key, validator }) => {
			const value = editData[key];
			if (validator) {
				return validator(value);
			}
			return value && value.toString().trim() !== "";
		});
	};

	const getCompletionStatus = () => {
		const total = profileFields.filter((field) => !field.optional).length;
		const completed = profileFields.filter((field) => {
			const value = editData[field.key];
			if (field.validator) {
				return field.validator(value);
			}
			return value && value.toString().trim() !== "";
		}).length;

		return {
			total,
			completed,
			percentage: Math.round((completed / total) * 100),
		};
	};

	const handleEdit = () => {
		setIsEditing(true);
		form.setFieldsValue({
			...editData,
			dob: editData.dob ? moment(editData.dob) : null,
		});
	};

	const handleCancel = () => {
		setIsEditing(false);
		form.resetFields();
	};

	const handleSave = async () => {
		try {
			const values = await form.validateFields();
			await onSave(values);
			setIsEditing(false);
		} catch (error) {
			console.error("Error saving profile:", error);
		}
	};

	const renderField = (field) => {
		const { label, key, icon, editable, type, validator, optional } = field;
		const value = editData[key];
		const isValid = validator
			? validator(value)
			: value && value.toString().trim() !== "";

		if (!isEditing) {
			return (
				<div className="flex items-center gap-3">
					<span className="text-blue-600">{icon}</span>
					<div className="flex-grow">
						<div className="field-label flex items-center gap-2">
							{label}
							{!optional && <span className="text-red-500">*</span>}
						</div>
						<div className="field-value">
							{key === "dob" && value
								? moment(value).format("MMMM D, YYYY")
								: value || "Not set"}
						</div>
					</div>
					{!isValid && !optional && (
						<Tooltip title="Required field">
							<span className="text-red-500">
								<CloseOutlined />
							</span>
						</Tooltip>
					)}
				</div>
			);
		}

		if (!editable) {
			return (
				<div className="flex items-center gap-3">
					<span className="text-blue-600">{icon}</span>
					<div>
						<div className="field-label">{label}</div>
						<div className="field-value">{value}</div>
					</div>
				</div>
			);
		}

		return (
			<Form.Item
				name={key}
				label={
					<span className="flex items-center gap-2">
						{label}
						{!optional && <span className="text-red-500">*</span>}
					</span>
				}
				rules={[
					{
						required: !optional,
						message: `Please enter your ${label.toLowerCase()}`,
					},
					...(validator
						? [
								{
									validator: (_, value) =>
										validator(value)
											? Promise.resolve()
											: Promise.reject(
													new Error(`Invalid ${label.toLowerCase()}`)
											  ),
								},
						  ]
						: []),
				]}
			>
				{type === "select" ? (
					<Select placeholder={`Select ${label.toLowerCase()}`}>
						<Option value="male">Male</Option>
						<Option value="female">Female</Option>
						<Option value="other">Other</Option>
					</Select>
				) : type === "date" ? (
					<DatePicker
						style={{ width: "100%" }}
						format="YYYY-MM-DD"
						placeholder={`Select ${label.toLowerCase()}`}
					/>
				) : (
					<Input
						prefix={icon}
						placeholder={`Enter your ${label.toLowerCase()}`}
					/>
				)}
			</Form.Item>
		);
	};

	const completionStatus = getCompletionStatus();

	return (
		<StyledCollapse
			className="bg-white rounded-2xl overflow-hidden"
			expandIcon={({ isActive }) => (
				<CaretRightOutlined
					rotate={isActive ? 90 : 0}
					className="text-blue-600"
				/>
			)}
			defaultActiveKey={["1"]}
		>
			<Collapse.Panel
				header={
					<div className="flex items-center gap-2 w-full">
						<UserOutlined className="text-blue-600" />
						<span className="font-semibold text-gray-800">Profile Details</span>
						<StatusIcon>
							{isProfileComplete() ? (
								<div className="flex items-center gap-4">
									<Tooltip title="Profile Complete">
										<div className="flex items-center gap-2">
											<span className="text-sm text-green-600">Complete</span>
											<CheckCircleFilled className="complete-icon" />
										</div>
									</Tooltip>
									<Button
										type="primary"
										onClick={handleEdit}
										className="edit-button"
										ghost
									>
										Edit
									</Button>
								</div>
							) : (
								<div className="flex items-center gap-4">
									<Tooltip
										title={`${completionStatus.completed} of ${completionStatus.total} fields completed`}
									>
										<div className="flex items-center gap-2">
											<span className="text-sm text-orange-500">
												{completionStatus.percentage}% Complete
											</span>
										</div>
									</Tooltip>
									<Button
										type="primary"
										icon={<EditOutlined />}
										onClick={handleEdit}
										className="edit-button"
										ghost
									>
										Complete Profile
									</Button>
								</div>
							)}
						</StatusIcon>
					</div>
				}
				key="1"
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						...editData,
						dob: editData.dob ? moment(editData.dob) : null,
					}}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{profileFields.map((field) => (
							<FieldWrapper key={field.key} isEditing={isEditing}>
								{renderField(field)}
							</FieldWrapper>
						))}
					</div>

					{isEditing && (
						<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
							<Button onClick={handleCancel} icon={<CloseOutlined />}>
								Cancel
							</Button>
							<Button
								type="primary"
								onClick={handleSave}
								icon={<SaveOutlined />}
							>
								Save Changes
							</Button>
						</div>
					)}
				</Form>
			</Collapse.Panel>
		</StyledCollapse>
	);
};

ProfileDetails.propTypes = {
	profileFields: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			key: PropTypes.string.isRequired,
			icon: PropTypes.node.isRequired,
			editable: PropTypes.bool,
			type: PropTypes.string,
			validator: PropTypes.func,
			optional: PropTypes.bool,
		})
	).isRequired,
	editData: PropTypes.object.isRequired,
	onSave: PropTypes.func.isRequired,
};

export default ProfileDetails;
