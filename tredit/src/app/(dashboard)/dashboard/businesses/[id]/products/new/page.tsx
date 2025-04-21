"use client";

import { useState, useRef, useEffect } from "react";
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
	Steps,
	Row,
	Col,
	Image,
	Carousel,
	Tag,
	Radio,
	DatePicker,
	Progress,
	Spin,
	Alert,
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
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Video platform types
const VideoPlatform = {
	YOUTUBE: "YOUTUBE",
	TIKTOK: "TIKTOK",
	FACEBOOK: "FACEBOOK",
	INSTAGRAM: "INSTAGRAM",
} as const;

type VideoPlatformType = (typeof VideoPlatform)[keyof typeof VideoPlatform];

interface VideoFileState {
	[key: string]: UploadFile[];
}

interface YouTubeVideoDetails {
	title: string;
	description: string;
	tags: string[];
	visibility: "public" | "private" | "unlisted";
	category: string;
	publishAt: string | null;
}

interface UploadedImage {
	fileName: string;
	ipfsUrl: string;
	gatewayUrl: string;
}

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

// Add ProductStatus type at the top of the file
type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

const NewProductPage = () => {
	const router = useRouter();
	const params = useParams();
	const [form] = Form.useForm();
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedPlatforms, setSelectedPlatforms] = useState<
		VideoPlatformType[]
	>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [videoFiles, setVideoFiles] = useState<VideoFileState>({
		[VideoPlatform.YOUTUBE]: [],
		[VideoPlatform.TIKTOK]: [],
		[VideoPlatform.FACEBOOK]: [],
		[VideoPlatform.INSTAGRAM]: [],
	});
	const [videoPreview, setVideoPreview] = useState<string | null>(null);
	const [youtubeVideo, setYoutubeVideo] = useState<
		File | UploadFile<any> | null
	>(null);
	const [formData, setFormData] = useState<any>({});
	const [uploadProgress, setUploadProgress] = useState({
		images: 0,
		currentImage: 0,
		totalImages: 0,
		youtube: 0,
		ipfs: 0,
		database: 0,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [youtubeConnectionStatus, setYoutubeConnectionStatus] = useState<
		"loading" | "connected" | "not_connected" | "error"
	>("loading");
	const [youtubeConnectionError, setYoutubeConnectionError] = useState<
		string | null
	>(null);
	const [channelInfo, setChannelInfo] = useState<{
		title: string;
		thumbnailUrl: string;
	} | null>(null);

	// Watch form values for preview
	const allFormValues = Form.useWatch([], form);

	// Update formData when values change
	useEffect(() => {
		if (allFormValues) {
			setFormData((prev: Record<string, any>) => ({
				...prev,
				...allFormValues,
			}));
		}
	}, [allFormValues]);

	// Initialize form with default values
	useEffect(() => {
		form.setFieldsValue({
			name: "",
			description: "",
			price: 0,
			stock: 0,
			status: "DRAFT" as ProductStatus,
			variants: [],
			youtubeTitle: "",
			youtubeDescription: "",
			youtubeTags: [],
			youtubeVisibility: "private",
			youtubeCategory: "",
			youtubePublishAt: null,
		});
	}, [form]);

	// Handle next step with data preservation
	const nextStep = async () => {
		try {
			const values = await form.validateFields();
			// Update formData with current step's values
			setFormData((prev: any) => ({ ...prev, ...values }));
			setCurrentStep((prev: number) => prev + 1);
		} catch (error) {
			console.error("Validation failed:", error);
		}
	};

	// Handle previous step with data preservation
	const prevStep = () => {
		const currentValues = form.getFieldsValue();
		// Update formData with current step's values
		setFormData((prev: any) => ({ ...prev, ...currentValues }));
		setCurrentStep((prev: number) => prev - 1);
	};

	// Effect to restore form data when step changes
	useEffect(() => {
		// Set all form fields from formData when step changes
		form.setFieldsValue(formData);
	}, [currentStep, formData, form]);

	// Fix the handleImageUpload function to preserve image data correctly
	const handleImageUpload = async (file: RcFile) => {
		console.log("Image upload triggered for file:", file.name, file.size);

		const isImage = file.type.startsWith("image/");
		if (!isImage) {
			message.error("You can only upload image files!");
			return false;
		}

		// Check for duplicate files by comparing name
		const isDuplicate = fileList.some(
			(existingFile) => existingFile.name === file.name
		);

		if (isDuplicate) {
			console.log("Duplicate image detected:", file.name);
			message.error("This image has already been uploaded!");
			return false;
		}

		try {
			// Create a proper URL for the image
			const objectUrl = URL.createObjectURL(file);
			console.log("Created object URL for preview:", objectUrl);

			// Create a new file entry with the object URL
			const newFile: UploadFile = {
				uid: file.uid,
				name: file.name,
				status: "done",
				url: objectUrl,
				thumbUrl: objectUrl,
				size: file.size,
				type: file.type,
				originFileObj: file,
			};

			// Add to file list
			setFileList((prev) => {
				const notDuplicate = !prev.some((f) => f.uid === newFile.uid);
				console.log(
					`Adding file ${file.name} to fileList:`,
					notDuplicate ? "added" : "skipped duplicate"
				);
				return notDuplicate ? [...prev, newFile] : prev;
			});

			console.log("Image added successfully:", file.name);
		} catch (error) {
			console.error("Error processing image upload:", error);
			message.error("Failed to process image");
		}

		return false;
	};

	// Fix the paste handler with proper file type handling
	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			console.log("Paste event detected with items:", items.length);

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.startsWith("image/")) {
					const clipboardFile = items[i].getAsFile();
					if (clipboardFile) {
						console.log(
							"Pasted image file:",
							clipboardFile.name,
							clipboardFile.type,
							clipboardFile.size
						);

						try {
							// Create a proper object URL
							const objectUrl = URL.createObjectURL(clipboardFile);

							// Generate a unique name for pasted image
							const uniqueName = `pasted-image-${Date.now()}.${
								clipboardFile.type.split("/")[1] || "png"
							}`;

							// Cast as RcFile with the required properties
							const file = new File([clipboardFile], uniqueName, {
								type: clipboardFile.type,
								lastModified: Date.now(),
							}) as RcFile;

							// Manually add uid property required for RcFile
							Object.defineProperty(file, "uid", {
								value: `-${Date.now()}-${i}`,
								writable: false,
							});

							// Create a proper file object
							const pastedFile: UploadFile = {
								uid: file.uid,
								name: uniqueName,
								status: "done",
								url: objectUrl,
								thumbUrl: objectUrl,
								size: file.size,
								type: file.type,
								originFileObj: file,
							};

							console.log(
								"Created pasted file object:",
								pastedFile.name,
								pastedFile.url
							);

							setFileList((prev) => [...prev, pastedFile]);
						} catch (error) {
							console.error("Error processing pasted image:", error);
						}
					}
				}
			}
		};

		document.addEventListener("paste", handlePaste);
		return () => {
			document.removeEventListener("paste", handlePaste);
		};
	}, []);

	// Handle video upload
	const handleVideoUpload = (file: RcFile) => {
		console.log("Video upload triggered", file);

		// Create object URL for video preview
		const objectUrl = URL.createObjectURL(file);
		setVideoPreview(objectUrl);

		// Create a new file object that includes originFileObj
		const newFile = {
			...file,
			name: file.name,
			uid: file.uid,
			status: "done",
			url: objectUrl,
			thumbUrl: objectUrl,
			size: file.size,
			type: file.type,
			originFileObj: file as RcFile,
		} as UploadFile<any>;

		console.log("Created file object with originFileObj:", newFile);
		setYoutubeVideo(newFile);

		// Update videoFiles state to include the YouTube video
		setVideoFiles((prev) => ({
			...prev,
			[VideoPlatform.YOUTUBE]: [newFile],
		}));

		// Update form field
		form.setFieldValue("youtubeVideo", [newFile]);

		return false; // Prevent default upload behavior
	};

	// Handle video removal
	const handleVideoRemove = (platform: VideoPlatformType) => {
		setVideoFiles((prev) => ({
			...prev,
			[platform]: [],
		}));
		form.setFieldValue(`videoFiles_${platform}`, []);
	};

	const handlePlatformChange = (values: VideoPlatformType[]) => {
		setSelectedPlatforms(values);
		form.setFieldsValue({ videoPlatforms: values });
	};

	// YouTube categories
	const youtubeCategories = [
		{ value: "1", label: "Film & Animation" },
		{ value: "2", label: "Autos & Vehicles" },
		{ value: "10", label: "Music" },
		{ value: "15", label: "Pets & Animals" },
		{ value: "17", label: "Sports" },
		{ value: "19", label: "Travel & Events" },
		{ value: "20", label: "Gaming" },
		{ value: "22", label: "People & Blogs" },
		{ value: "23", label: "Comedy" },
		{ value: "24", label: "Entertainment" },
		{ value: "25", label: "News & Politics" },
		{ value: "26", label: "Howto & Style" },
		{ value: "27", label: "Education" },
		{ value: "28", label: "Science & Technology" },
		{ value: "29", label: "Nonprofits & Activism" },
	];

	// Handle tag input
	const handleTagChange = (value: string) => {
		const tags = value
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag)
			.slice(0, 5);
		form.setFieldValue("youtubeTags", tags);
	};

	const PreviewPane = () => {
		const values = formData;
		const tags = form.getFieldValue("youtubeTags") || [];

		// Helper function to get valid image URL
		const getValidImageUrl = (file: UploadFile) => {
			if (file.url) return file.url;
			if (file.thumbUrl) return file.thumbUrl;
			if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
			return "https://placehold.co/600x600/e2e8f0/1e293b?text=Product+Image";
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
															console.error(`Image failed to load:`, file);
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

						{/* YouTube Video Preview */}
						{videoFiles[VideoPlatform.YOUTUBE].length > 0 && (
							<div className="space-y-4">
								<Text strong>YouTube Video</Text>
								<div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
									<video
										src={videoFiles[VideoPlatform.YOUTUBE][0].url}
										controls
										className="w-full h-full object-contain"
									/>
								</div>
								<div className="space-y-2">
									<Text strong>{values.youtubeTitle || "Video Title"}</Text>
									<div className="flex flex-wrap gap-2">
										{tags.map((tag: string, index: number) => (
											<Tag key={index} className="m-0">
												{tag}
											</Tag>
										))}
									</div>
									<Text type="secondary" className="block text-sm">
										{values.youtubeDescription || "No description provided"}
									</Text>
									<Space className="mt-2">
										<Tag
											color={
												values.youtubeVisibility === "public"
													? "green"
													: "orange"
											}
										>
											{values.youtubeVisibility || "draft"}
										</Tag>
										<Tag color="blue">
											{youtubeCategories.find(
												(c) => c.value === values.youtubeCategory
											)?.label || "Uncategorized"}
										</Tag>
									</Space>
									{values.youtubePublishAt && (
										<Text type="secondary" className="block text-sm">
											Scheduled:{" "}
											{dayjs(values.youtubePublishAt).format(
												"MMMM D, YYYY h:mm A"
											)}
										</Text>
									)}
								</div>
							</div>
						)}

						{/* Product Details Preview */}
						<div className="space-y-4">
							<div>
								<Text strong className="text-xl">
									{formData.name || "Product Name"}
								</Text>
								<Text className="block text-lg text-blue-600">
									KES {formData.price?.toLocaleString() || "0.00"}
								</Text>
							</div>

							<div>
								<Text strong>Description</Text>
								<Text className="block text-gray-600">
									{formData.description || "No description provided"}
								</Text>
							</div>

							{/* Video Previews */}
							{selectedPlatforms.length > 0 && (
								<div className="space-y-4">
									<Text strong>Videos</Text>
									{selectedPlatforms.map((platform) => {
										const platformVideos = videoFiles[platform];
										return (
											<div key={platform} className="space-y-2">
												<div className="flex items-center space-x-2">
													<PlatformIcon platform={platform} />
													<Text>{platform}</Text>
												</div>
												<div className="space-y-2">
													{platformVideos.map((video, index) => (
														<div
															key={video.uid}
															className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
														>
															<video
																src={video.url}
																className="object-cover w-full h-full"
																controls
															/>
														</div>
													))}
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
										{formData.variants.map((variant: any, index: number) => (
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
									{formData.stock || 0} units available
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

	// Check YouTube connection on component mount
	useEffect(() => {
		checkYouTubeConnection();
	}, []);

	// Update the checkYouTubeConnection function
	const checkYouTubeConnection = async () => {
		try {
			setYoutubeConnectionStatus("loading");
			setYoutubeConnectionError(null);

			const response = await fetch(
				`/api/youtube?businessId=${params.id}&action=channel`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
					},
				}
			);

			if (!response.ok) {
				if (response.status === 404) {
					setYoutubeConnectionStatus("not_connected");
					return;
				}

				const errorData = await response.json();
				console.error("YouTube connection error:", errorData);
				setYoutubeConnectionStatus("error");
				setYoutubeConnectionError(
					errorData.error || "Failed to check YouTube connection"
				);
				return;
			}

			// If we got here, we have a successful connection
			const channelData = await response.json();
			setYoutubeConnectionStatus("connected");
			setChannelInfo({
				title: channelData.title,
				thumbnailUrl: channelData.thumbnails.default.url,
			});
		} catch (error) {
			console.error("Error checking YouTube connection:", error);
			setYoutubeConnectionStatus("error");
			setYoutubeConnectionError("Network error checking YouTube connection");
		}
	};

	// Update the connectYouTube function
	const connectYouTube = async () => {
		try {
			// Handle YouTube connection
			const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
			const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

			if (!clientId || !redirectUri) {
				message.error("YouTube API configuration is missing");
				return;
			}

			const authUrl =
				`https://accounts.google.com/o/oauth2/v2/auth?` +
				`client_id=${clientId}&` +
				`redirect_uri=${encodeURIComponent(redirectUri)}&` +
				`response_type=code&` +
				`scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly&` +
				`access_type=offline&` +
				`state=${params.id}&` +
				`prompt=consent`;

			window.location.href = authUrl;
		} catch (error) {
			console.error("Error connecting YouTube account:", error);
			message.error("Failed to connect YouTube account");
		}
	};

	// Update the handleSubmit function
	const handleSubmit = async (values: any) => {
		console.log("======== STARTING PRODUCT CREATION ========");
		console.log("Form values:", values);
		console.log("File list:", fileList);
		console.log("YouTube video files:", videoFiles);

		try {
			setIsSubmitting(true);

			// Step 1: Upload images to IPFS
			console.log("Step 1: Uploading images to IPFS");
			setUploadProgress((prev) => ({
				...prev,
				images: 10,
				currentImage: 1,
				totalImages: fileList.length,
			}));

			// Upload each image to IPFS
			const uploadPromises = fileList.map(async (file, index) => {
				if (!file.originFileObj) return null;

				const formData = new FormData();
				formData.append("file", file.originFileObj);

				const response = await fetch("/api/ipfs/upload-file", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to upload image");
				}

				// Update progress for this image
				setUploadProgress((prev) => ({
					...prev,
					currentImage: index + 1,
					images: Math.round(((index + 1) / fileList.length) * 100),
				}));

				const result = await response.json();
				return {
					fileName: file.name,
					ipfsUrl: `ipfs://${result.hash}`,
					gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.hash}`,
				} as UploadedImage;
			});

			const uploadedImages = await Promise.all(uploadPromises);
			const validImages = uploadedImages.filter(
				(img): img is UploadedImage => img !== null
			);
			console.log("Successfully uploaded images:", validImages);
			setUploadProgress((prev) => ({ ...prev, images: 100 }));

			// Step 2: Handle YouTube video upload
			let youtubeVideoId = null;
			if (videoFiles[VideoPlatform.YOUTUBE].length > 0) {
				console.log("Step 2: Uploading YouTube video");
				setUploadProgress((prev) => ({ ...prev, youtube: 10 }));

				// Check YouTube connection status
				if (youtubeConnectionStatus !== "connected") {
					console.warn("YouTube account not connected. Skipping video upload.");
					setUploadProgress((prev) => ({ ...prev, youtube: 100 }));
				} else {
					const youtubeVideo = videoFiles[VideoPlatform.YOUTUBE][0];
					if (youtubeVideo?.originFileObj) {
						try {
							const youtubeFormData = new FormData();
							youtubeFormData.append("businessId", params.id as string);
							youtubeFormData.append("video", youtubeVideo.originFileObj);
							youtubeFormData.append(
								"metadata",
								JSON.stringify({
									title: values.youtubeTitle,
									description: values.youtubeDescription,
									tags: values.youtubeTags || [],
									categoryId: values.youtubeCategory,
									privacyStatus: values.youtubeVisibility,
									publishAt: values.youtubePublishAt,
								})
							);

							const youtubeResponse = await fetch("/api/youtube", {
								method: "POST",
								body: youtubeFormData,
							});

							if (!youtubeResponse.ok) {
								const errorData = await youtubeResponse.json();
								if (errorData.error?.includes("authentication credentials")) {
									setYoutubeConnectionStatus("error");
									setYoutubeConnectionError(
										"YouTube authentication failed. Please reconnect your YouTube account."
									);
									console.warn(
										"YouTube authentication failed. Skipping video upload."
									);
								} else if (errorData.error?.includes("exceeded")) {
									console.warn(
										"YouTube upload quota exceeded. Skipping video upload."
									);
								} else {
									console.warn(
										"YouTube upload failed:",
										errorData.error || "Unknown error"
									);
								}
							} else {
								const youtubeResult = await youtubeResponse.json();
								youtubeVideoId = youtubeResult.videoId;
								console.log(
									"YouTube video uploaded successfully:",
									youtubeVideoId
								);
							}
						} catch (error: any) {
							console.warn("YouTube upload error:", error.message);
							// Continue with product creation even if YouTube upload fails
						}
					}
					setUploadProgress((prev) => ({ ...prev, youtube: 100 }));
				}
			}

			// Step 3: Prepare product data with IPFS hashes
			console.log("Step 3: Preparing product data");
			setUploadProgress((prev) => ({ ...prev, ipfs: 50 }));

			const productData = {
				name: typeof values.name === "string" ? values.name.trim() : "",
				description:
					typeof values.description === "string"
						? values.description.trim()
						: "",
				price: Number(values.price) || 0,
				stock: Number(values.stock) || 0,
				status: typeof values.status === "string" ? values.status : "DRAFT",
				variants: Array.isArray(values.variants)
					? values.variants
							.map((variant: any) => ({
								name:
									typeof variant?.name === "string" ? variant.name.trim() : "",
								value:
									typeof variant?.value === "string"
										? variant.value.trim()
										: "",
								price: Number(variant?.price) || 0,
								stock: Number(variant?.stock) || 0,
							}))
							.filter((variant: any) => variant.name && variant.value)
					: [],
				youtubeVideoId,
				images: validImages.map((img) => ({
					ipfsUrl: img.ipfsUrl,
					gatewayUrl: img.gatewayUrl,
				})),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Upload product metadata to IPFS
			const metadataResponse = await fetch("/api/ipfs/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(productData),
			});

			if (!metadataResponse.ok) {
				const errorData = await metadataResponse.json();
				throw new Error(
					errorData.error || "Failed to upload product metadata to IPFS"
				);
			}

			const { ipfsHash } = await metadataResponse.json();
			console.log("Product metadata uploaded to IPFS successfully:", ipfsHash);
			setUploadProgress((prev) => ({ ...prev, ipfs: 100 }));

			// Step 4: Save to database
			console.log("\n=== INITIATING DATABASE SAVE REQUEST ===");
			console.log("Request URL:", "/api/products/create");
			console.log("Request Method: POST");
			console.log("FormData Contents:", {
				businessId: params.id,
				productData: JSON.stringify({
					...productData,
					ipfsHash,
				}),
				imageCount: fileList.length,
				hasYoutubeVideo: !!youtubeVideo,
			});

			const formData = new FormData();
			formData.append("businessId", params.id as string);
			formData.append(
				"productData",
				JSON.stringify({
					...productData,
					ipfsHash,
				})
			);
			fileList.forEach((file) => {
				if ("originFileObj" in file && file.originFileObj) {
					formData.append("images", file.originFileObj);
				} else if (file instanceof File) {
					formData.append("images", file);
				}
			});
			if (youtubeVideo) {
				if ("originFileObj" in youtubeVideo && youtubeVideo.originFileObj) {
					formData.append("youtubeVideo", youtubeVideo.originFileObj);
				} else if (youtubeVideo instanceof File) {
					formData.append("youtubeVideo", youtubeVideo);
				}
			}

			// Log FormData contents
			console.log("\n=== FORM DATA BEING SENT TO DATABASE ===");
			for (const [key, value] of formData.entries()) {
				if (key === "productData") {
					console.log(`${key}:`, JSON.parse(value as string));
				} else if (value instanceof File) {
					console.log(`${key}:`, {
						name: value.name,
						type: value.type,
						size: value.size,
					});
				} else {
					console.log(`${key}:`, value);
				}
			}
			console.log("=== END FORM DATA ===\n");

			const response = await fetch("/api/products/create", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json().catch((e: Error) => {
					console.error("Failed to parse error response:", e);
					return { error: "Failed to parse error response" };
				});

				console.error("\n=== DATABASE SAVE ERROR ===");
				console.error("Status:", response.status);
				console.error("Error Data:", errorData);
				console.error("Response Text:", await response.text());

				throw new Error(
					errorData.error || "Failed to save product to database"
				);
			}

			const result = await response.json().catch((e: Error) => {
				console.error("Failed to parse success response:", e);
				throw new Error("Failed to parse database response");
			});

			console.log("\n=== DATABASE SAVE SUCCESS ===");
			console.log("Response Data:", result);
			console.log("Product ID:", result.id);
			console.log("Created At:", result.createdAt);
			console.log("Status:", result.status);

			setUploadProgress((prev) => ({ ...prev, database: 100 }));
			message.success("Product created successfully!");
			router.push(`/dashboard/businesses/${params.id}/products` as any);
		} catch (error: any) {
			console.error("Error creating product:", error);
			message.error(error.message || "Failed to create product");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Add test function
	const testDatabaseUpload = async () => {
		try {
			setIsTesting(true);
			console.log("\n=== TESTING DATABASE UPLOAD ===");

			// Minimal test data for database upload
			const testData = {
				name: "Test Product",
				description: "This is a test product for database upload",
				price: 100,
				stock: 10,
				status: "DRAFT" as ProductStatus,
				variants: [],
				images: [],
				ipfsHash: "QmTestHash123",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			console.log("Test Data:", testData);

			const formData = new FormData();
			formData.append("businessId", params.id as string);
			formData.append("productData", JSON.stringify(testData));

			console.log("Sending test data to database...");
			const response = await fetch("/api/products/create", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Database upload failed:", errorData);
				message.error(
					"Test upload failed: " + (errorData.error || "Unknown error")
				);
			} else {
				const result = await response.json();
				console.log("Test upload successful:", result);
				message.success("Test upload completed successfully!");
			}
		} catch (error: any) {
			console.error("Test upload error:", error);
			message.error("Test upload failed: " + error.message);
		} finally {
			setIsTesting(false);
		}
	};

	// Add specific test function for the exact product data
	const testSpecificProductUpload = async () => {
		try {
			setUploadProgress({
				stage: "database",
				progress: 0,
				message: "Preparing test data...",
			});

			const testData = {
				name: "Oraimo FreePods 4 Wireless Earbuds",
				description:
					"Experience immersive sound with Oraimo FreePods 4, equipped with dual mic noise cancellation, intuitive touch controls, and sweat resistance. Whether you're working out or on a Zoom call, these earbuds give you clear, balanced audio all day long.",
				price: 5999,
				stock: 20,
				status: "ACTIVE" as const,
				ipfsHash: "QmayNehGZQDvPsxfSwxtafnv7wPLPVk7ubFs3JxmY2aFEM",
				media: {
					create: [
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmY3zsT9CQ4NZV3ikPzfonKr59HUs1zwGJdEhMviMsy3RV",
							order: 0,
						},
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmQeeNDCzG1DuSDTs5rNBSNxCdL7R3xEjxBLhYXWrPqpD3",
							order: 1,
						},
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmceZXFyyuG15MEPNdXwDSPwUzTFQwepfcH3bTypnhnQfG",
							order: 2,
						},
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmNbovXnDwZ6eaGQmBMjsEafspGEbQ3fJFBn7zPz8icbuD",
							order: 3,
						},
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmYrc4ESpSsRiRqZVCTVxS6sxfx4qWziUxJaBRVq4C4YsM",
							order: 4,
						},
						{
							type: "IMAGE",
							url: "https://gateway.pinata.cloud/ipfs/QmbzWHUFaf3tUDNnhEM4Ed1kERNFieGJFrRSyBb4ENhiZN",
							order: 5,
						},
					],
				},
				variants: {
					create: [
						{
							name: "Color",
							value: "Black",
							price: 5999,
							stock: 20,
						},
					],
				},
				seo: {
					create: {
						title: "Oraimo FreePods 4 Wireless Earbuds",
						description:
							"Experience immersive sound with Oraimo FreePods 4, equipped with dual mic noise cancellation, intuitive touch controls, and sweat resistance. Whether you're working out or on a Zoom call, these earbuds give you clear, balanced audio all day long.",
						keywords: [],
					},
				},
				analytics: {
					create: {
						views: 0,
						purchases: 0,
						revenue: 0,
					},
				},
			};

			const formData = new FormData();
			formData.append("businessId", params.id);
			formData.append("productData", JSON.stringify(testData));

			console.log("Sending test data to database...");
			console.log("Test Data:", JSON.stringify(testData, null, 2));

			const response = await fetch("/api/products/create", {
				method: "PUT",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Test upload error:", errorData);
				throw new Error(errorData.error || "Failed to upload test product");
			}

			const result = await response.json();
			console.log("Test upload successful:", result);
			message.success("Test product uploaded successfully!");
		} catch (error: any) {
			console.error("Test upload failed:", error);
			message.error(error.message || "Failed to upload test product");
		} finally {
			setUploadProgress(null);
		}
	};

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900">
			<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
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
					<Space>
						<Button
							type="primary"
							onClick={testSpecificProductUpload}
							loading={isTesting}
							className="bg-red-600 hover:bg-red-700"
						>
							Test Specific Product Upload
						</Button>
						<Button
							type="primary"
							onClick={testDatabaseUpload}
							loading={isTesting}
							className="bg-green-600 hover:bg-green-700"
						>
							Test Database Upload
						</Button>
					</Space>
				</div>

				<Row gutter={24}>
					<Col span={16}>
						<Card>
							<Form
								form={form}
								layout="vertical"
								onFinish={handleSubmit}
								initialValues={{
									status: "DRAFT" as ProductStatus,
									variants: [],
									youtubeVisibility: "private",
								}}
								preserve={true}
							>
								<div className="space-y-8">
									{/* Basic Information Section */}
									<div>
										<Title level={4} className="!mb-4">
											Basic Information
										</Title>
										<Row gutter={16}>
											<Col span={24}>
												<Form.Item
													name="name"
													label="Product Name"
													rules={[
														{
															required: true,
															message: "Please enter product name!",
														},
													]}
												>
													<Input placeholder="Enter product name" />
												</Form.Item>
											</Col>
											<Col span={24}>
												<Form.Item
													name="description"
													label="Description"
													rules={[
														{
															required: true,
															message: "Please enter product description!",
														},
													]}
												>
													<TextArea
														rows={4}
														placeholder="Enter product description"
													/>
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item
													name="price"
													label="Price"
													rules={[
														{ required: true, message: "Please enter price!" },
													]}
												>
													<InputNumber
														style={{ width: "100%" }}
														min={0}
														step={0.01}
														placeholder="Enter price"
														prefix="KES"
													/>
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item
													name="stock"
													label="Stock"
													rules={[
														{
															required: true,
															message: "Please enter stock quantity!",
														},
													]}
												>
													<InputNumber
														style={{ width: "100%" }}
														min={0}
														placeholder="Enter stock quantity"
													/>
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item
													name="status"
													label="Status"
													rules={[
														{
															required: true,
															message: "Please select a status",
														},
													]}
												>
													<Select>
														<Select.Option value="DRAFT">Draft</Select.Option>
														<Select.Option value="ACTIVE">Active</Select.Option>
														<Select.Option value="INACTIVE">
															Inactive
														</Select.Option>
													</Select>
												</Form.Item>
											</Col>
										</Row>
									</div>

									{/* Product Images Section */}
									<div>
										<div className="flex justify-between items-center mb-4">
											<Title level={4} className="!mb-0">
												Product Images
											</Title>
										</div>
										<Form.Item
											name="images"
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
												fileList={fileList}
												onChange={({ fileList: newFileList }) => {
													console.log(
														"Upload onChange triggered, new fileList length:",
														newFileList.length
													);
													// Process files to ensure they have valid URLs
													const processedFiles = newFileList.map((file) => {
														// Ensure each file has a valid URL
														if (!file.url && file.originFileObj) {
															file.url = URL.createObjectURL(
																file.originFileObj
															);
															file.thumbUrl = file.url;
														}
														return file;
													});

													// Remove duplicates based on uid
													const uniqueFiles = processedFiles.filter(
														(file, index, self) =>
															index ===
															self.findIndex((f) => f.uid === file.uid)
													);

													console.log(
														"After removing duplicates:",
														uniqueFiles.length
													);
													setFileList(uniqueFiles);
												}}
												onPreview={(file) => {
													// When clicking on an image, open it in a new tab
													if (file.url) {
														window.open(file.url, "_blank");
													}
												}}
												beforeUpload={handleImageUpload}
												onRemove={(file) => {
													console.log("Removing file:", file.name);
													// Revoke object URL when removing an image to prevent memory leaks
													if (file.url && file.url.startsWith("blob:")) {
														URL.revokeObjectURL(file.url);
													}
													setFileList((prev) =>
														prev.filter((f) => f.uid !== file.uid)
													);
													return true;
												}}
												customRequest={({ onSuccess }) => onSuccess?.("ok")}
												multiple={true}
											>
												<div>
													<PlusOutlined />
													<div style={{ marginTop: 8 }}>Upload</div>
												</div>
											</Upload>
										</Form.Item>

										<Text type="secondary" className="block mt-2">
											You can also paste images directly (⌘+V or Ctrl+V)
										</Text>
									</div>

									{/* YouTube Video Section */}
									<div>
										<Title level={4} className="!mb-4">
											YouTube Video
										</Title>

										{youtubeConnectionStatus === "loading" && (
											<div className="mb-4">
												<div className="flex items-center space-x-2">
													<Spin size="small" />
													<Text>Checking YouTube connection...</Text>
												</div>
											</div>
										)}

										{youtubeConnectionStatus === "not_connected" && (
											<div className="mb-4">
												<Alert
													type="warning"
													message="YouTube account not connected"
													description={
														<div className="mt-2">
															<Text>
																You need to connect your YouTube account to
																upload videos.
															</Text>
															<Button
																type="primary"
																onClick={connectYouTube}
																className="mt-2 bg-red-600 hover:bg-red-700 border-red-600"
																icon={<YoutubeOutlined />}
															>
																Connect YouTube Account
															</Button>
															{process.env.NODE_ENV === "development" && (
																<Text className="block mt-2 text-xs text-gray-500">
																	Note: In development mode, you can simulate
																	YouTube connection
																</Text>
															)}
														</div>
													}
												/>
											</div>
										)}

										{youtubeConnectionStatus === "error" && (
											<div className="mb-4">
												<Alert
													type="error"
													message="YouTube connection error"
													description={
														<div>
															<p>
																{youtubeConnectionError ||
																	"An error occurred checking your YouTube connection"}
															</p>
															{process.env.NODE_ENV === "development" && (
																<div className="mt-2">
																	<Button
																		onClick={() =>
																			setYoutubeConnectionStatus("connected")
																		}
																		size="small"
																	>
																		Simulate Connected (Development Only)
																	</Button>
																</div>
															)}
														</div>
													}
												/>
											</div>
										)}

										{youtubeConnectionStatus === "connected" && (
											<div className="mb-4">
												<Alert
													type="success"
													message="YouTube account connected"
													description={
														<div className="mt-2">
															{channelInfo ? (
																<div className="flex items-center space-x-3 mt-2 mb-3">
																	<img
																		src={channelInfo.thumbnailUrl}
																		alt={channelInfo.title}
																		className="w-10 h-10 rounded-full"
																	/>
																	<span className="font-medium">
																		{channelInfo.title}
																	</span>
																</div>
															) : null}
															<p>
																Your YouTube account is connected and ready to
																upload videos.
															</p>
															{process.env.NODE_ENV === "development" && (
																<p className="text-xs text-gray-500 mt-1">
																	Note: Using simulated connection in
																	development mode
																</p>
															)}
														</div>
													}
												/>
											</div>
										)}

										<Row gutter={16}>
											<Col span={24}>
												<Form.Item
													name="youtubeVideo"
													label="Video File"
													rules={[
														{
															required: true,
															message: "Please upload a video!",
														},
													]}
												>
													<Upload
														maxCount={1}
														fileList={videoFiles[VideoPlatform.YOUTUBE]}
														onChange={({ fileList }) => {
															if (fileList.length === 0) {
																handleVideoRemove(VideoPlatform.YOUTUBE);
															}
														}}
														beforeUpload={handleVideoUpload}
														onRemove={() =>
															handleVideoRemove(VideoPlatform.YOUTUBE)
														}
														disabled={youtubeConnectionStatus !== "connected"}
													>
														<Button
															icon={<UploadOutlined />}
															disabled={youtubeConnectionStatus !== "connected"}
														>
															Upload Video
														</Button>
													</Upload>
												</Form.Item>
												{youtubeConnectionStatus === "connected" && (
													<Text type="secondary" className="block mt-1">
														Supported formats: MP4, MOV, AVI, WebM (max 2GB)
													</Text>
												)}
											</Col>
											<Col span={24}>
												<Form.Item
													name="youtubeTitle"
													label="Video Title"
													rules={[
														{
															required: true,
															message: "Please enter a title!",
														},
													]}
												>
													<Input
														placeholder="Enter video title"
														maxLength={100}
													/>
												</Form.Item>
											</Col>
											<Col span={24}>
												<Form.Item
													name="youtubeDescription"
													label="Description"
												>
													<TextArea
														rows={4}
														placeholder="Enter video description"
														maxLength={5000}
													/>
												</Form.Item>
											</Col>
											<Col span={24}>
												<Form.Item
													name="youtubeTags"
													label="Tags"
													help="Enter tags separated by commas (max 5 tags)"
												>
													<>
														<Input.TextArea
															placeholder="e.g. tech, review, tutorial"
															onChange={(e) => handleTagChange(e.target.value)}
															style={{ marginBottom: 8 }}
														/>
														<div className="flex flex-wrap gap-2">
															{form
																.getFieldValue("youtubeTags")
																?.map((tag: string, index: number) => (
																	<Tag key={index} className="m-0">
																		{tag}
																	</Tag>
																))}
														</div>
													</>
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item name="youtubeVisibility" label="Visibility">
													<Radio.Group>
														<Space direction="vertical">
															<Radio value="private">
																<Space>
																	<LockOutlined />
																	Private
																	<Text type="secondary">
																		(Only you can view)
																	</Text>
																</Space>
															</Radio>
															<Radio value="unlisted">
																<Space>
																	<LinkOutlined />
																	Unlisted
																	<Text type="secondary">
																		(Anyone with the link can view)
																	</Text>
																</Space>
															</Radio>
															<Radio value="public">
																<Space>
																	<GlobalOutlined />
																	Public
																	<Text type="secondary">
																		(Everyone can view)
																	</Text>
																</Space>
															</Radio>
														</Space>
													</Radio.Group>
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item
													name="youtubeCategory"
													label="Category"
													rules={[
														{
															required: true,
															message: "Please select a category!",
														},
													]}
												>
													<Select
														placeholder="Select a category"
														options={youtubeCategories}
													/>
												</Form.Item>
											</Col>
											<Col span={24}>
												<Form.Item
													name="youtubeSchedule"
													label="Schedule"
													className="mb-0"
												>
													<Switch
														checkedChildren="Scheduled"
														unCheckedChildren="Publish now"
														onChange={(checked) => {
															if (!checked) {
																form.setFieldValue("youtubePublishAt", null);
															}
														}}
													/>
												</Form.Item>
												<Form.Item
													name="youtubePublishAt"
													dependencies={["youtubeSchedule"]}
													className="mb-0 mt-2"
													noStyle
												>
													<DatePicker
														showTime
														className="w-full"
														placeholder="Select publish date and time"
														disabled={!form.getFieldValue("youtubeSchedule")}
														disabledDate={(current) => {
															return (
																current && current < dayjs().startOf("day")
															);
														}}
													/>
												</Form.Item>
											</Col>
										</Row>
									</div>

									{/* Product Variants Section */}
									<div>
										<Title level={4} className="!mb-4">
											Product Variants
										</Title>
										<Form.Item name="variants" label="Variants">
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
																	name={[name, "name"]}
																	rules={[
																		{
																			required: true,
																			message: "Missing variant name",
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
																			message: "Missing variant value",
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
																			message: "Missing variant price",
																		},
																	]}
																>
																	<InputNumber
																		min={0}
																		step={0.01}
																		placeholder="Price"
																	/>
																</Form.Item>
																<Form.Item
																	{...restField}
																	name={[name, "stock"]}
																	rules={[
																		{
																			required: true,
																			message: "Missing variant stock",
																		},
																	]}
																>
																	<InputNumber min={0} placeholder="Stock" />
																</Form.Item>
																<Button
																	type="link"
																	onClick={() => remove(name)}
																>
																	Remove
																</Button>
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
										</Form.Item>
									</div>
								</div>

								<Divider />

								<div className="flex justify-end">
									<Button
										type="primary"
										htmlType="submit"
										className="bg-blue-600 hover:bg-blue-700"
										loading={isSubmitting}
										disabled={isSubmitting}
									>
										{isSubmitting ? "Creating Product..." : "Create Product"}
									</Button>
								</div>

								{isSubmitting && (
									<div className="mt-4 space-y-4">
										<div>
											<Text>
												Uploading Images ({uploadProgress.currentImage}/
												{uploadProgress.totalImages})
											</Text>
											<Progress
												percent={uploadProgress.images}
												status={
													uploadProgress.images === 100 ? "success" : "active"
												}
												strokeColor={{
													from: "#108ee9",
													to: "#87d068",
												}}
											/>
										</div>
										{videoFiles[VideoPlatform.YOUTUBE].length > 0 && (
											<div>
												<Text>Uploading Video to YouTube</Text>
												<Progress
													percent={uploadProgress.youtube}
													status={
														uploadProgress.youtube === 100
															? "success"
															: "active"
													}
													strokeColor={{
														from: "#ff4d4f",
														to: "#ff7a45",
													}}
												/>
											</div>
										)}
										<div>
											<Text>Uploading to IPFS</Text>
											<Progress
												percent={uploadProgress.ipfs}
												status={
													uploadProgress.ipfs === 100 ? "success" : "active"
												}
												strokeColor={{
													from: "#722ed1",
													to: "#2f54eb",
												}}
											/>
										</div>
										<div>
											<Text>Saving Product</Text>
											<Progress
												percent={uploadProgress.database}
												status={
													uploadProgress.database === 100 ? "success" : "active"
												}
												strokeColor={{
													from: "#13c2c2",
													to: "#52c41a",
												}}
											/>
										</div>
									</div>
								)}
							</Form>
						</Card>
					</Col>
					<Col span={8}>
						<PreviewPane />
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default NewProductPage;
