import React, { useState, useContext } from "react";
import {
	Upload,
	Button,
	Card,
	message,
	Alert,
	Checkbox,
	Progress,
	Input,
} from "antd";
import {
	UploadOutlined,
	InboxOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { FaTiktok, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { UploadContext } from "../../Context/UploadContext"; // Import Upload Context

const { Dragger } = Upload;
const { TextArea } = Input;

// ✅ Platforms with authentication (linked)
const linkedPlatforms = ["youtube", "tiktok", "instagram", "facebook"];

const platformIcons = {
	youtube: <FaYoutube className="text-red-500 text-xl" />,
	tiktok: <FaTiktok className="text-black text-xl" />,
	instagram: <FaInstagram className="text-pink-500 text-xl" />,
	facebook: <FaFacebook className="text-blue-600 text-xl" />,
};

const platformLimits = {
	youtube: 500 * 1024 * 1024, // 500MB
	tiktok: 100 * 1024 * 1024, // 100MB
	instagram: 150 * 1024 * 1024, // 150MB
	facebook: 200 * 1024 * 1024, // 200MB
};

const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];
const maxFileSize = 500 * 1024 * 1024; // 500MB max

const NewUpload = () => {
	const { uploadVideo } = useContext(UploadContext); // ✅ Use upload function from context
	const [fileList, setFileList] = useState([]);
	const [selectedPlatforms, setSelectedPlatforms] = useState({});
	const [uploadProgress, setUploadProgress] = useState({});
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState(null);

	// ✅ Handle File Upload (before processing)
	const uploadProps = {
		name: "file",
		multiple: true,
		beforeUpload: (file) => {
			if (!allowedTypes.includes(file.type)) {
				setError("Invalid file type. Only MP4, MOV, AVI, and MKV are allowed.");
				message.error("Invalid format! Only MP4, MOV, AVI, MKV allowed.");
				return false;
			}

			if (file.size > maxFileSize) {
				setError("File size exceeds the 500MB limit.");
				message.error("File is too large! Maximum allowed size is 500MB.");
				return false;
			}

			setError(null);
			const videoURL = URL.createObjectURL(file);
			const video = document.createElement("video");
			video.src = videoURL;

			video.onloadedmetadata = () => {
				setFileList((prevList) => [
					...prevList,
					{
						file,
						name: file.name,
						size: (file.size / 1024 / 1024).toFixed(2) + " MB",
						width: video.videoWidth,
						height: video.videoHeight,
						preview: videoURL,
						platforms: [],
						progress: 0, // Initialize progress at 0%
					},
				]);
			};

			return false;
		},
	};

	// ✅ Handle Platform Selection
	const handlePlatformChange = (fileName, platforms) => {
		setSelectedPlatforms((prev) => ({
			...prev,
			[fileName]: platforms,
		}));
	};

	// ✅ Remove File
	const handleRemove = (fileName) => {
		setFileList((prevList) =>
			prevList.filter((file) => file.name !== fileName)
		);
		setSelectedPlatforms((prev) => {
			const newPlatforms = { ...prev };
			delete newPlatforms[fileName];
			return newPlatforms;
		});
		setUploadProgress((prev) => {
			const newProgress = { ...prev };
			delete newProgress[fileName];
			return newProgress;
		});
	};

	// ✅ Simulate Upload Progress (Frontend Progress)
	const simulateUploadProgress = (fileName) => {
		let progress = 0;
		const interval = setInterval(() => {
			progress += Math.random() * 10 + 5; // Increment randomly (5% - 15%)
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);
			}
			setUploadProgress((prev) => ({
				...prev,
				[fileName]: progress,
			}));
		}, 500);
	};

	// ✅ Upload Handler
	const handleUpload = async () => {
		if (fileList.length === 0) {
			message.warning("Please select at least one file to upload.");
			return;
		}

		if (!title.trim()) {
			message.warning("Please enter a title for the videos.");
			return;
		}

		if (!description.trim()) {
			message.warning("Please enter a description for the videos.");
			return;
		}

		for (const file of fileList) {
			const selectedPlatformsList = selectedPlatforms[file.name];

			if (!selectedPlatformsList || selectedPlatformsList.length === 0) {
				message.warning(`Please select platforms for "${file.name}"`);
				return;
			}

			for (const platform of selectedPlatformsList) {
				if (file.file.size > platformLimits[platform]) {
					message.error(
						`"${file.name}" is too large for ${platform.toUpperCase()}.`
					);
					return;
				}
			}
		}

		message.loading({ content: "Uploading...", key: "upload" });

		// Upload each video using upload function from context
		for (const file of fileList) {
			await uploadVideo(
				file.file,
				title,
				description,
				selectedPlatforms[file.name]
			);
			simulateUploadProgress(file.name);
		}

		setTimeout(() => {
			message.success({ content: "Upload successful!", key: "upload" });
			setFileList([]);
			setSelectedPlatforms({});
			setUploadProgress({});
			setTitle("");
			setDescription("");
		}, 5000);
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<Card title="Upload New Videos" className="shadow-lg rounded-lg">
				{error && (
					<Alert message={error} type="error" className="mb-4" showIcon />
				)}

				{/* Title & Description */}
				<div className="mb-4">
					<h3 className="text-lg font-semibold">Video Details</h3>
					<Input
						placeholder="Enter video title..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mb-2"
					/>
					<TextArea
						rows={3}
						placeholder="Enter video description..."
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Drag and Drop Upload */}
				<Dragger {...uploadProps} className="!p-6">
					<p className="ant-upload-drag-icon">
						<InboxOutlined className="text-5xl text-blue-500" />
					</p>
					<p className="ant-upload-text">Click or drag video files to upload</p>
					<p className="ant-upload-hint">
						Allowed formats: MP4, MOV, AVI, MKV | Max size: 500MB
					</p>
				</Dragger>

				{/* File List & Preview */}
				{fileList.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
						{fileList.map((file) => (
							<Card
								key={file.name}
								className="border border-gray-200 shadow-md rounded-lg"
							>
								<video
									controls
									src={file.preview}
									className="w-full h-40 object-cover rounded-t-lg"
								/>
								<p className="text-sm text-gray-600">
									<strong>Size:</strong> {file.size} |{" "}
									<strong>Dimensions:</strong> {file.width} x {file.height}
								</p>
								<Checkbox.Group
									className="mt-1"
									options={linkedPlatforms.map((platform) => ({
										label: (
											<span className="flex items-center gap-2">
												{platformIcons[platform]} {platform.toUpperCase()}
											</span>
										),
										value: platform,
									}))}
									value={selectedPlatforms[file.name] || []}
									onChange={(values) => handlePlatformChange(file.name, values)}
								/>
								<Button
									icon={<DeleteOutlined />}
									type="text"
									className="absolute top-2 right-2 text-red-500"
									onClick={() => handleRemove(file.name)}
								/>
							</Card>
						))}
					</div>
				)}

				{/* Upload Button */}
				<div className="flex justify-center mt-6">
					<Button
						type="primary"
						icon={<UploadOutlined />}
						size="large"
						onClick={handleUpload}
					>
						Upload Videos
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default NewUpload;
