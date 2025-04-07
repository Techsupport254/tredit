import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyBusinesses = () => {
	const navigate = useNavigate();

	useEffect(() => {
		// Redirect to the business list component
		navigate("/dashboard/businesses", { replace: true });
	}, [navigate]);

	return null; // No need to render anything as we're redirecting
};

export default MyBusinesses;
