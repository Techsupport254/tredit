import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { notification } from "antd";
import { useAuth } from "./AuthContext";
import { getStorageItem, STORAGE_KEYS } from "../utils/storage";

export const BusinessContext = createContext({
	businesses: [],
	selectedBusiness: null,
	isLoading: false,
	error: null,
});

export const BusinessProvider = ({ children }) => {
	const { user } = useAuth();
	const storedUser = getStorageItem(STORAGE_KEYS.USER);
	const [state, setState] = useState({
		businesses: [],
		selectedBusiness: null,
		isLoading: false,
		error: null,
	});

	// Fetch user's businesses when user changes
	useEffect(() => {
		const currentUser = user || storedUser;
		if (currentUser?.walletAddress) {
			fetchUserBusinesses(currentUser.walletAddress);
		}
	}, [user?.walletAddress]);

	const fetchUserBusinesses = async (walletAddress) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true }));
			const response = await axios.get(`/businesses/user/${walletAddress}`);

			if (response.data?.success) {
				setState((prev) => ({
					...prev,
					businesses: response.data.businesses,
					isLoading: false,
					error: null,
				}));
			}
		} catch (error) {
			console.error("Failed to fetch businesses:", error);
			setState((prev) => ({
				...prev,
				error: "Failed to fetch businesses",
				isLoading: false,
			}));
			notification.error({
				message: "Error",
				description: "Failed to fetch your businesses",
			});
		}
	};

	const createBusiness = async (businessData) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true }));
			const currentUser = user || storedUser;

			// Prepare the business data with owner's wallet address
			const data = {
				...businessData,
				walletAddress: currentUser.walletAddress,
			};

			const response = await axios.post("/businesses", data);

			if (response.data?.success) {
				setState((prev) => ({
					...prev,
					businesses: [...prev.businesses, response.data.business],
					selectedBusiness: response.data.business,
					isLoading: false,
					error: null,
				}));

				notification.success({
					message: "Success",
					description: "Business created successfully!",
				});

				return response.data.business;
			}
		} catch (error) {
			console.error("Failed to create business:", error);
			setState((prev) => ({
				...prev,
				error: "Failed to create business",
				isLoading: false,
			}));
			notification.error({
				message: "Error",
				description:
					error.response?.data?.message || "Failed to create business",
			});
			throw error;
		}
	};

	const updateBusiness = async (businessId, updateData) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true }));
			const response = await axios.patch(
				`/businesses/${businessId}`,
				updateData
			);

			if (response.data?.success) {
				setState((prev) => ({
					...prev,
					businesses: prev.businesses.map((business) =>
						business.id === businessId ? response.data.business : business
					),
					selectedBusiness:
						prev.selectedBusiness?.id === businessId
							? response.data.business
							: prev.selectedBusiness,
					isLoading: false,
					error: null,
				}));

				notification.success({
					message: "Success",
					description: "Business updated successfully!",
				});

				return response.data.business;
			}
		} catch (error) {
			console.error("Failed to update business:", error);
			setState((prev) => ({
				...prev,
				error: "Failed to update business",
				isLoading: false,
			}));
			notification.error({
				message: "Error",
				description:
					error.response?.data?.message || "Failed to update business",
			});
			throw error;
		}
	};

	const selectBusiness = (businessId) => {
		const business = state.businesses.find((b) => b.id === businessId);
		setState((prev) => ({
			...prev,
			selectedBusiness: business || null,
		}));
	};

	const value = {
		...state,
		createBusiness,
		updateBusiness,
		selectBusiness,
		fetchUserBusinesses,
	};

	return (
		<BusinessContext.Provider value={value}>
			{children}
		</BusinessContext.Provider>
	);
};

export const useBusiness = () => {
	const context = useContext(BusinessContext);
	if (!context) {
		throw new Error("useBusiness must be used within a BusinessProvider");
	}
	return context;
};

BusinessProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default BusinessProvider;
