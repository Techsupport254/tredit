import React, { createContext, useContext } from "react";
import PropTypes from "prop-types"; // Import PropTypes for validation
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { message } from "antd";
// import { useAuth } from "./AuthContext";

// Create Context
export const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
	// Commenting out the contents for now
	/*
	const { user } = useAuth();
	const [uploads, setUploads] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [nextPageToken, setNextPageToken] = useState(null);
	const [uploadProgress, setUploadProgress] = useState({});
	const listRef = useRef(null);

	// Load token and fetch data when user changes
	useEffect(() => {
		if (user?.accessToken) {
			fetchUploads(user.accessToken);
		}
	}, [user?.accessToken]);

	// Fetch uploads from YouTube API (Safely)
	const fetchUploads = async (token, pageToken = "") => {
		if (!token) {
			console.warn("No access token available");
			return;
		}

		pageToken ? setLoadingMore(true) : setLoading(true);

		try {
			const response = await axios.get(
				"https://www.googleapis.com/youtube/v3/search",
				{
					params: {
						part: "snippet",
						forMine: true,
						type: "video",
						maxResults: 12,
						pageToken,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					},
				}
			);

			if (!response.data.items || response.data.items.length === 0) {
				console.warn("No videos found.");
				setUploads([]);
				return;
			}

			const videoIds = response.data.items
				.map((item) => item.id.videoId)
				.join(",");

			// Fetch Video Statistics
			const statsResponse = await axios.get(
				"https://www.googleapis.com/youtube/v3/videos",
				{
					params: {
						part: "snippet,statistics,status,contentDetails",
						id: videoIds,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/json",
					},
				}
			);

			setUploads((prevUploads) => [...statsResponse.data.items]);
			setNextPageToken(response.data.nextPageToken || null);
		} catch (error) {
			message.error(
				"Failed to fetch YouTube videos. Check API token and permissions."
			);
		}

		setLoading(false);
		setLoadingMore(false);
	};

	// Handle Scroll to Load More Videos
	const handleScroll = () => {
		if (listRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = listRef.current;
			if (
				scrollTop + clientHeight >= scrollHeight - 20 &&
				nextPageToken &&
				!loadingMore
			) {
				fetchUploads(user.accessToken, nextPageToken);
			}
		}
	};

	// Upload Video to YouTube
	const uploadVideoToYouTube = async (file, title, description, onProgress) => {
		if (!user.accessToken) {
			message.error("Missing access token for YouTube.");
			return null;
		}

		message.loading({
			content: "Initializing YouTube upload...",
			key: "youtube-upload-init",
		});

		try {
			// Step 1: Get upload URL
			const initiateUpload = await axios.post(
				"https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
				{
					snippet: { title, description, categoryId: "22" },
					status: { privacyStatus: "public" },
				},
				{
					headers: {
						Authorization: `Bearer ${user.accessToken}`,
						"Content-Type": "application/json",
						"X-Upload-Content-Type": file.type,
						"X-Upload-Content-Length": file.size,
					},
				}
			);

			const uploadUrl = initiateUpload.headers.location;
			if (!uploadUrl) {
				message.error("Failed to get upload URL from YouTube.");
				return null;
			}

			// Step 2: Upload Video with Progress
			const uploadResponse = await axios.put(uploadUrl, file, {
				headers: {
					Authorization: `Bearer ${user.accessToken}`,
					"Content-Type": file.type,
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
					onProgress(percentCompleted);
				},
			});

			message.success("Video uploaded to YouTube successfully.");
			return uploadResponse.data;
		} catch (error) {
			message.error("Upload to YouTube failed. Please try again.");
			return null;
		} finally {
			message.destroy("youtube-upload-init");
		}
	};

	// Handle Video Upload
	const uploadVideo = async (file, title, description, platforms) => {
		if (!file || !title.trim() || !description.trim()) {
			message.error("Missing file, title, or description.");
			return;
		}

		for (const platform of platforms) {
			switch (platform) {
				case "youtube": {
					const videoData = await uploadVideoToYouTube(
						file,
						title,
						description,
						(progress) => {
							setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
						}
					);
					if (videoData) setUploads((prev) => [videoData, ...prev]);
					break;
				}
				default:
					message.error(`Unsupported platform: ${platform}`);
			}
		}
	};

	// Unpublish Video
	const unpublishVideo = async (videoId) => {
		try {
			await axios.put(
				`https://www.googleapis.com/youtube/v3/videos?part=status`,
				{
					id: videoId,
					status: { privacyStatus: "private" },
				},
				{ headers: { Authorization: `Bearer ${user.accessToken}` } }
			);
			message.success("Video unpublished successfully.");
			fetchUploads(user.accessToken);
		} catch (error) {
			message.error("Failed to unpublish video.");
		}
	};

	// Delete Video
	const deleteVideo = async (videoId) => {
		try {
			await axios.delete(
				`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
				{ headers: { Authorization: `Bearer ${user.accessToken}` } }
			);
			message.success("Video deleted successfully.");
			setUploads((prev) => prev.filter((video) => video.id !== videoId));
		} catch (error) {
			message.error("Failed to delete video.");
		}
	};

	// Search Filter
	const filteredUploads = uploads.filter((upload) =>
		upload.snippet.title.toLowerCase().includes(searchQuery.toLowerCase())
	);
	*/

	return <UploadContext.Provider value={{}}>{children}</UploadContext.Provider>;
};

// Prop validation for UploadProvider
UploadProvider.propTypes = {
	children: PropTypes.node.isRequired, // Ensure children prop is validated
};

export const useUpload = () => useContext(UploadContext);
