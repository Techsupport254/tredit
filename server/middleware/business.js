const { db } = require("../models");
const { Business, BusinessTeamMember } = db;

// UUID validation middleware
const validateUUID = (paramName) => {
	return (req, res, next) => {
		const uuid = req.params[paramName];
		if (
			!uuid ||
			!uuid.match(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			)
		) {
			return res.status(400).json({
				success: false,
				message: `Invalid ${paramName} format`,
				error: `${paramName} must be a valid UUID`,
			});
		}
		next();
	};
};

const checkBusinessOwnership = async (req, res, next) => {
	try {
		const { businessId } = req.params;
		const userId = req.user.id;

		// Check if the business exists
		const business = await Business.findByPk(businessId);
		if (!business) {
			return res.status(404).json({
				success: false,
				message: "Business not found",
			});
		}

		// Check if the user is the owner or a team member with appropriate permissions
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId,
				status: "active",
			},
		});

		if (!teamMember || !["owner", "admin"].includes(teamMember.role)) {
			return res.status(403).json({
				success: false,
				message: "You don't have permission to perform this action",
			});
		}

		// Add business to request object for later use
		req.business = business;
		next();
	} catch (error) {
		console.error("Error checking business ownership:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

/**
 * Middleware to validate business type before allowing product/service creation
 */
const validateBusinessType = async (req, res, next) => {
	try {
		// Look for businessId in both body and params
		const businessId = req.body.businessId || req.params.businessId;

		if (!businessId) {
			return res.status(400).json({
				success: false,
				message: "Business ID is required",
			});
		}

		const business = await Business.findByPk(businessId);

		if (!business) {
			return res.status(404).json({
				success: false,
				message: "Business not found",
			});
		}

		// Check if trying to add a product to a service business
		if (business.type === "service" && req.baseUrl.includes("/products")) {
			return res.status(400).json({
				success: false,
				message: "Cannot add products to a service business",
			});
		}

		// Check if trying to add a service to a product business
		if (business.type === "product" && req.baseUrl.includes("/services")) {
			return res.status(400).json({
				success: false,
				message: "Cannot add services to a product business",
			});
		}

		next();
	} catch (error) {
		console.error("Business type validation error:", error);
		res.status(500).json({
			success: false,
			message: "Error validating business type",
		});
	}
};

module.exports = {
	checkBusinessOwnership,
	validateBusinessType,
	validateUUID,
};
