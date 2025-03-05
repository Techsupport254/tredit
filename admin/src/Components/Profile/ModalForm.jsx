import { Form, Input, Select, DatePicker, Modal } from "antd";
import {
	GoogleOutlined,
	UserOutlined,
	PhoneOutlined,
	CalendarOutlined,
	EnvironmentOutlined,
	CheckCircleFilled,
} from "@ant-design/icons";
import moment from "moment";
import PropTypes from "prop-types";
import styled from "styled-components";
import { motion } from "framer-motion";

const { Option } = Select;

// Styled Components
const FormContainer = styled(motion.div)`
	.ant-form {
		padding: 1rem 0;
	}
`;

const SectionHeader = styled.div`
	padding: 0.75rem 1rem;
	background: linear-gradient(
		90deg,
		rgba(99, 102, 241, 0.1) 0%,
		rgba(59, 130, 246, 0.05) 100%
	);
	border-radius: 0.75rem;
	margin: 1.5rem 0;
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 3px;
		background: #3b82f6;
	}

	h3 {
		margin: 0;
		color: #1e293b;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.ant-collapse-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 8px;
	}
`;

const StyledInput = styled(Input)`
	border-radius: 0.75rem;
	padding: 0.75rem 1rem;
	border: 1px solid #e2e8f0;
	transition: all 0.2s ease;

	&:hover {
		border-color: #94a3b8;
	}

	&:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}

	.ant-input-prefix {
		color: #94a3b8;
		margin-right: 0.75rem;
	}
`;

const StyledTextArea = styled(Input.TextArea)`
	border-radius: 0.75rem;
	padding: 0.75rem 1rem;
	border: 1px solid #e2e8f0;
	resize: vertical;

	&:hover {
		border-color: #94a3b8;
	}

	&:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
`;

const StyledSelect = styled(Select)`
	.ant-select-selector {
		border-radius: 0.75rem !important;
		padding: 0.75rem 1rem !important;
		border: 1px solid #e2e8f0 !important;
		height: auto !important;
	}

	.ant-select-arrow {
		color: #94a3b8;
	}
`;

const StyledDatePicker = styled(DatePicker)`
	border-radius: 0.75rem;
	padding: 0.75rem 1rem;
	width: 100%;
	border: 1px solid #e2e8f0;

	.ant-picker-input input {
		&::placeholder {
			color: #94a3b8;
		}
	}
`;

const FormLabel = styled(Form.Item)`
	.ant-form-item-label {
		label {
			color: #475569 !important;
			font-weight: 500;
			font-size: 0.875rem;
		}
	}

	.ant-form-item-explain-error {
		margin-top: 0.25rem;
		font-size: 0.75rem;
	}
`;

const ModalTitle = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;

	.completion-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;

		.check-icon {
			font-size: 16px;
			transition: all 0.3s ease;
		}

		&.complete {
			color: #10b981;
			.check-icon {
				transform: scale(1.1);
			}
		}

		&.incomplete {
			color: #94a3b8;
		}
	}
`;

const ModalForm = ({
	form,
	editData,
	handleSave,
	isVisible,
	onCancel,
	savingChanges,
}) => {
	const checkFormCompletion = () => {
		const requiredFields = ["name", "email", "location", "dob", "gender"];
		const values = form.getFieldsValue();
		return requiredFields.every((field) => {
			const value = values[field];
			return value !== undefined && value !== null && value !== "";
		});
	};

	const renderModalTitle = () => {
		const isComplete = checkFormCompletion();
		return (
			<ModalTitle>
				<span className="text-lg font-semibold">Edit Profile</span>
				<div
					className={`completion-indicator ${
						isComplete ? "complete" : "incomplete"
					}`}
				>
					{isComplete ? (
						<>
							<span>All set!</span>
							<CheckCircleFilled className="check-icon" />
						</>
					) : (
						<>
							<span>Required fields pending</span>
							<div className="w-4 h-4 rounded-full border-2 border-gray-300" />
						</>
					)}
				</div>
			</ModalTitle>
		);
	};

	return (
		<Modal
			title={renderModalTitle()}
			open={isVisible}
			onCancel={onCancel}
			onOk={() => form.submit()}
			okText="Save Changes"
			confirmLoading={savingChanges}
			width={600}
			className="profile-edit-modal"
		>
			<FormContainer
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSave}
					initialValues={{
						...editData,
						dob: editData.dob ? moment(editData.dob, "YYYY-MM-DD") : null,
					}}
					onValuesChange={() => {
						form
							.validateFields()
							.then(() => {})
							.catch(() => {});
					}}
				>
					<SectionHeader>
						<h3>
							<UserOutlined /> Personal Information
						</h3>
					</SectionHeader>

					<FormLabel label="Full Name" name="name" rules={[{ required: true }]}>
						<StyledInput prefix={<UserOutlined />} placeholder="John Doe" />
					</FormLabel>

					<FormLabel
						label="Email Address"
						name="email"
						rules={[{ required: true, type: "email" }]}
					>
						<StyledInput
							prefix={<GoogleOutlined />}
							placeholder="john@example.com"
						/>
					</FormLabel>

					<SectionHeader>
						<h3>
							<PhoneOutlined /> Contact Details
						</h3>
					</SectionHeader>

					<FormLabel label="Phone Number" name="phone">
						<StyledInput
							prefix={<PhoneOutlined />}
							placeholder="+254 712 345 678"
						/>
					</FormLabel>

					<FormLabel
						label="Location"
						name="location"
						rules={[{ required: true }]}
					>
						<StyledInput
							prefix={<EnvironmentOutlined />}
							placeholder="Nairobi, Kenya"
						/>
					</FormLabel>

					<SectionHeader>
						<h3>
							<CalendarOutlined /> Additional Information
						</h3>
					</SectionHeader>

					<FormLabel
						label="Date of Birth"
						name="dob"
						rules={[{ required: true }]}
					>
						<StyledDatePicker
							format="YYYY-MM-DD"
							disabledDate={(current) => current > moment().endOf("day")}
						/>
					</FormLabel>

					<FormLabel label="Gender" name="gender" rules={[{ required: true }]}>
						<StyledSelect placeholder="Select gender">
							<Option value="male">Male</Option>
							<Option value="female">Female</Option>
							<Option value="other">Other</Option>
						</StyledSelect>
					</FormLabel>

					<FormLabel label="Bio" name="bio">
						<StyledTextArea
							rows={4}
							placeholder="Tell us about yourself..."
							showCount
							maxLength={200}
						/>
					</FormLabel>
				</Form>
			</FormContainer>
		</Modal>
	);
};

ModalForm.propTypes = {
	form: PropTypes.object.isRequired,
	editData: PropTypes.object.isRequired,
	handleSave: PropTypes.func.isRequired,
	isVisible: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
	savingChanges: PropTypes.bool,
};

const GlobalModalStyle = styled.div`
	.profile-edit-modal {
		.ant-modal-header {
			padding: 16px 24px;
			border-bottom: 1px solid #f0f0f0;
			margin-bottom: 0;
		}

		.ant-modal-content {
			border-radius: 16px;
			overflow: hidden;
		}

		.ant-modal-footer {
			border-top: 1px solid #f0f0f0;
			padding: 16px 24px;
		}
	}
`;

const WrappedModalForm = (props) => (
	<GlobalModalStyle>
		<ModalForm {...props} />
	</GlobalModalStyle>
);

export default WrappedModalForm;
