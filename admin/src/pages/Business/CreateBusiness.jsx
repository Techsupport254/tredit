import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Spin, Alert } from "antd";
import BusinessForm from "../../Components/Business/BusinessForm";
import { showErrorNotification } from "../../utils/errors";
import { getStorageItem, STORAGE_KEYS } from "../../utils/storage";
import { useAuth } from "../../Context/AuthContext";
import { useBusiness } from "../../Context/BusinessContext";

const API_URL =
	import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:8000/api";

// For testing - using the token from the example curl
const EXAMPLE_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmM2UzODQ3LTZjODctNGY2NC1iOTRiLTEwZDNlM2MyOWRiZCIsIm5hbWUiOiJWaWN0b3IgUXVhaW50IiwiZW1haWwiOiJraXJ1aXZpY3RvcjA5N0BnbWFpbC5jb20iLCJ3YWxsZXRBZGRyZXNzIjoiMHhlOTEzODhBNDM2NjU5ZjJjMGI0MkJDZWE2ZjdhOUI3MDA0RjJmMjY1IiwiYmxvY2tjaGFpblR4SGFzaCI6IjB4MjU1MTU4NGMzY2NkYjBkNDlkMzUwY2MxNzc5NGZjZDkwMGI0ZjdhZjlkZDA1YWViNDJlNGMwZGYyN2FlZmRhYyIsImlwZnNVcmwiOiJodHRwczovL2dhdGV3YXkucGluYXRhLmNsb3VkL2lwZnMvYmFma3JlaWdkdmVwamZ5cGllc3Y0ZXN0bG9hdGdwNm4ycmRpa3E1YXMzZ3c0cDd3ZXdleGZxbzYzcTQiLCJhY2NlcHRCbG9ja2NoYWluU3RvcmFnZSI6dHJ1ZSwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2N5VmJpc0ZYOWRERk9GSXdwODhLQlZRUlc4Xzc4RjJFWFpjcjV6bmpoUG90N0pGeVI9czY0LWMiLCJnZW5kZXIiOiJtYWxlIiwiZG9iIjoiMjAwMi0wOC0wOCIsInBob25lTnVtYmVyIjoiMjU0NzE2NDA0MTM3IiwibG9jYXRpb24iOiJLaWxpbWFuaSwgS2lsaW1hbmkgZGl2aXNpb24sIFdlc3RsYW5kcywgTmFpcm9iaSwgTmFpcm9iaSBDb3VudHksIDQ0ODQ3LCBLZW55YSIsImJpbyI6IlNhc2FUZWNoIEFmcmljYSAtIEJ1aWxkaW5nIHRoZSBmdXR1cmUgb2YgV2ViMyIsInByZWZlcmVuY2VzIjp7InRoZW1lIjoiZGFyayIsImxhbmd1YWdlIjoiZW4iLCJub3RpZmljYXRpb25zIjp7InB1c2giOnRydWUsImVtYWlsIjp0cnVlLCJtYXJrZXRpbmciOmZhbHNlfX0sImxhc3RMb2dpbiI6bnVsbCwic3RhdHVzIjoiYWN0aXZlIiwicm9sZSI6InVzZXIiLCJtZXRhZGF0YSI6eyJidXNpbmVzc2VzIjpbeyJpZCI6IjM5ZTBkNWY3LWJlMmEtNGY2Ny04YjE3LTcxZTk2YTNjYTliMyIsIm5hbWUiOiJUZWNoIEdhZGdldHMgU3RvcmUiLCJyb2xlIjoib3duZXIiLCJqb2luZWRBdCI6IjIwMjUtMDMtMTdUMTY6MjA6NTAuMTExWiIsInBlcm1pc3Npb25zIjp7ImFsbCI6dHJ1ZSwibWFuYWdlVGVhbSI6dHJ1ZSwibWFuYWdlQ29udGVudCI6dHJ1ZSwidmlld0FuYWx5dGljcyI6dHJ1ZSwibWFuYWdlRmluYW5jZXMiOnRydWUsIm1hbmFnZVByb2R1Y3RzIjp0cnVlLCJtYW5hZ2VTZXJ2aWNlcyI6dHJ1ZSwibWFuYWdlU2V0dGluZ3MiOnRydWV9fSx7ImlkIjoiMGI0ZjFlMjctMzE3My00NWQzLTliNTMtNjViZmRjNzAyMjMyIiwibmFtZSI6IkRpZ2l0YWwgU29sdXRpb25zIEFnZW5jeSIsInJvbGUiOiJvd25lciIsImpvaW5lZEF0IjoiMjAyNS0wMy0yMVQxODo0Mjo1OS42MTRaIiwicGVybWlzc2lvbnMiOnsiYWxsIjp0cnVlLCJtYW5hZ2VUZWFtIjp0cnVlLCJtYW5hZ2VDb250ZW50Ijp0cnVlLCJ2aWV3QW5hbHl0aWNzIjp0cnVlLCJtYW5hZ2VGaW5hbmNlcyI6dHJ1ZSwibWFuYWdlUHJvZHVjdHMiOnRydWUsIm1hbmFnZVNlcnZpY2VzIjp0cnVlLCJtYW5hZ2VTZXR0aW5ncyI6dHJ1ZX19XSwibGFzdElQRlNVcGRhdGUiOiIyMDI1LTAzLTIwVDEwOjE0OjE3LjY3OVoifSwiY3JlYXRlZEF0IjoiMjAyNS0wMy0xN1QxNjoxNjo0OS41MTVaIiwidXBkYXRlZEF0IjoiMjAyNS0wMy0yMVQxODo0Mjo1OS42MTRaIiwiaWF0IjoxNzQyODE1ODUwLCJleHAiOjE3NDU0MDc4NTB9.lLuNyihVVhB7Z1wRJnpqU4BBE7dkzIDGDVST7E5vOsY";

/**
 * Logs API request details and response for debugging
 * @param {Object} options - Request options
 * @param {string} options.url - API endpoint URL
 * @param {string} options.method - HTTP method
 * @param {Object} options.headers - Request headers
 * @param {Object} options.body - Request body
 * @returns {Promise<Object>} - Response data
 */
const logAPIRequest = async ({ url, method, headers, body }) => {
	console.group("🔄 API Request");
	console.log(`URL: ${url}`);
	console.log(`Method: ${method}`);
	console.log("Headers:", headers);
	console.log("Request Body:", body);
	console.groupEnd();

	try {
		const response = await fetch(url, {
			method,
			headers,
			body: JSON.stringify(body),
		});

		const statusCode = response.status;
		let responseData;

		try {
			responseData = await response.json();
		} catch (error) {
			responseData = { error: "Could not parse response JSON" };
		}

		console.group("✅ API Response");
		console.log(`Status: ${statusCode}`);
		console.log("Response Data:", responseData);
		console.groupEnd();

		if (!response.ok) {
			let errorMsg = "An error occurred while processing your request";

			if (responseData.message) {
				errorMsg = responseData.message;
			} else if (responseData.error) {
				errorMsg = responseData.error;
			} else if (Array.isArray(responseData.errors)) {
				errorMsg = responseData.errors.map((err) => err.message).join(", ");
			}

			const error = new Error(errorMsg);
			error.status = statusCode;
			error.response = responseData;
			throw error;
		}

		return responseData;
	} catch (error) {
		console.group("❌ API Error");
		console.error("Error Details:", error);
		console.error("Status:", error.status);
		console.error("Response:", error.response);
		console.groupEnd();
		throw error;
	}
};

const CreateBusiness = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { createBusiness } = useBusiness();
	const { currentUser, token } = useAuth();

	// Helper to ensure data is exactly formatted for the server
	const formatBusinessData = (formData) => {
		// Make sure we use the exact keys expected by the server
		return {
			...formData,
			// Address must be a JSONB object with all required fields
			address: {
				street: formData.address?.street || "",
				city: formData.address?.city || "",
				state: formData.address?.state || "",
				country: formData.address?.country || "",
				postalCode: formData.address?.postalCode || "",
			},
			// Ensure type is lowercase and exactly matches enum
			type: formData.type?.toLowerCase(),
			// Service or product categories based on type
			productCategories:
				formData.type === "product"
					? formData.productCategories || ["Electronics"]
					: [],
			serviceCategories:
				formData.type === "service" ? formData.serviceCategories || [] : [],
			// Operation mode must match the enum exactly
			operationMode: formData.operationMode?.toLowerCase(),
			// Business model must match exactly
			businessModel: formData.businessModel,
			// Status must match enum
			status: "active",
			// User ID for ownership
			userId: currentUser?.id,
			// Currency must be in supported list
			currency: formData.currency || "USD",
			// Make sure wallet address matches the format expected
			walletAddress:
				currentUser?.walletAddress ||
				"0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			// Payment methods array must contain valid methods
			paymentMethods: formData.paymentMethods || ["crypto", "bank_transfer"],
		};
	};

	const handleSubmit = async (formData) => {
		setLoading(true);
		setError(null);

		try {
			console.log("Form data received:", formData);

			// Format data correctly for the server
			const businessData = formatBusinessData(formData);
			console.log("Submitting to business context:", businessData);

			// Use context method which handles notifications internally
			const result = await createBusiness(businessData);
			console.log("Business created successfully:", result);

			// Navigate to the business page using the ID from the response
			if (result && result.business && result.business.id) {
				navigate(`/dashboard/businesses/${result.business.id}`);
			} else if (result && result.id) {
				navigate(`/dashboard/businesses/${result.id}`);
			} else {
				// Fallback to businesses list
				navigate("/dashboard/businesses");
			}
		} catch (error) {
			console.error("Error creating business:", error);

			// Show a more user-friendly error based on the error message
			let errorMessage = "Failed to create business. Please try again.";

			// Parse specific validation errors if available
			if (
				error.message &&
				error.message.includes("Invalid service category:")
			) {
				errorMessage =
					"One or more selected service categories are invalid. Please check your selection.";
			} else if (
				error.message &&
				error.message.includes("Invalid product category:")
			) {
				errorMessage =
					"One or more selected product categories are invalid. Please check your selection.";
			} else if (
				error.message &&
				error.message.includes("Invalid operation mode:")
			) {
				errorMessage =
					"The selected operation mode is invalid. Please select digital, physical, or hybrid.";
			} else if (
				error.message &&
				error.message.includes("Invalid business model:")
			) {
				errorMessage =
					"The selected business model is invalid. Please select B2B, B2C, C2C, or B2B2C.";
			} else if (error.message && error.message.includes("Invalid category:")) {
				errorMessage =
					"The selected business category is invalid. Please choose from the available options.";
			} else if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.message) {
				errorMessage = error.message;
			}

			setError(errorMessage);
			showErrorNotification(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "20px" }}>
			{error && (
				<Alert
					message="Error Creating Business"
					description={error}
					type="error"
					showIcon
					style={{ marginBottom: "20px" }}
					closable
					onClose={() => setError(null)}
				/>
			)}

			<BusinessForm onSubmit={handleSubmit} mode="create" />
		</div>
	);
};

export default CreateBusiness;
