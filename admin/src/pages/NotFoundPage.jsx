import { Button, Result } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
	useAccount,
	CONNECTION_STATES,
	USER_STATES,
} from "../Context/AccountContext";

const NotFoundPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { connectionState, userState } = useAccount();

	// Check if we're in a dashboard path
	const isDashboardPath =
		location.pathname.startsWith("/dashboard") ||
		location.pathname.startsWith("/products") ||
		location.pathname.startsWith("/services");

	// Determine if user is authenticated
	const isAuthenticated =
		connectionState === CONNECTION_STATES.CONNECTED &&
		userState === USER_STATES.HAS_PROFILE;

	// Determine correct homepage based on auth status
	const getHomeLink = () => {
		if (connectionState !== CONNECTION_STATES.CONNECTED) return "/connect";
		if (userState !== USER_STATES.HAS_PROFILE) return "/profile-setup";
		return "/dashboard";
	};

	// Determine button text based on auth status
	const getButtonText = () => {
		if (connectionState !== CONNECTION_STATES.CONNECTED)
			return "Connect Wallet";
		if (userState !== USER_STATES.HAS_PROFILE) return "Complete Profile";
		return "Dashboard Home";
	};

	console.log("404 Page - Auth Status:", {
		connectionState,
		userState,
		isDashboardPath,
		isAuthenticated,
		currentPath: location.pathname,
	});

	return (
		<div className="flex items-center justify-center h-full min-h-[70vh] w-full">
			<Result
				status="404"
				title="404"
				subTitle="Sorry, the page you visited does not exist."
				extra={
					<Button type="primary" onClick={() => navigate(getHomeLink())}>
						{getButtonText()}
					</Button>
				}
			/>
		</div>
	);
};

// Wrapper component to display 404 inside the dashboard layout
export const Dashboard404Page = () => {
	return (
		<div className="flex-1 p-4">
			<NotFoundPage />
		</div>
	);
};

export default NotFoundPage;
