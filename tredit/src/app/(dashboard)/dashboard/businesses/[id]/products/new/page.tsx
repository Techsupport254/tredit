"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
	Form,
	Input,
	InputNumber,
	Select,
	Button,
	Upload,
	Card,
	Space,
	Typography,
	Divider,
	Switch,
	message,
	Row,
	Col,
	Tag,
	Radio,
	DatePicker,
	Modal,
	Carousel,
	Tabs,
	Avatar,
	Spin,
} from "antd";
import {
	UploadOutlined,
	PlusOutlined,
	YoutubeOutlined,
	VideoCameraOutlined,
	ArrowLeftOutlined,
	FacebookOutlined,
	InstagramOutlined,
	LockOutlined,
	LinkOutlined,
	GlobalOutlined,
	MinusCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { IPFSService } from "@/lib/services/ipfs.service";
import { ProductService } from "@/lib/services/product.service";
import { DatabaseService } from "@/lib/services/database.service";
import config from "@/config";
import { ProductStatus } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const { Title, Text } = Typography;
const { TextArea } = Input;
const prisma = DatabaseService.getInstance().getPrisma();

// Flag to control YouTube uploads
const SKIP_YOUTUBE_UPLOAD = false; // Set to false to enable YouTube uploads

enum VideoPlatform {
	YOUTUBE = "YOUTUBE",
	TIKTOK = "TIKTOK",
	FACEBOOK = "FACEBOOK",
	INSTAGRAM = "INSTAGRAM",
}

type VideoPlatformType = keyof typeof VideoPlatform;

interface VideoFileState {
	[VideoPlatform.YOUTUBE]: UploadFile[];
	[VideoPlatform.TIKTOK]: UploadFile[];
	[VideoPlatform.FACEBOOK]: UploadFile[];
	[VideoPlatform.INSTAGRAM]: UploadFile[];
}

// Remove Zod schema and replace with Ant Design validation rules
const formRules = {
	name: [{ required: true, message: "Name is required" }],
	variants: [
		{
			validator: (_: any, value: any[]) => {
				if (!value || value.length === 0) {
					return Promise.reject("At least one variant is required");
				}
				return Promise.resolve();
			},
		},
	],
	description: [{ required: false }],
	seo: {
		title: [{ required: false }],
		description: [{ required: false }],
		keywords: [{ required: false }],
	},
	youtubeTitle: [{ required: false }],
	youtubeDescription: [{ required: false }],
	youtubeTags: [{ required: false }],
	youtubePublishAt: [{ required: false }],
	youtubeVideo: [{ required: false }],
	youtubeCategory: [{ required: false }],
	youtubeVisibility: [{ required: false }],
};

const PlatformIcon = ({ platform }: { platform: VideoPlatformType }) => {
	switch (platform) {
		case VideoPlatform.YOUTUBE:
			return <YoutubeOutlined className="text-red-600" />;
		case VideoPlatform.FACEBOOK:
			return <FacebookOutlined className="text-blue-600" />;
		case VideoPlatform.INSTAGRAM:
			return <InstagramOutlined className="text-pink-600" />;
		case VideoPlatform.TIKTOK:
			return <VideoCameraOutlined className="text-black" />;
		default:
			return null;
	}
};

const PreviewPane = ({
	formData,
	fileList,
	videoFiles,
	selectedPlatforms,
	youtubeData,
	seoData,
}: {
	formData: {
		name: string;
		description?: string;
		variants: any[];
		status: string;
		stock: number;
		price: number;
	};
	fileList: UploadFile[];
	videoFiles: { [key: string]: UploadFile[] };
	selectedPlatforms: VideoPlatformType[];
	youtubeData?: {
		title?: string;
		description?: string;
		tags?: string;
		publishAt?: string;
		category?: string;
		visibility?: string;
		id?: string;
		customUrl?: string;
		statistics?: {
			subscriberCount: string;
			videoCount: string;
			viewCount: string;
		};
	};
	seoData?: {
		title?: string;
		description?: string;
		keywords?: string;
	};
}) => {
	const getValidImageUrl = (file: UploadFile) => {
		if (file.url) return file.url;
		if (file.thumbUrl) return file.thumbUrl;
		if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
		return "https://placehold.co/600x600/e2e8f0/1e293b?text=Product+Image";
	};

	const getTotalStock = () => {
		if (!formData.variants || !Array.isArray(formData.variants)) {
			return 0;
		}
		return formData.variants.reduce((total, variant) => {
			if (!variant || typeof variant.stock !== "number") {
				return total;
			}
			return total + variant.stock;
		}, 0);
	};

	const getFirstVariantPrice = () => {
		const firstVariant = formData.variants?.[0];
		return firstVariant?.price || 0;
	};

	const getFirstVariantStock = () => {
		const firstVariant = formData.variants?.[0];
		return firstVariant?.stock || 0;
	};

	return (
		<div className="sticky top-6 h-[calc(100vh-8rem)] overflow-y-auto">
			<Card className="h-full overflow-auto">
				<div className="space-y-6">
					<div>
						<Text strong className="text-lg">
							Preview
						</Text>
						<Divider className="my-2" />
					</div>

					{/* Product Image Preview */}
					<div className="w-full aspect-square relative rounded-lg overflow-hidden bg-gray-100">
						<div className="absolute inset-0">
							{fileList.length > 0 ? (
								<Carousel
									autoplay
									dots={fileList.length > 1}
									className="h-full"
								>
									{fileList.map((file, index) => (
										<div key={file.uid} className="h-full">
											<div className="h-full relative pb-[100%]">
												<img
													src={getValidImageUrl(file)}
													alt={`Product preview ${index + 1}`}
													className="absolute inset-0 w-full h-full object-cover"
													onError={(e) => {
														e.currentTarget.src =
															"https://placehold.co/600x600/e2e8f0/1e293b?text=Image+Error";
													}}
												/>
											</div>
										</div>
									))}
								</Carousel>
							) : (
								<div className="h-full relative pb-[100%]">
									<img
										src="https://placehold.co/600x600/e2e8f0/1e293b?text=Product+Image"
										alt="Product preview"
										className="absolute inset-0 w-full h-full object-cover"
									/>
								</div>
							)}
						</div>
					</div>

					{/* Product Details Preview */}
					<div className="space-y-4">
						<div>
							<Text strong className="text-xl">
								{formData.name || "Product Name"}
							</Text>
							<Text className="block text-lg text-blue-600">
								KES {getFirstVariantPrice().toLocaleString()}
							</Text>
						</div>

						<div>
							<Text strong>Description</Text>
							<Text className="block text-gray-600">
								{formData.description || "No description provided"}
							</Text>
						</div>

						{/* YouTube Data Preview */}
						{youtubeData && (
							<div className="space-y-2">
								<Text strong>YouTube Details</Text>

								{/* Video Preview */}
								{videoFiles[VideoPlatform.YOUTUBE]?.length > 0 && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm mb-2">
											Video
										</Text>
										<div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
											{videoFiles[VideoPlatform.YOUTUBE].map((video, index) => (
												<video
													key={index}
													src={
														video.url ||
														(video.originFileObj
															? URL.createObjectURL(video.originFileObj)
															: "")
													}
													className="object-cover w-full h-full"
													controls
													onError={(e) => {
														e.currentTarget.src =
															"https://placehold.co/600x400/e2e8f0/1e293b?text=Video+Error";
													}}
												/>
											))}
										</div>
									</div>
								)}

								{youtubeData.title && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Title
										</Text>
										<Text className="text-sm text-gray-600">
											{youtubeData.title}
										</Text>
									</div>
								)}
								{youtubeData.description && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Description
										</Text>
										<Text className="text-sm text-gray-600">
											{youtubeData.description}
										</Text>
									</div>
								)}
								{youtubeData.tags && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Tags
										</Text>
										<div className="flex flex-wrap gap-1 mt-1">
											{youtubeData.tags.split(",").map((tag, index) => (
												<Tag key={index} className="mt-1">
													{tag.trim()}
												</Tag>
											))}
										</div>
									</div>
								)}
								{youtubeData.visibility && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Visibility
										</Text>
										<Text className="text-sm text-gray-600">
											{youtubeData.visibility.charAt(0).toUpperCase() +
												youtubeData.visibility.slice(1)}
										</Text>
									</div>
								)}
								{youtubeData.category && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Category
										</Text>
										<Text className="text-sm text-gray-600">
											{youtubeData.category.charAt(0).toUpperCase() +
												youtubeData.category.slice(1)}
										</Text>
									</div>
								)}
								{youtubeData.publishAt && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Publish Date
										</Text>
										<Text className="text-sm text-gray-600">
											{youtubeData.publishAt}
										</Text>
									</div>
								)}
							</div>
						)}

						{/* SEO Data Preview */}
						{seoData && Object.values(seoData).some((value) => !!value) && (
							<div className="space-y-2">
								<Text strong>SEO Details</Text>
								{seoData.title && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Title
										</Text>
										<Text className="text-sm text-gray-600">
											{seoData.title}
										</Text>
									</div>
								)}
								{seoData.description && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Description
										</Text>
										<Text className="text-sm text-gray-600">
											{seoData.description}
										</Text>
									</div>
								)}
								{seoData.keywords && (
									<div className="p-2 bg-gray-50 rounded">
										<Text strong className="block text-sm">
											Keywords
										</Text>
										<div className="flex flex-wrap gap-1 mt-1">
											{seoData.keywords.split(",").map((keyword, index) => (
												<Tag key={index} className="mt-1">
													{keyword.trim()}
												</Tag>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Video Previews */}
						{selectedPlatforms.length > 0 && (
							<div className="space-y-4">
								<Text strong>Videos</Text>
								{selectedPlatforms.map((platform) => {
									const platformVideos = videoFiles[platform] || [];
									return (
										<div key={platform} className="space-y-2">
											<div className="flex items-center space-x-2">
												<PlatformIcon platform={platform} />
												<Text>{platform}</Text>
											</div>
											<div className="space-y-2">
												{platformVideos.length > 0 ? (
													platformVideos.map((video, index) => (
														<div
															key={video.uid}
															className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
														>
															<video
																src={
																	video.url ||
																	(video.originFileObj
																		? URL.createObjectURL(video.originFileObj)
																		: "")
																}
																className="object-cover w-full h-full"
																controls
																onError={(e) => {
																	e.currentTarget.src =
																		"https://placehold.co/600x400/e2e8f0/1e293b?text=Video+Error";
																}}
															/>
														</div>
													))
												) : (
													<div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
														<img
															src="https://placehold.co/600x400/e2e8f0/1e293b?text=No+Video"
															alt="No video available"
															className="absolute inset-0 w-full h-full object-cover"
														/>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}

						{/* Variants Preview */}
						{formData.variants?.length > 0 && (
							<div className="space-y-2">
								<Text strong>Variants</Text>
								<div className="space-y-2">
									{formData.variants.map((variant, index) => (
										<div key={index} className="p-2 bg-gray-50 rounded">
											<Text className="block">
												{variant?.name || "Unnamed"}:{" "}
												{variant?.value || "No value"}
											</Text>
											<Text className="text-sm text-gray-600">
												KES {variant?.price?.toLocaleString() || "0"} •{" "}
												{variant?.stock || 0} in stock
											</Text>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Stock Preview */}
						<div className="p-2 bg-gray-50 rounded">
							<Text strong className="block">
								Stock Status
							</Text>
							<Text className="text-sm text-gray-600">
								{getTotalStock()} units available
							</Text>
						</div>

						{/* Status Preview */}
						<div className="p-2 bg-gray-50 rounded">
							<Text strong className="block">
								Status
							</Text>
							<Text className="text-sm text-gray-600">
								{formData.status || "DRAFT"}
							</Text>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

const customStyles = `
	.custom-datepicker-popup .ant-picker-ok button {
		background-color: #3b82f6 !important;
		border-color: #3b82f6 !important;
		color: white !important;
	}
	.custom-datepicker-popup .ant-picker-ok button:hover {
		background-color: #2563eb !important;
		border-color: #2563eb !important;
	}
`;

const CustomStyles = () => (
	<style jsx global>
		{customStyles}
	</style>
);

const NewProductPage = () => {
	const router = useRouter();
	const params = useParams();
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [videoFiles, setVideoFiles] = useState<VideoFileState>({
		[VideoPlatform.YOUTUBE]: [],
		[VideoPlatform.TIKTOK]: [],
		[VideoPlatform.FACEBOOK]: [],
		[VideoPlatform.INSTAGRAM]: [],
	});
	const [selectedPlatforms, setSelectedPlatforms] = useState<
		VideoPlatformType[]
	>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [youtubeConnectionStatus, setYoutubeConnectionStatus] = useState<
		"loading" | "connected" | "not_connected" | "error"
	>("loading");
	const [youtubeConnectionError, setYoutubeConnectionError] = useState<
		string | null
	>(null);
	const [youtubeThumbnail, setYoutubeThumbnail] = useState<{
		thumbnailUrl: string;
		channelName: string;
	} | null>(null);
	const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
	const [skipYouTubeUpload, setSkipYouTubeUpload] = useState(false);
	const [youtubeData, setYoutubeData] = useState<any>(null);
	const [seoData, setSeoData] = useState<any>(null);

	// Add useEffect to fetch YouTube channel data
	useEffect(() => {
		const fetchYouTubeData = async () => {
			try {
				const response = await fetch(
					`/api/youtube?businessId=${params.id}&action=channel`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch YouTube data");
				}
				const data = await response.json();

				// Log complete YouTube account data for debugging
				console.log("YouTube Account Data:", JSON.stringify(data, null, 2));

				// Make sure to extract the correct thumbnail URL and channel name
				const thumbnailUrl =
					data.thumbnails?.default?.url ||
					data.snippet?.thumbnails?.default?.url ||
					"";
				const channelName =
					data.title || data.snippet?.title || "YouTube Channel";

				setYoutubeThumbnail({
					thumbnailUrl,
					channelName,
				});

				// Store complete YouTube data with the proper ID
				setYoutubeData({
					...data,
					id: data.id || data.snippet?.resourceId?.channelId,
				});
				setYoutubeConnectionStatus("connected");
			} catch (error) {
				console.error("Error fetching YouTube data:", error);
				setYoutubeConnectionStatus("not_connected");
				setYoutubeConnectionError(
					error instanceof Error
						? error.message
						: "Failed to fetch YouTube data"
				);
			}
		};

		fetchYouTubeData();
	}, [params.id]);

	// Add form watch for real-time updates including YouTube and SEO data
	const formValues = Form.useWatch([], form);

	// Update preview data whenever form values change
	const previewData = {
		name: formValues?.name || "",
		description: formValues?.description || "",
		variants: formValues?.variants || [],
		status: formValues?.status || "DRAFT",
		stock: formValues?.variants?.[0]?.stock || 0,
		price: formValues?.variants?.[0]?.price || 0,
	};

	// Extract YouTube data for preview
	const youtubeDataPreview = {
		title: formValues?.youtubeTitle,
		description: formValues?.youtubeDescription,
		tags: formValues?.youtubeTags,
		publishAt: formValues?.youtubePublishAt
			? dayjs(formValues.youtubePublishAt).format("YYYY-MM-DD HH:mm")
			: undefined,
		category: formValues?.youtubeCategory,
		visibility: formValues?.youtubeVisibility,
	};

	// Extract SEO data for preview
	const seoDataPreview = formValues?.seo || {};

	const handleImageUpload = async (file: RcFile) => {
		return true;
	};

	const handlePlatformChange = (values: VideoPlatformType[]) => {
		setSelectedPlatforms(values);
		form.setFieldsValue({ videoPlatforms: values });
	};

	const handleTagChange = (value: string) => {
		// Process comma-separated input
		if (typeof value === "string") {
			const tags = value
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
				.slice(0, 5);
			form.setFieldsValue({ youtubeTags: tags.join(", ") });
		}
	};

	const handleKeywordsChange = (value: string) => {
		// Process comma-separated input for SEO keywords
		if (typeof value === "string") {
			const keywords = value
				.split(",")
				.map((keyword) => keyword.trim())
				.filter(Boolean);
			form.setFieldsValue({
				seo: { ...form.getFieldValue("seo"), keywords: keywords.join(", ") },
			});
		}
	};

	const handleCancel = () => {
		setIsCancelling(true);
		message.info("Cancelling upload...");
	};

	const handleCancelConfirm = () => {
		setIsCancelling(false);
		message.success("Upload cancelled");
		router.replace(`/dashboard/businesses/${params.id}/products` as any);
	};

	const handleCancelCancel = () => {
		setIsCancelling(false);
	};

	const handleVideoUpload = (info: any) => {
		const file = info.fileList[0] || null;

		// Update form state
		form.setFieldsValue({ youtubeVideo: file });

		// Update video files state
		setVideoFiles((prev: VideoFileState) => ({
			...prev,
			[VideoPlatform.YOUTUBE]: file ? [file] : [],
		}));

		if (info.file.status === "done") {
			message.success(`${info.file.name} video selected.`);
		} else if (info.file.status === "error") {
			message.error(`${info.file.name} selection failed.`);
			form.setFieldsValue({ youtubeVideo: null });
			setVideoFiles((prev: VideoFileState) => ({
				...prev,
				[VideoPlatform.YOUTUBE]: [],
			}));
		}
	};

	const validatePublishDate = (_: any, value: any) => {
		if (!value) {
			return Promise.resolve();
		}

		// Only validate if the value has changed (new selection)
		if (value._isAMomentObject) {
			const selectedDate = dayjs(value);
			const now = dayjs();
			const minDate = now.add(10, "minute");

			if (selectedDate.isBefore(minDate)) {
				return Promise.reject(
					"Publish date must be at least 10 minutes in the future"
				);
			}
		}

		return Promise.resolve();
	};

	const onSubmit = async (values: any) => {
		try {
			setIsSubmitting(true);
			message.loading({
				content: "Starting product creation...",
				key: "productCreation",
			});

			// Step 1: Image Upload
			if (fileList.length > 0) {
				message.loading({ content: "Uploading images...", key: "imageUpload" });
				console.log("Step 1: Starting image upload...");

				try {
					const uploadFormData = new FormData();
					fileList.forEach((file) => {
						if (file.originFileObj) {
							uploadFormData.append("files", file.originFileObj);
						}
					});
					uploadFormData.append("productName", values.name);

					const uploadResponse = await fetch("/api/upload", {
						method: "POST",
						body: uploadFormData,
					});

					if (!uploadResponse.ok) {
						throw new Error("Failed to upload images");
					}

					const uploadResult = await uploadResponse.json();
					console.log("Image upload results:", uploadResult);
					message.success({
						content: "Images uploaded successfully",
						key: "imageUpload",
					});

					// Add the uploaded image URLs to the form data
					values.images = uploadResult.data;
				} catch (error) {
					console.error("Error uploading images:", error);
					message.error({
						content: "Failed to upload images",
						key: "imageUpload",
					});
					return;
				}
			}

			// Step 2: Video Upload
			let youtubeData = null;
			if (videoFiles[VideoPlatform.YOUTUBE]?.length > 0) {
				message.loading({ content: "Uploading video...", key: "videoUpload" });
				console.log("Step 2: Starting video upload...");

				try {
					const videoFormData = new FormData();
					const videoFile = videoFiles[VideoPlatform.YOUTUBE][0];

					if (videoFile.originFileObj) {
						// Prepare metadata for YouTube upload
						const metadata = {
							title: values.youtubeTitle || values.name,
							description: values.youtubeDescription || values.description,
							tags: values.youtubeTags
								? values.youtubeTags.split(",").map((tag: string) => tag.trim())
								: [],
							categoryId: values.youtubeCategory || "24",
							privacyStatus: values.youtubeVisibility || "private",
							publishAt: values.youtubePublishAt
								? dayjs(values.youtubePublishAt).toISOString()
								: undefined,
						};

						videoFormData.append("video", videoFile.originFileObj);
						videoFormData.append("businessId", String(params.id));
						videoFormData.append("metadata", JSON.stringify(metadata));

						const videoResponse = await fetch("/api/youtube", {
							method: "POST",
							body: videoFormData,
						});

						if (!videoResponse.ok) {
							const error = await videoResponse.json();
							// Check for quota exceeded error
							if (
								error.message?.includes("quota") ||
								error.message?.includes("quotaExceeded")
							) {
								message.warning({
									content:
										"YouTube API quota exceeded. Product will be created without video.",
									key: "videoUpload",
									duration: 5,
								});
								youtubeData = null;
							} else {
								throw new Error(error.message || "Failed to upload video");
							}
						} else {
							const videoResult = await videoResponse.json();
							console.log("Video upload results:", videoResult);

							message.success({
								content: "Video uploaded successfully",
								key: "videoUpload",
							});

							// Store YouTube data
							youtubeData = {
								videoId: videoResult.videoId,
								videoUrl: `https://www.youtube.com/watch?v=${videoResult.videoId}`,
								title: metadata.title,
								description: metadata.description,
								tags: metadata.tags,
								category: metadata.categoryId,
								visibility: metadata.privacyStatus,
								publishAt: metadata.publishAt,
							};
						}
					}
				} catch (error) {
					console.error("Error uploading video:", error);
					// Check if it's a quota error
					if (error instanceof Error && error.message?.includes("quota")) {
						message.warning({
							content:
								"YouTube API quota exceeded. Product will be created without video.",
							key: "videoUpload",
							duration: 5,
						});
					} else {
						message.error({
							content:
								"Failed to upload video: " +
								(error instanceof Error ? error.message : "Unknown error"),
							key: "videoUpload",
							duration: 5,
						});
					}
					// Don't return here, continue with product creation without video
					youtubeData = null;
				}
			}

			// Step 3: Prepare data for IPFS
			message.loading({
				content: "Preparing data for IPFS...",
				key: "ipfsUpload",
			});
			console.log("Step 3: Preparing data for IPFS...");
			const ipfsService = IPFSService.getInstance();
			const completeData = {
				...values,
				youtubeData,
				images: values.images || [],
				seo: values.seo || {},
				variants: values.variants || [],
				status:
					values.status === "DRAFT"
						? ProductStatus.DRAFT
						: ProductStatus.ACTIVE,
				businessId: params.id,
				timestamp: new Date().toISOString(),
			};

			let ipfsHash = null;
			try {
				ipfsHash = await ipfsService.uploadToIPFS(completeData);
				console.log("IPFS upload successful:", {
					hash: ipfsHash,
					gatewayUrl: `${config.ipfs.gatewayUrl}/ipfs/${ipfsHash}`,
					data: completeData,
				});
				message.success({
					content: "Data uploaded to IPFS successfully",
					key: "ipfsUpload",
				});

				// Step 4: Create product in database
				message.loading({
					content: "Creating product in database...",
					key: "productCreation",
				});
				console.log("Step 4: Creating product in database...");
				try {
					// Prepare the data to send to API
					const productData = {
						businessId: params.id,
						name: values.name,
						description: values.description,
						variants: values.variants,
						status:
							values.status === "DRAFT"
								? ProductStatus.DRAFT
								: ProductStatus.ACTIVE,
						ipfsHash: ipfsHash,
						seo: values.seo,
						price: values.variants[0]?.price || 0,
						stock: values.variants.reduce((total: number, variant: any) => {
							return total + (variant.stock || 0);
						}, 0),
						images: values.images,
						media: [
							// Add image media entries
							...(values.images || []).map((image: string, index: number) => ({
								type: "image",
								url: image,
								order: index + 1,
							})),
							// Add YouTube video media entry if available
							...(youtubeData
								? [
										{
											type: "VIDEO",
											url: youtubeData.videoUrl,
											order: (values.images || []).length + 1,
											metadata: {
												videoId: youtubeData.videoId,
												title: youtubeData.title,
												description: youtubeData.description,
												tags: youtubeData.tags,
												category: youtubeData.category,
												visibility: youtubeData.visibility,
												publishAt: youtubeData.publishAt,
											},
										},
								  ]
								: []),
						],
					};

					// Log the data we're sending to the API
					console.log(
						"Sending product data to API:",
						JSON.stringify(productData, null, 2)
					);

					const response = await fetch("/api/products", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(productData),
					});

					if (!response.ok) {
						const error = await response.json();
						throw new Error(error.message || "Failed to create product");
					}

					const result = await response.json();
					console.log("Product created successfully:", result);

					// Log the media info specifically to verify YouTube video was saved
					if (result.data?.media?.length > 0) {
						console.log(
							"Product media details:",
							JSON.stringify(result.data.media, null, 2)
						);
					}

					message.success({
						content: (
							<div>
								<p>Product created successfully!</p>
								<p className="text-sm text-gray-500 mt-2">
									IPFS Hash: {ipfsHash}
									{youtubeData?.videoId && (
										<>
											<br />
											YouTube Video: {youtubeData.videoId}
										</>
									)}
									{result.data?.media?.length > 0 && (
										<>
											<br />
											Media Count: {result.data.media.length}
											(Types:{" "}
											{result.data.media
												.map((m: { type: string }) => m.type)
												.join(", ")}
											)
										</>
									)}
								</p>
							</div>
						),
						key: "productCreation",
						duration: 3,
					});

					// Redirect to products page after success
					router.push(`/dashboard/businesses/${params.id}/products`);
				} catch (error) {
					console.error("Error creating product:", error);
					message.error({
						content:
							"Failed to create product: " +
							(error instanceof Error ? error.message : "Unknown error"),
						key: "productCreation",
						duration: 5,
					});
					return;
				}
			} catch (error) {
				console.error("Error during IPFS upload:", error);
				message.error({
					content:
						"Failed to upload to IPFS: " +
						(error instanceof Error ? error.message : "Unknown error"),
					key: "ipfsUpload",
					duration: 5,
				});
				return;
			}
		} catch (error) {
			console.error("Error during product creation:", error);
			message.error({
				content:
					"Failed to create product: " +
					(error instanceof Error ? error.message : "Unknown error"),
				key: "productCreation",
				duration: 5,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900">
			<CustomStyles />
			<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="mb-6">
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => router.back()}
						className="mb-4"
					>
						Back
					</Button>
					<Title level={2} className="!mb-1">
						Add New Product
					</Title>
					<Text type="secondary">
						Create a new product listing with media and video content
					</Text>
				</div>

				<Row gutter={24}>
					<Col span={16}>
						<Card>
							<Form
								form={form}
								layout="vertical"
								initialValues={{
									status: "DRAFT",
									variants: [],
									youtubeVisibility: "private",
								}}
								preserve={true}
								onFinish={onSubmit}
							>
								{/* Basic Information Section */}
								<div className="mb-8">
									<Title level={4} className="mb-4">
										Basic Information
									</Title>
									<Form.Item
										name="name"
										label="Product Name"
										rules={formRules.name}
									>
										<Input placeholder="Enter product name" />
									</Form.Item>

									<Form.Item
										name="description"
										label="Description"
										rules={formRules.description}
									>
										<TextArea
											placeholder="Enter product description"
											rows={4}
										/>
									</Form.Item>

									<Form.List name="variants" rules={formRules.variants}>
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
															name={[name, "name"]}
															rules={[
																{
																	required: true,
																	message: "Variant name is required",
																},
															]}
														>
															<Input placeholder="Variant name" />
														</Form.Item>
														<Form.Item
															{...restField}
															name={[name, "value"]}
															rules={[
																{
																	required: true,
																	message: "Variant value is required",
																},
															]}
														>
															<Input placeholder="Variant value" />
														</Form.Item>
														<Form.Item
															{...restField}
															name={[name, "price"]}
															rules={[
																{
																	required: true,
																	message: "Price is required",
																},
																{
																	validator: (_, value) => {
																		if (
																			!value ||
																			isNaN(parseFloat(value)) ||
																			parseFloat(value) <= 0
																		) {
																			return Promise.reject(
																				"Price must be a positive number"
																			);
																		}
																		return Promise.resolve();
																	},
																},
															]}
														>
															<InputNumber
																placeholder="Price"
																min={0}
																step={0.01}
															/>
														</Form.Item>
														<Form.Item
															{...restField}
															name={[name, "stock"]}
															rules={[
																{
																	required: true,
																	message: "Stock is required",
																},
																{
																	validator: (_, value) => {
																		if (
																			!value ||
																			isNaN(parseInt(value)) ||
																			parseInt(value) < 0
																		) {
																			return Promise.reject(
																				"Stock must be a non-negative number"
																			);
																		}
																		return Promise.resolve();
																	},
																},
															]}
														>
															<InputNumber
																placeholder="Stock"
																min={0}
																step={1}
															/>
														</Form.Item>
														<MinusCircleOutlined onClick={() => remove(name)} />
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

									<Form.Item name="status" label="Status">
										<Select>
											<Select.Option value="DRAFT">Draft</Select.Option>
											<Select.Option value="PUBLISHED">Published</Select.Option>
										</Select>
									</Form.Item>
								</div>

								<Divider />

								{/* Media Section */}
								<div className="mb-8">
									<Title level={4} className="mb-4">
										<Space>
											<UploadOutlined />
											Media
										</Space>
									</Title>
									<Form.Item
										name="images"
										label="Product Images"
										valuePropName="fileList"
										getValueFromEvent={(e) => {
											if (Array.isArray(e)) {
												return e;
											}
											return e?.fileList;
										}}
									>
										<Upload
											listType="picture-card"
											multiple
											beforeUpload={() => false}
											onChange={({ fileList }) => setFileList(fileList)}
											fileList={fileList}
										>
											{fileList.length >= 8 ? null : (
												<div>
													<PlusOutlined />
													<div style={{ marginTop: 8 }}>Upload</div>
												</div>
											)}
										</Upload>
									</Form.Item>
								</div>

								<Divider />

								{/* YouTube Section */}
								<div className="mb-8">
									<Title level={4} className="mb-4">
										<Space>
											<YoutubeOutlined />
											YouTube
										</Space>
									</Title>

									{/* Add YouTube Profile Section */}
									<div className="mb-6">
										{youtubeConnectionStatus === "connected" ? (
											<div className="flex items-center p-4 bg-gray-50 rounded-lg mb-4">
												{youtubeThumbnail?.thumbnailUrl ? (
													<div className="relative mr-4">
														<Avatar
															size={48}
															src={youtubeThumbnail.thumbnailUrl}
															alt="Channel thumbnail"
														/>
														<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
													</div>
												) : (
													<div className="text-2xl flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mr-4">
														<YoutubeOutlined />
													</div>
												)}
												<div className="flex flex-col">
													<Text strong className="text-lg">
														Connected Account
													</Text>
													<Text className="text-sm text-gray-500">
														{youtubeThumbnail?.channelName || "YouTube Channel"}
													</Text>
													{youtubeData && youtubeData.id && (
														<div className="mt-1">
															<Text className="text-xs text-gray-500">
																ID: {youtubeData.id}
															</Text>
														</div>
													)}
												</div>
											</div>
										) : youtubeConnectionStatus === "loading" ? (
											<div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mb-4">
												<Spin size="small" className="mr-2" />
												<Text>Loading YouTube connection...</Text>
											</div>
										) : youtubeConnectionStatus === "error" ? (
											<div className="flex items-center justify-between p-4 bg-red-50 rounded-lg mb-4">
												<div>
													<Text strong className="block text-red-600">
														Connection Error
													</Text>
													<Text className="text-sm text-red-500">
														{youtubeConnectionError ||
															"Failed to connect to YouTube"}
													</Text>
												</div>
												<Button
													type="primary"
													danger
													onClick={() => {
														// Add reconnect logic here
														window.location.href = `/api/youtube/connect?businessId=${params.id}`;
													}}
												>
													Reconnect
												</Button>
											</div>
										) : (
											<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
												<Text className="text-gray-500">
													Connect your YouTube account to upload videos
												</Text>
												<Button
													type="primary"
													onClick={() => {
														window.location.href = `/api/youtube/connect?businessId=${params.id}`;
													}}
													style={{ backgroundColor: "#FF0000" }}
												>
													Connect YouTube
												</Button>
											</div>
										)}
									</div>

									<Form.Item
										name="youtubeVideo"
										label="Video File"
										rules={formRules.youtubeVideo}
									>
										<Upload
											accept="video/*"
											maxCount={1}
											beforeUpload={() => false}
											onChange={handleVideoUpload}
											fileList={videoFiles[VideoPlatform.YOUTUBE]}
										>
											<Button icon={<UploadOutlined />}>Select Video</Button>
										</Upload>
									</Form.Item>

									<Form.Item
										name="youtubeTitle"
										label="Video Title"
										rules={formRules.youtubeTitle}
									>
										<Input placeholder="Enter video title" />
									</Form.Item>

									<Form.Item
										name="youtubeDescription"
										label="Video Description"
										rules={formRules.youtubeDescription}
									>
										<TextArea placeholder="Enter video description" rows={4} />
									</Form.Item>

									<Form.Item
										name="youtubeTags"
										label="Video Tags"
										rules={formRules.youtubeTags}
									>
										<Input
											placeholder="Enter tags separated by commas (max 5)"
											onChange={(e) => handleTagChange(e.target.value)}
										/>
									</Form.Item>

									<Form.Item
										name="enableScheduling"
										label="Enable Scheduling"
										valuePropName="checked"
										className="mb-4"
									>
										<Row gutter={16} align="middle">
											<Col span={12}>
												<div className="flex items-center justify-between">
													<Text className="text-gray-700">Schedule Video</Text>
													<Switch
														checked={isSchedulingEnabled}
														onChange={(checked) => {
															setIsSchedulingEnabled(checked);
															if (!checked) {
																form.setFieldsValue({ youtubePublishAt: null });
															}
														}}
														className="bg-gray-200"
														checkedChildren="ON"
														unCheckedChildren="OFF"
														style={{
															backgroundColor: isSchedulingEnabled
																? "#3b82f6"
																: "#d1d5db",
															minWidth: "44px",
															height: "24px",
														}}
													/>
												</div>
											</Col>
											<Col span={12}>
												{isSchedulingEnabled && (
													<Form.Item
														name="youtubePublishAt"
														noStyle
														rules={[
															{
																required: true,
																message:
																	"Publish date is required when scheduling is enabled",
															},
															{
																validator: validatePublishDate,
															},
														]}
													>
														<DatePicker
															showTime
															format="YYYY-MM-DD HH:mm:ss"
															placeholder="Select publish date"
															disabledDate={(current) => {
																return (
																	current && current < dayjs().startOf("day")
																);
															}}
															disabledTime={(date) => {
																if (date) {
																	const now = dayjs();
																	const selectedDate = dayjs(date);
																	const isToday = selectedDate.isSame(
																		now,
																		"day"
																	);

																	if (isToday) {
																		const currentHour = now.hour();
																		const currentMinute = now.minute();
																		const minMinute = currentMinute + 10;

																		return {
																			disabledHours: () =>
																				Array.from(
																					{ length: currentHour },
																					(_, i) => i
																				),
																			disabledMinutes: (hour) => {
																				if (hour === currentHour) {
																					return Array.from(
																						{ length: minMinute },
																						(_, i) => i
																					);
																				}
																				return [];
																			},
																		};
																	}
																}
																return {};
															}}
															style={{ width: "100%" }}
															popupClassName="custom-datepicker-popup"
															onChange={(date) => {
																if (date) {
																	form.validateFields(["youtubePublishAt"]);
																}
															}}
														/>
													</Form.Item>
												)}
											</Col>
										</Row>
									</Form.Item>

									<Form.Item
										name="youtubeCategory"
										label="Video Category"
										rules={formRules.youtubeCategory}
									>
										<Select placeholder="Select category">
											<Select.Option value="1">Film & Animation</Select.Option>
											<Select.Option value="2">Autos & Vehicles</Select.Option>
											<Select.Option value="10">Music</Select.Option>
											<Select.Option value="15">Pets & Animals</Select.Option>
											<Select.Option value="17">Sports</Select.Option>
											<Select.Option value="19">Travel & Events</Select.Option>
											<Select.Option value="20">Gaming</Select.Option>
											<Select.Option value="22">People & Blogs</Select.Option>
											<Select.Option value="23">Comedy</Select.Option>
											<Select.Option value="24">Entertainment</Select.Option>
											<Select.Option value="25">News & Politics</Select.Option>
											<Select.Option value="26">Howto & Style</Select.Option>
											<Select.Option value="27">Education</Select.Option>
											<Select.Option value="28">
												Science & Technology
											</Select.Option>
											<Select.Option value="29">
												Nonprofits & Activism
											</Select.Option>
										</Select>
									</Form.Item>

									<Form.Item
										name="youtubeVisibility"
										label="Visibility"
										rules={formRules.youtubeVisibility}
									>
										<Radio.Group>
											<Radio value="private">Private</Radio>
											<Radio value="unlisted">Unlisted</Radio>
											<Radio value="public">Public</Radio>
										</Radio.Group>
									</Form.Item>
								</div>

								<Divider />

								{/* SEO Section */}
								<div className="mb-8">
									<Title level={4} className="mb-4">
										<Space>
											<GlobalOutlined />
											SEO
										</Space>
									</Title>
									<Form.Item
										name={["seo", "title"]}
										label="SEO Title"
										rules={formRules.seo.title}
									>
										<Input placeholder="Enter SEO title" />
									</Form.Item>

									<Form.Item
										name={["seo", "description"]}
										label="SEO Description"
										rules={formRules.seo.description}
									>
										<TextArea placeholder="Enter SEO description" rows={4} />
									</Form.Item>

									<Form.Item
										name={["seo", "keywords"]}
										label="SEO Keywords"
										rules={formRules.seo.keywords}
									>
										<Input
											placeholder="Enter keywords separated by commas"
											onChange={(e) => handleKeywordsChange(e.target.value)}
										/>
									</Form.Item>
								</div>

								<Divider />

								<Form.Item>
									<div className="flex justify-end">
										<Button
											type="primary"
											htmlType="submit"
											loading={isSubmitting}
											className="bg-blue-600 hover:bg-blue-700"
											size="large"
										>
											Create Product
										</Button>
									</div>
								</Form.Item>
							</Form>
						</Card>
					</Col>
					<Col span={8}>
						<PreviewPane
							formData={previewData}
							fileList={fileList}
							videoFiles={{
								[VideoPlatform.YOUTUBE]: formValues?.youtubeVideo
									? [formValues.youtubeVideo as UploadFile]
									: [],
							}}
							selectedPlatforms={selectedPlatforms}
							youtubeData={youtubeDataPreview}
							seoData={seoDataPreview}
						/>
					</Col>
				</Row>

				<Modal
					title="Cancel Upload"
					open={isCancelling}
					onOk={handleCancelConfirm}
					onCancel={handleCancelCancel}
					okText="Yes, Cancel"
					cancelText="No, Continue"
					okButtonProps={{ danger: true }}
				>
					<p>Are you sure you want to cancel the upload?</p>
					<p className="text-gray-500 text-sm">
						This will stop the current upload process. Any completed steps will
						be preserved.
					</p>
				</Modal>
			</div>
		</div>
	);
};

export default NewProductPage;
