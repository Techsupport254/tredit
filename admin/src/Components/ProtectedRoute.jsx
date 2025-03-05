import { Navigate, useLocation } from "react-router-dom";
import { useAccount } from "../Context/AccountContext";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
	const { walletAddress } = useAccount();
	const location = useLocation();

	if (!walletAddress) {
		// Redirect to connect page while saving the attempted url
		return <Navigate to="/connect" state={{ from: location }} replace />;
	}

	return children;
};

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
