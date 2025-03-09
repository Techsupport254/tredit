import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BusinessForm from "../../Components/Business/BusinessForm";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import ErrorMessage from "../../Components/Common/ErrorMessage";
import { showSuccess, showError } from "../../utils/notifications";

const EditBusiness = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [business, setBusiness] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchBusiness();
	}, [id]);

	const fetchBusiness = async () => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/businesses/${id}`
			);
			if (response.ok) {
				const data = await response.json();
				setBusiness(data.data);
			} else {
				showError("Failed to fetch business details");
				navigate("/businesses");
			}
		} catch (error) {
			console.error("Error fetching business:", error);
			showError("An error occurred while fetching business details");
			navigate("/businesses");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (formData) => {
		try {
			const response = await fetch(
				`http://localhost:8000/api/businesses/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				const data = await response.json();
				showSuccess("Business updated successfully");
				navigate(`/businesses/${data.data.id}`);
			} else {
				const error = await response.json();
				showError(error.message || "Failed to update business");
			}
		} catch (error) {
			console.error("Error updating business:", error);
			showError("An error occurred while updating the business");
		}
	};

	if (loading) {
		return <LoadingSpinner message="Loading business details..." />;
	}

	if (!business) {
		return <ErrorMessage message="Business not found" />;
	}

	return (
		<BusinessForm business={business} onSubmit={handleSubmit} mode="edit" />
	);
};

export default EditBusiness;
