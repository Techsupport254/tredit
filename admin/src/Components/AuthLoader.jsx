import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccount } from "../Context/AccountContext";
import { useAuth } from "../Context/AuthContext";
import LoadingOverlay from "./LoadingOverlay";

const AuthLoader = ({ children }) => {
	const { walletAddress, loggedInUser, loading: accountLoading } = useAccount();
	const { googleUser, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const [showLoading, setShowLoading] = useState(false);
	const [status, setStatus] = useState({
		checking: true,
		message: "Initializing...",
		stage: "init",
	});

	// Debounced loading state to prevent flicker
	useEffect(() => {
		let timer;
		if (status.checking || accountLoading || authLoading) {
			timer = setTimeout(() => setShowLoading(true), 300);
		} else {
			setShowLoading(false);
		}
		return () => clearTimeout(timer);
	}, [status.checking, accountLoading, authLoading]);

	const checkAuth = useCallback(async () => {
		try {
			// Wait for both account and auth contexts to initialize
			if (accountLoading || authLoading) {
				setStatus({
					checking: true,
					message: "Loading authentication state...",
					stage: "loading",
				});
				return;
			}

			// Check wallet connection
			if (!walletAddress) {
				setStatus({
					checking: false,
					message: "No wallet connected",
					stage: "wallet",
				});
				navigate("/connect", { replace: true });
				return;
			}

			// Check auth token
			const authToken = localStorage.getItem("auth_token");
			if (!authToken) {
				setStatus({
					checking: false,
					message: "No auth token found",
					stage: "token",
				});
				navigate("/connect", { replace: true });
				return;
			}

			// Check Google auth
			if (!googleUser) {
				setStatus({
					checking: false,
					message: "Google authentication required",
					stage: "google",
				});
				navigate("/connect", { replace: true });
				return;
			}

			// Check user profile
			if (!loggedInUser?.email) {
				setStatus({
					checking: false,
					message: "Profile completion required",
					stage: "profile",
				});
				navigate("/create-profile", { replace: true });
				return;
			}

			// All checks passed
			setStatus({
				checking: false,
				message: "Authentication verified",
				stage: "complete",
			});
		} catch (error) {
			console.error("Auth check error:", error);
			setStatus({
				checking: false,
				message: "Authentication error",
				stage: "error",
			});
			navigate("/connect", { replace: true });
		}
	}, [
		walletAddress,
		googleUser,
		loggedInUser,
		accountLoading,
		authLoading,
		navigate,
	]);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Only show loading overlay if showLoading is true
	if (showLoading) {
		return (
			<LoadingOverlay
				message={`${status.message}\n${
					status.stage === "loading"
						? "Please wait while we verify your access..."
						: getStageMessage(status.stage)
				}`}
			/>
		);
	}

	// All checks passed, render children
	return children;
};

// Helper function to get stage-specific messages
const getStageMessage = (stage) => {
	switch (stage) {
		case "init":
			return "Initializing authentication...";
		case "wallet":
			return "Checking wallet connection...";
		case "token":
			return "Verifying authentication token...";
		case "google":
			return "Checking Google authentication...";
		case "profile":
			return "Verifying user profile...";
		case "complete":
			return "Access verified!";
		case "error":
			return "Error verifying access";
		default:
			return "Checking authentication...";
	}
};

export default AuthLoader;
