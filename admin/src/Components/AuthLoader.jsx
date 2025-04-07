import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../Context/AccountContext";
import { Spin } from "antd";

const AuthLoader = () => {
	const navigate = useNavigate();
	const {
		isConnected,
		hasProfile,
		needsProfile,
		isInitialized,
		connectionState,
		userState,
	} = useAccount();

	const lastPathRef = useRef(window.location.pathname);
	const navigationTimeoutRef = useRef(null);

	useEffect(() => {
		// Clear any existing navigation timeouts
		if (navigationTimeoutRef.current) {
			clearTimeout(navigationTimeoutRef.current);
		}

		// Don't navigate until initialization is complete
		if (!isInitialized) {
			return;
		}

		const currentPath = window.location.pathname;

		// Determine target path based on auth state
		let targetPath = currentPath;
		if (isConnected) {
			if (hasProfile && currentPath === "/connect") {
				targetPath = "/dashboard";
			} else if (needsProfile && !currentPath.includes("/profile-setup")) {
				targetPath = "/profile-setup";
			}
		} else if (currentPath !== "/connect" && currentPath !== "/") {
			targetPath = "/connect";
		}

		// Only navigate if the path needs to change
		if (targetPath !== currentPath && targetPath !== lastPathRef.current) {
			lastPathRef.current = targetPath;
			navigationTimeoutRef.current = setTimeout(() => {
				navigate(targetPath);
			}, 100); // Small delay to prevent rapid navigation
		}

		// Cleanup on unmount
		return () => {
			if (navigationTimeoutRef.current) {
				clearTimeout(navigationTimeoutRef.current);
			}
		};
	}, [isConnected, hasProfile, needsProfile, isInitialized, navigate]);

	// Only show loading spinner during initialization
	if (!isInitialized) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Spin size="large" />
			</div>
		);
	}

	return null;
};

export default React.memo(AuthLoader);
