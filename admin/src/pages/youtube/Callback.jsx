import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useBusiness } from "../../Context/BusinessContext";

const YouTubeCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { fetchBusinessById } = useBusiness();

	useEffect(() => {
		const handleCallback = async () => {
			const code = searchParams.get("code");
			const state = searchParams.get("state"); // This is our businessId
			const youtube = searchParams.get("youtube");
			const errorMessage = searchParams.get("message");

			if (youtube === "error") {
				message.error(
					decodeURIComponent(errorMessage) ||
						"Failed to connect YouTube account"
				);
				navigate(`/businesses/${state}`);
				return;
			}

			if (youtube === "connected") {
				// Refresh business data to get updated social media info
				await fetchBusinessById(state);
				message.success("YouTube account connected successfully");
				navigate(`/businesses/${state}`);
				return;
			}

			if (!code || !state) {
				message.error("Missing required parameters");
				navigate(`/businesses/${state}`);
				return;
			}

			try {
				// Get JWT token from localStorage
				const token = localStorage.getItem("auth_token");
				if (!token) {
					throw new Error("Authentication token not found");
				}

				// Call the backend to handle the OAuth callback with authorization header
				await axios.get(`/youtube/callback`, {
					params: { code, state },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				// The backend will redirect to this component with youtube=connected
			} catch (error) {
				console.error("YouTube callback error:", error);
				message.error(
					error.response?.data?.message || "Failed to connect YouTube account"
				);
				navigate(`/businesses/${state}?youtube=error`);
			}
		};

		handleCallback();
	}, [searchParams, navigate, fetchBusinessById]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h1 className="text-2xl font-semibold mb-4">
					Connecting YouTube Account
				</h1>
				<p className="text-gray-600">
					Please wait while we complete the connection...
				</p>
			</div>
		</div>
	);
};

export default YouTubeCallback;
