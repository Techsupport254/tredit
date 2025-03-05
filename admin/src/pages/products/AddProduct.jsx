import { useState } from "react";
import {
	Steps,
	Form,
	Input,
	InputNumber,
	Select,
	Upload,
	Button,
	Card,
	Tag,
	Switch,
	Divider,
	message,
	Space,
	Tabs,
	Checkbox,
	Row,
	Col,
} from "antd";
import {
	PlusOutlined,
	DeleteOutlined,
	DollarOutlined,
	UploadOutlined,
	YoutubeOutlined,
	FacebookOutlined,
	InstagramOutlined,
	ShopOutlined,
	TikTokOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useProduct } from "../../Context/ProductContext";
import { useAuth } from "../../Context/AuthContext";
import styled from "styled-components";
import BasicInfoStep from "../../Components/Products/BasicInfoStep";
import PricingStep from "../../Components/Products/PricingStep";
import MediaStep from "../../Components/Products/MediaStep";
import ShippingSEOStep from "../../Components/Products/ShippingSEOStep";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Styled Components
const StyledCard = styled(Card)`
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border-radius: 12px;
	transition: all 0.3s ease;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
`;

const VideoCard = styled(Card)`
	margin-top: 16px;
	border-radius: 8px;
	background: ${(props) => (props.$isPlatformSelected ? "#f8f9ff" : "#fff")};
	border: 1px solid
		${(props) => (props.$isPlatformSelected ? "#4096ff" : "#d9d9d9")};
`;

const PlatformIcon = styled.div`
	font-size: 24px;
	margin-right: 8px;
	opacity: ${(props) => (props.$isSelected ? 1 : 0.5)};
	transition: all 0.3s ease;
`;

const PriceInput = styled(InputNumber)`
	width: 100%;
	.ant-input-number-group-addon {
		background-color: #f0f2f5;
		color: #666;
		font-weight: 500;
	}
`;

const AddProduct = () => {
	const [form] = Form.useForm();
	const { addProduct, loading } = useProduct();
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(0);
	const [images, setImages] = useState([]);
	const [videos, setVideos] = useState([]);
	const [tags, setTags] = useState([]);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState("");

	// Platform icons mapping
	const platformIcons = {
		youtube: <YoutubeOutlined style={{ color: "#FF0000" }} />,
		facebook: <FacebookOutlined style={{ color: "#1877F2" }} />,
		instagram: <InstagramOutlined style={{ color: "#E4405F" }} />,
		tiktok: <TikTokOutlined style={{ color: "#000000" }} />,
	};

	const handleVideoAdd = () => {
		setVideos([
			...videos,
			{
				title: "",
				description: "",
				thumbnail: null,
				file: null,
				platforms: [], // Array of selected platforms
			},
		]);
	};

	const handleVideoChange = (index, field, value) => {
		const updatedVideos = [...videos];
		updatedVideos[index][field] = value;
		setVideos(updatedVideos);
	};

	const handlePlatformToggle = (index, platform) => {
		const updatedVideos = [...videos];
		const currentPlatforms = updatedVideos[index].platforms || [];

		if (currentPlatforms.includes(platform)) {
			updatedVideos[index].platforms = currentPlatforms.filter(
				(p) => p !== platform
			);
		} else {
			updatedVideos[index].platforms = [...currentPlatforms, platform];
		}

		setVideos(updatedVideos);
	};

	const handleVideoDelete = (index) => {
		setVideos(videos.filter((_, i) => i !== index));
	};

	const steps = [
		{
			title: "Basic Info",
			content: <BasicInfoStep />,
		},
		{
			title: "Pricing & Stock",
			content: <PricingStep />,
		},
		{
			title: "Media",
			content: (
				<MediaStep
					images={images}
					setImages={setImages}
					videos={videos}
					handleVideoAdd={handleVideoAdd}
					handleVideoChange={handleVideoChange}
					handleVideoDelete={handleVideoDelete}
					handlePlatformToggle={handlePlatformToggle}
					platformIcons={platformIcons}
				/>
			),
		},
		{
			title: "Shipping & SEO",
			content: (
				<ShippingSEOStep
					tags={tags}
					setTags={setTags}
					inputVisible={inputVisible}
					setInputVisible={setInputVisible}
					inputValue={inputValue}
					setInputValue={setInputValue}
				/>
			),
		},
	];

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Add tags to the form data
			values.tags = tags;

			// Add images and videos
			values.images = images;
			values.videos = videos;

			await addProduct(values);

			// Reset form
			form.resetFields();
			setImages([]);
			setVideos([]);
			setTags([]);
			setCurrentStep(0);
		} catch (error) {
			console.error("Validation failed:", error);
			message.error("Please fill in all required fields");
		}
	};

	const next = async () => {
		try {
			await form.validateFields();
			setCurrentStep(currentStep + 1);
		} catch (error) {
			console.error("Validation failed:", error);
		}
	};

	const prev = () => {
		setCurrentStep(currentStep - 1);
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="max-w-7xl mx-auto p-6"
		>
			<StyledCard>
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
					<p className="text-gray-500">
						Fill in the details to create a new product listing
					</p>
				</div>

				<Steps
					current={currentStep}
					items={steps.map((item) => ({ title: item.title }))}
					className="mb-8"
				/>

				<Form
					form={form}
					layout="vertical"
					className="mt-8"
					requiredMark="optional"
				>
					<motion.div
						key={currentStep}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
					>
						{steps[currentStep].content}
					</motion.div>

					<div className="flex justify-between mt-8">
						{currentStep > 0 && (
							<Button size="large" onClick={prev}>
								Previous
							</Button>
						)}
						{currentStep < steps.length - 1 && (
							<Button type="primary" size="large" onClick={next}>
								Next
							</Button>
						)}
						{currentStep === steps.length - 1 && (
							<Button
								type="primary"
								size="large"
								onClick={handleSubmit}
								loading={loading}
							>
								Submit Product
							</Button>
						)}
					</div>
				</Form>
			</StyledCard>
		</motion.div>
	);
};

export default AddProduct;
