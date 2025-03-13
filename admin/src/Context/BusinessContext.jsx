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
import { BUSINESS_CONSTANTS } from "../constants/businessConstants";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_PUBLIC_API_URL;

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
				const businesses = response.data.message || [];
				setState((prev) => ({
					...prev,
					businesses: businesses.map((business) => ({
						...business,
						serviceCategories: business.serviceCategories || [],
						tags: business.tags || [],
						businessHours: business.businessHours || {},
						socialMedia: business.socialMedia || {
							tiktok: { isConnected: false, permissions: [], metadata: {} },
							youtube: { isConnected: false, permissions: [], metadata: {} },
							facebook: { isConnected: false, permissions: [], metadata: {} },
							instagram: { isConnected: false, permissions: [], metadata: {} },
						},
						teamMembers: business.teamMembers || [],
						owner: business.owner || null,
					})),
					isLoading: false,
				}));
				return businesses;
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
				const processedBusiness = {
					...business,
					serviceCategories: business.serviceCategories || [],
					tags: business.tags || [],
					businessHours: business.businessHours || {},
					socialMedia: business.socialMedia || {
						tiktok: { isConnected: false, permissions: [], metadata: {} },
						youtube: { isConnected: false, permissions: [], metadata: {} },
						facebook: { isConnected: false, permissions: [], metadata: {} },
						instagram: { isConnected: false, permissions: [], metadata: {} },
					},
					teamMembers: business.teamMembers || [],
					owner: business.owner || null,
				};

				setState((prev) => ({
					...prev,
					selectedBusiness: processedBusiness,
					teamMembers: processedBusiness.teamMembers,
					isLoading: false,
				}));
				return processedBusiness;
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

	const validateBusinessData = (data) => {
		const errors = {};

		// Name validation
		if (data.name) {
			if (
				data.name.length < BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN ||
				data.name.length > BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX
			) {
				errors.name = `Name must be between ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.NAME_LENGTH.MAX} characters`;
			}
		}

		// Description validation
		if (data.description) {
			if (
				data.description.length <
					BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN ||
				data.description.length >
					BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX
			) {
				errors.description = `Description must be between ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MIN} and ${BUSINESS_CONSTANTS.VALIDATION.DESCRIPTION_LENGTH.MAX} characters`;
			}
		}

		// Email validation
		if (
			data.email &&
			!BUSINESS_CONSTANTS.VALIDATION.EMAIL_REGEX.test(data.email)
		) {
			errors.email = "Invalid email format";
		}

		// Phone validation
		if (
			data.phone &&
			!BUSINESS_CONSTANTS.VALIDATION.PHONE_REGEX.test(data.phone)
		) {
			errors.phone = "Invalid phone number format";
		}

		// Type validation
		if (
			data.type &&
			!Object.values(BUSINESS_CONSTANTS.TYPES).includes(data.type)
		) {
			errors.type = "Invalid business type";
		}

		// Category validation
		if (
			data.category &&
			!BUSINESS_CONSTANTS.CATEGORIES.includes(data.category)
		) {
			errors.category = "Invalid business category";
		}

		// Business model validation
		if (
			data.businessModel &&
			!Object.values(BUSINESS_CONSTANTS.MODELS).includes(data.businessModel)
		) {
			errors.businessModel = "Invalid business model";
		}

		// Operation mode validation
		if (
			data.operationMode &&
			!Object.values(BUSINESS_CONSTANTS.OPERATION_MODES).includes(
				data.operationMode
			)
		) {
			errors.operationMode = "Invalid operation mode";
		}

		// Payment methods validation
		if (data.paymentMethods) {
			const invalidMethods = data.paymentMethods.filter(
				(method) => !BUSINESS_CONSTANTS.PAYMENT_METHODS.includes(method)
			);
			if (invalidMethods.length > 0) {
				errors.paymentMethods = `Invalid payment methods: ${invalidMethods.join(
					", "
				)}`;
			}
		}

		// Currency validation
		if (
			data.currency &&
			!BUSINESS_CONSTANTS.CURRENCIES.includes(data.currency)
		) {
			errors.currency = "Invalid currency";
		}

		// Business hours validation
		if (data.businessHours) {
			Object.entries(data.businessHours).forEach(([day, hours]) => {
				if (!BUSINESS_CONSTANTS.BUSINESS_DAYS.includes(day)) {
					errors.businessHours = errors.businessHours || {};
					errors.businessHours[day] = "Invalid day";
				}
				if (!hours.closed && (!hours.start || !hours.end)) {
					errors.businessHours = errors.businessHours || {};
					errors.businessHours[day] =
						"Start and end times are required when not closed";
				}
			});
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	};

	const updateBusiness = useCallback(async (businessId, updateData) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			// Validate the update data
			const validation = validateBusinessData(updateData);
			if (!validation.isValid) {
				throw new Error(JSON.stringify(validation.errors));
			}

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
			connectYouTube: async (businessId) => {
				console.log("Connecting YouTube");
				try {
					setState((prev) => ({ ...prev, isLoading: true, error: null }));

					// Get the current token
					const token = localStorage.getItem("token");
					if (!token) {
						throw new Error("Authentication token not found");
					}

					// Ensure the token is in the headers
					axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

					const response = await axios.get(`/youtube/auth-url`, {
						params: { businessId },
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.data?.success) {
						window.location.href = response.data.data.authUrl;
						return true;
					} else {
						throw new Error(
							response.data?.message || "Failed to get YouTube auth URL"
						);
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
			},
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
