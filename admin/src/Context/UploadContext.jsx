import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";

// Create Context
export const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
	const [uploads, setUploads] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [accessToken, setAccessToken] = useState(null);
	const [nextPageToken, setNextPageToken] = useState(null);
	const [uploadProgress, setUploadProgress] = useState({});
	const listRef = useRef(null);

	// ✅ Load stored access token and fetch data
	useEffect(() => {
		const storedToken = localStorage.getItem("youtubeToken");
		if (storedToken) {
			setAccessToken(storedToken);
			setTimeout(() => fetchUploads(storedToken), 2000); // Prevents premature calls
		}
	}, []);

	// ✅ Refresh Access Token if Expired
	const refreshAccessToken = async () => {
		try {
			console.log("Refreshing access token...");
			const storedUser = JSON.parse(localStorage.getItem("youtubeUser"));
			if (!storedUser || !storedUser.stsTokenManager) return null;

			const refreshToken = storedUser.stsTokenManager.refreshToken;
			const response = await axios.post(
				`https://securetoken.googleapis.com/v1/token?key=YOUR_FIREBASE_API_KEY`,
				{
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}
			);

			if (response.data.access_token) {
				localStorage.setItem("youtubeToken", response.data.access_token);
				setAccessToken(response.data.access_token);
				return response.data.access_token;
			}
		} catch (error) {
			console.error("Error refreshing access token:", error);
			return null;
		}
	};

	// ✅ Fetch uploads from YouTube API (Safely)
	const fetchUploads = async (token, pageToken = "") => {
		if (!token) return;
		pageToken ? setLoadingMore(true) : setLoading(true);

		try {
			console.log("Fetching YouTube videos...");
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

			// ✅ Fetch Video Statistics
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
			console.error("Error fetching uploads:", error);
			message.error(
				"Failed to fetch YouTube videos. Check API token and permissions."
			);
		}

		setLoading(false);
		setLoadingMore(false);
	};

	// ✅ Handle Scroll to Load More Videos
	const handleScroll = () => {
		if (listRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = listRef.current;
			if (
				scrollTop + clientHeight >= scrollHeight - 20 &&
				nextPageToken &&
				!loadingMore
			) {
				fetchUploads(accessToken, nextPageToken);
			}
		}
	};

	// ✅ Upload Video to YouTube
	const uploadVideoToYouTube = async (file, title, description, onProgress) => {
		if (!accessToken) {
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
						Authorization: `Bearer ${accessToken}`,
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
					Authorization: `Bearer ${accessToken}`,
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
			console.error("YouTube upload error:", error);
			message.error("Upload to YouTube failed. Please try again.");
			return null;
		} finally {
			message.destroy("youtube-upload-init");
		}
	};

	// ✅ Handle Video Upload
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

	// ✅ Unpublish Video
	const unpublishVideo = async (videoId) => {
		try {
			await axios.put(
				`https://www.googleapis.com/youtube/v3/videos?part=status`,
				{
					id: videoId,
					status: { privacyStatus: "private" },
				},
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			message.success("Video unpublished successfully.");
			fetchUploads(accessToken);
		} catch (error) {
			message.error("Failed to unpublish video.");
		}
	};

	// ✅ Delete Video
	const deleteVideo = async (videoId) => {
		try {
			await axios.delete(
				`https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			);
			message.success("Video deleted successfully.");
			setUploads((prev) => prev.filter((video) => video.id !== videoId));
		} catch (error) {
			message.error("Failed to delete video.");
		}
	};

	// ✅ Search Filter
	const filteredUploads = uploads.filter((upload) =>
		upload.snippet.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

    console.log("uploads", uploads);
    console.log("filteredUploads", filteredUploads);

	return (
		<UploadContext.Provider
			value={{
				uploads,
				loading,
				loadingMore,
				searchQuery,
				setSearchQuery,
				listRef,
				handleScroll,
				filteredUploads,
				uploadVideo,
				unpublishVideo,
				deleteVideo,
				uploadProgress,
			}}
		>
			{children}
		</UploadContext.Provider>
	);
};
