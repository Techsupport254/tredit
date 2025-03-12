import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BusinessForm from "../../Components/Business/BusinessForm";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import ErrorMessage from "../../Components/Common/ErrorMessage";
import { showSuccessMessage, showErrorNotification } from "../../utils/errors";

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
				showErrorNotification(new Error("Failed to fetch business details"));
				navigate("/businesses");
			}
		} catch (error) {
			console.error("Error fetching business:", error);
			showErrorNotification(error);
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
				showSuccessMessage("Business updated successfully");
				navigate(`/businesses/${data.data.id}`);
			} else {
				const error = await response.json();
				showErrorNotification(
					new Error(error.message || "Failed to update business")
				);
			}
		} catch (error) {
			console.error("Error updating business:", error);
			showErrorNotification(error);
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
