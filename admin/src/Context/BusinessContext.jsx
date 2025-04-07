import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
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
	listings: [],
	listingsLoading: false,
	listingsError: null,
};

export const BusinessContext = createContext(initialState);

export const BusinessProvider = ({ children }) => {
	const { user } = useAuth();
	const storedUser = useMemo(() => getStorageItem(STORAGE_KEYS.USER), []);
	const [state, setState] = useState({
		...initialState,
		listings: [],
		listingsLoading: false,
		listingsError: null,
	});

	// Add effect to set up authorization token for API requests
	useEffect(() => {
		const setupAxiosInterceptors = () => {
			// Get token directly from localStorage for reliability
			const token = localStorage.getItem(STORAGE_KEYS.token);

			if (!token) {
				console.log("BusinessContext: No token found in localStorage");
				return;
			}

			console.log("BusinessContext: Setting up axios interceptors with token");

			// Set default Authorization header
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

			// Add request interceptor
			const interceptorId = axios.interceptors.request.use(
				(config) => {
					// Make sure every request has the token
					if (token && !config.headers.Authorization) {
						config.headers.Authorization = `Bearer ${token}`;
					}
					return config;
				},
				(error) => Promise.reject(error)
			);

			return () => {
				// Clean up interceptor when component unmounts
				axios.interceptors.request.eject(interceptorId);
			};
		};

		return setupAxiosInterceptors();
	}, []);

	const fetchAllBusinesses = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const currentUser = user || storedUser;

			if (!currentUser?.walletAddress) {
				throw new Error("No wallet address found");
			}

			// Ensure token is included in this request
			const token = localStorage.getItem(STORAGE_KEYS.token);
			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			console.log(
				`Fetching businesses for wallet: ${currentUser.walletAddress.substring(
					0,
					10
				)}...`
			);
			const response = await axios.get(
				`/businesses/wallet/${currentUser.walletAddress}`,
				config
			);

			if (response.data?.success) {
				// Even if message is an empty array, it's a successful response
				const businesses = response.data.message || [];
				console.log(`Successfully fetched ${businesses.length} businesses`);

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
				// This is only an error if success is explicitly false
				if (response.data?.success === false) {
					throw new Error(response.data?.data || "Failed to fetch businesses");
				}
				// Otherwise treat it as an empty list
				setState((prev) => ({
					...prev,
					businesses: [],
					isLoading: false,
				}));
				return [];
			}
		} catch (error) {
			console.error("Error fetching businesses:", error.response || error);
			// Update state with empty businesses array rather than null
			setState((prev) => ({
				...prev,
				businesses: [],
				error: error.response?.data?.data || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.data || error.message);
			return [];
		}
	}, [user, storedUser]);

	const fetchBusinessById = useCallback(async (businessId) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			// Validate business ID before making request
			if (!businessId || businessId === "*" || businessId === "undefined") {
				console.error("Invalid business ID:", businessId);
				setState((prev) => ({
					...prev,
					error: "Invalid business ID provided",
					isLoading: false,
				}));
				showErrorNotification("Invalid business ID provided");
				return null;
			}

			// Ensure token is included in this request
			const token = localStorage.getItem(STORAGE_KEYS.token);
			if (!token) {
				console.error("No token found when trying to fetch business by ID");
				setState((prev) => ({
					...prev,
					error: "Authentication token required",
					isLoading: false,
				}));
				showErrorNotification(
					"Authentication required. Please reconnect your wallet."
				);
				return null;
			}

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};

			// Log the request for debugging
			console.log(`Fetching business details for ID: ${businessId}`, {
				hasToken: !!token,
				tokenPreview: token
					? `${token.substring(0, 10)}...${token.substring(token.length - 5)}`
					: null,
			});

			// Make sure axios default headers are set
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

			const response = await axios.get(`/businesses/${businessId}`, config);
			console.log("Business API response:", response.data);

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

				console.log("Business processed successfully:", {
					id: processedBusiness.id,
					name: processedBusiness.name,
					hasTeamMembers: processedBusiness.teamMembers.length > 0,
				});

				setState((prev) => ({
					...prev,
					selectedBusiness: processedBusiness,
					teamMembers: processedBusiness.teamMembers,
					isLoading: false,
				}));
				return processedBusiness;
			} else {
				console.error(
					"API returned success:false for business fetch:",
					response.data
				);
				throw new Error(response.data?.data || "Failed to fetch business");
			}
		} catch (error) {
			console.error("Error fetching business by ID:", error);
			console.error("Error details:", error.response || error);

			if (error.response) {
				console.error("Response error data:", error.response.data);

				if (error.response.status === 401) {
					showErrorNotification(
						"Your session has expired. Please reconnect your wallet."
					);
				} else if (error.response.status === 403) {
					showErrorNotification(
						"You don't have permission to view this business."
					);
				} else if (error.response.status === 404) {
					showErrorNotification("Business not found. The ID may be invalid.");
				} else if (error.response.status === 500) {
					showErrorNotification(
						"Server error encountered. Please try again later."
					);
				} else {
					showErrorNotification(error.response?.data?.data || error.message);
				}
			} else if (error.request) {
				console.error("No response received:", error.request);
				showErrorNotification(
					"No response from server. Please check your connection."
				);
			} else {
				showErrorNotification("Failed to fetch business: " + error.message);
			}

			setState((prev) => ({
				...prev,
				error: error.response?.data?.data || error.message,
				isLoading: false,
			}));
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

				// Log the request payload for debugging
				console.log("Business creation request payload:", {
					...businessData,
					walletAddress: currentUser.walletAddress,
					owner: currentUser.id,
					status: businessData.status || "active",
					verificationStatus: "pending",
					paymentMethods: businessData.paymentMethods || [
						"crypto",
						"bank_transfer",
					],
					currency: businessData.currency || "USD",
				});

				try {
					const response = await axios.post("/businesses", {
						...businessData,
						walletAddress: currentUser.walletAddress,
						owner: currentUser.id,
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
					console.error("Business creation failed with error:", error);
					console.error("Error response:", error.response);
					if (error.response?.data) {
						console.error("Server error details:", error.response.data);
					}

					setState((prev) => ({
						...prev,
						error: error.response?.data?.message || error.message,
						isLoading: false,
					}));

					// Show more specific error message for server errors
					if (error.response?.status === 500) {
						showErrorNotification(
							"The server encountered an internal error. Please try again or contact support."
						);
					} else {
						showErrorNotification(
							error.response?.data?.message || error.message
						);
					}
					throw error;
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

	const addTeamMember = useCallback(
		async (businessId, memberData) => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await axios.post(
					`/team-members/${businessId}/members`,
					memberData
				);

				if (response.data?.success) {
					const updatedBusiness = await fetchBusinessById(businessId);
					showSuccessNotification("Team member added successfully");
					return response.data.data.teamMember;
				} else {
					throw new Error(
						response.data?.message || "Failed to add team member"
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
		[fetchBusinessById]
	);

	const updateTeamMember = useCallback(
		async (businessId, memberId, updateData) => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));
				const response = await axios.put(
					`/team-members/${businessId}/members/${memberId}`,
					updateData
				);

				if (response.data?.success) {
					const updatedBusiness = await fetchBusinessById(businessId);
					showSuccessNotification("Team member updated successfully");
					return response.data.data.teamMember;
				} else {
					throw new Error(
						response.data?.message || "Failed to update team member"
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
		[fetchBusinessById]
	);

	const removeTeamMember = useCallback(
		async (businessId, memberId) => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));

				// Get the team member details first
				const business = await fetchBusinessById(businessId);
				const member = business.teamMembers.find((m) => m.id === memberId);

				// Don't allow removing the owner
				if (member?.role === "owner") {
					throw new Error("Cannot remove the business owner");
				}

				const response = await axios.delete(
					`/team-members/${businessId}/members/${memberId}`
				);

				if (response.data?.success) {
					const updatedBusiness = await fetchBusinessById(businessId);
					showSuccessNotification("Team member removed successfully");
					return true;
				} else {
					throw new Error(
						response.data?.message || "Failed to remove team member"
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
		[fetchBusinessById]
	);

	const fetchBusinessListings = useCallback(
		async (businessId) => {
			try {
				setState((prev) => ({
					...prev,
					listingsLoading: true,
					listingsError: null,
				}));

				// First, get the business to determine its type
				const business = await fetchBusinessById(businessId);
				const isService = business?.type === "service";

				// Fetch either services or products based on business type
				const endpoint = isService
					? `/services/business/${businessId}`
					: `/products/business/${businessId}`;

				const response = await axios.get(endpoint);

				if (response.data?.success) {
					const listings = response.data.data || [];
					setState((prev) => ({
						...prev,
						listings,
						listingsLoading: false,
					}));
					return listings;
				} else {
					throw new Error(
						response.data?.message ||
							`Failed to fetch ${isService ? "services" : "products"}`
					);
				}
			} catch (error) {
				setState((prev) => ({
					...prev,
					listings: [],
					listingsError: error.response?.data?.message || error.message,
					listingsLoading: false,
				}));
				showErrorNotification(error.response?.data?.message || error.message);
				return null;
			}
		},
		[fetchBusinessById]
	);

	const fetchBusinessOrders = useCallback(async (businessId) => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			const response = await axios.get(`/orders/business/${businessId}`);

			if (response.data?.success) {
				return response.data.data;
			} else {
				throw new Error(response.data?.message || "Failed to fetch orders");
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error.response?.data?.message || error.message,
				isLoading: false,
			}));
			showErrorNotification(error.response?.data?.message || error.message);
			return null;
		} finally {
			setState((prev) => ({ ...prev, isLoading: false }));
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
			addTeamMember,
			updateTeamMember,
			removeTeamMember,
			fetchBusinessListings,
			fetchBusinessOrders,
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
			addTeamMember,
			updateTeamMember,
			removeTeamMember,
			fetchBusinessListings,
			fetchBusinessOrders,
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
