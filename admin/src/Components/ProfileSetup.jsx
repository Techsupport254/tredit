import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../Context/AccountContext";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";
import {
	Box,
	TextField,
	Button,
	Typography,
	CircularProgress,
	Paper,
	Avatar,
	IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const ProfileSetup = () => {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		bio: "",
		avatar: null,
	});
	const [previewUrl, setPreviewUrl] = useState(null);

	const { walletAddress } = useAccount();
	const { fetchUserProfile } = useAuth();
	const navigate = useNavigate();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({
				...prev,
				avatar: file,
			}));
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("username", formData.username);
			formDataToSend.append("email", formData.email);
			formDataToSend.append("bio", formData.bio);
			if (formData.avatar) {
				formDataToSend.append("avatar", formData.avatar);
			}
			formDataToSend.append("walletAddress", walletAddress);

			await axios.post(`${API_URL}/users/complete-profile`, formDataToSend, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			await fetchUserProfile(); // Refresh user data
			toast.success("Profile setup completed!");
			navigate("/dashboard");
		} catch (error) {
			console.error("Profile setup error:", error);
			toast.error(error.response?.data?.message || "Failed to setup profile");
		} finally {
			setLoading(false);
		}
	};

	if (!walletAddress) {
		navigate("/connect");
		return null;
	}

	return (
		<Box
			sx={{
				maxWidth: 600,
				mx: "auto",
				p: 3,
			}}
		>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h5" component="h1" gutterBottom align="center">
					Complete Your Profile
				</Typography>

				<Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							mb: 3,
						}}
					>
						<Avatar src={previewUrl} sx={{ width: 100, height: 100, mb: 2 }} />
						<input
							accept="image/*"
							style={{ display: "none" }}
							id="avatar-upload"
							type="file"
							onChange={handleAvatarChange}
						/>
						<label htmlFor="avatar-upload">
							<IconButton
								color="primary"
								component="span"
								aria-label="upload avatar"
							>
								<PhotoCamera />
							</IconButton>
						</label>
					</Box>

					<TextField
						fullWidth
						label="Username"
						name="username"
						value={formData.username}
						onChange={handleInputChange}
						margin="normal"
						required
					/>

					<TextField
						fullWidth
						label="Email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleInputChange}
						margin="normal"
						required
					/>

					<TextField
						fullWidth
						label="Bio"
						name="bio"
						multiline
						rows={4}
						value={formData.bio}
						onChange={handleInputChange}
						margin="normal"
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						size="large"
						disabled={loading}
						sx={{ mt: 3 }}
					>
						{loading ? (
							<>
								<CircularProgress size={24} sx={{ mr: 1 }} />
								Setting up...
							</>
						) : (
							"Complete Setup"
						)}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default ProfileSetup;
