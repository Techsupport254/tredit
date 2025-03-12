import { useNavigate } from "react-router-dom";
import BusinessForm from "../../Components/Business/BusinessForm";
import { showSuccessMessage, showErrorNotification } from "../../utils/errors";

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
				showSuccessMessage("Business created successfully");
				navigate(`/businesses/${data.data.id}`);
			} else {
				showErrorNotification(
					new Error(data.message || "Failed to create business")
				);
			}
		} catch (error) {
			console.error("Error creating business:", error);
			showErrorNotification(error);
		}
	};

	return <BusinessForm onSubmit={handleSubmit} mode="create" />;
};

export default CreateBusiness;
