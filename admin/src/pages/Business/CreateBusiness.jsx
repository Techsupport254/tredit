import { useNavigate } from "react-router-dom";
import BusinessForm from "../../Components/Business/BusinessForm";
import { showSuccess, showError } from "../../utils/notifications";

const CreateBusiness = () => {
	const navigate = useNavigate();

	const handleSubmit = async (formData) => {
		try {
			const response = await fetch("http://localhost:8000/api/businesses", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				showSuccess("Business created successfully");
				navigate(`/businesses/${data.data.id}`);
			} else {
				showError(data.message || "Failed to create business");
			}
		} catch (error) {
			console.error("Error creating business:", error);
			showError(
				"An error occurred while creating the business. Please try again."
			);
		}
	};

	return <BusinessForm onSubmit={handleSubmit} mode="create" />;
};

export default CreateBusiness;
