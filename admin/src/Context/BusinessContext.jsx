import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { getStorageItem, STORAGE_KEYS } from "../utils/storage";
import {
	showErrorNotification,
	showSuccessNotification,
} from "../utils/errors";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_PUBLIC_API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add auth token to requests if available
axios.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

const initialState = {
	businesses: [],
	selectedBusiness: null,
	isLoading: false,
	error: null,
	teamMembers: [],
};

export const BusinessContext = createContext(initialState);

export const BusinessProvider = ({ children }) => {
	const { user } = useAuth();
	const storedUser = useMemo(() => getStorageItem(STORAGE_KEYS.USER), []);
	const [state, setState] = useState(initialState);

	const fetchAllBusinesses = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const currentUser = user || storedUser;

			if (!currentUser?.walletAddress) {
				throw new Error("No wallet address found");
			}

			const response = await axios.get(
				`/businesses/wallet/${currentUser.walletAddress}`
			);

			if (response.data?.success) {
				setState((prev) => ({
					...prev,
					businesses: response.data.message || [],
					isLoading: false,
				}));
				return response.data.message;
			} else {
				throw new Error(response.data?.data || "Failed to fetch businesses");
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				businesses: [],
				error: error.response?.data?.data || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.data || error.message);
			return null;
		}
	}, [user, storedUser]);

	const fetchBusinessById = useCallback(async (businessId) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const response = await axios.get(`/businesses/${businessId}`);

			if (response.data?.success) {
				const business = response.data.message;
				setState((prev) => ({
					...prev,
					selectedBusiness: business,
					teamMembers: business.teamMembers || [],
					isLoading: false,
				}));
				return business;
			} else {
				throw new Error(response.data?.data || "Failed to fetch business");
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error.response?.data?.data || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.data || error.message);
			return null;
		}
	}, []);

	const createBusiness = useCallback(
		async (businessData) => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const currentUser = user || storedUser;

				if (!currentUser?.walletAddress) {
					throw new Error("User not authenticated");
				}

				const requiredFields = [
					"name",
					"description",
					"type",
					"category",
					"businessModel",
					"operationMode",
					"email",
				];

				const missingFields = requiredFields.filter(
					(field) => !businessData[field]
				);
				if (missingFields.length > 0) {
					throw new Error(
						`Missing required fields: ${missingFields.join(", ")}`
					);
				}

				const response = await axios.post("/businesses", {
					...businessData,
					walletAddress: currentUser.walletAddress,
					status: businessData.status || "active",
					verificationStatus: "pending",
					paymentMethods: businessData.paymentMethods || [
						"crypto",
						"bank_transfer",
					],
					currency: businessData.currency || "USD",
				});

				if (response.data?.success) {
					const newBusiness = response.data.message.business;
					setState((prev) => ({
						...prev,
						businesses: [...prev.businesses, newBusiness],
						selectedBusiness: newBusiness,
						isLoading: false,
					}));
					showSuccessNotification("Business created successfully");
					return response.data.message;
				} else {
					throw new Error(
						response.data?.message || "Failed to create business"
					);
				}
			} catch (error) {
				setState((prev) => ({
					...prev,
					error: error.response?.data?.message || error.message,
					isLoading: false,
				}));
				showErrorNotification(error.response?.data?.message || error.message);
				throw error;
			}
		},
		[user, storedUser]
	);

	const updateBusiness = useCallback(async (businessId, updateData) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const response = await axios.patch(
				`/businesses/${businessId}`,
				updateData
			);

			if (response.data?.success) {
				const updatedBusiness = response.data.data.business;
				setState((prev) => ({
					...prev,
					businesses: prev.businesses.map((business) =>
						business.id === businessId ? updatedBusiness : business
					),
					selectedBusiness:
						prev.selectedBusiness?.id === businessId
							? updatedBusiness
							: prev.selectedBusiness,
					isLoading: false,
				}));
				showSuccessNotification("Business updated successfully");
				return updatedBusiness;
			} else {
				throw new Error(response.data?.message || "Failed to update business");
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error.response?.data?.message || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.message || error.message);
			throw error;
		}
	}, []);

	const deleteBusiness = useCallback(async (businessId) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const response = await axios.delete(`/businesses/${businessId}`);

			if (response.data?.success) {
				setState((prev) => ({
					...prev,
					businesses: prev.businesses.filter((b) => b.id !== businessId),
					selectedBusiness:
						prev.selectedBusiness?.id === businessId
							? null
							: prev.selectedBusiness,
					isLoading: false,
				}));
				showSuccessNotification("Business deleted successfully");
				return true;
			} else {
				throw new Error(response.data?.message || "Failed to delete business");
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error.response?.data?.message || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.message || error.message);
			return false;
		}
	}, []);

	const contextValue = useMemo(
		() => ({
			...state,
			createBusiness,
			updateBusiness,
			deleteBusiness,
			fetchAllBusinesses,
			fetchBusinessById,
		}),
		[
			state,
			createBusiness,
			updateBusiness,
			deleteBusiness,
			fetchAllBusinesses,
			fetchBusinessById,
		]
	);

	return (
		<BusinessContext.Provider value={contextValue}>
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
