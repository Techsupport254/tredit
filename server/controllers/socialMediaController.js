const SocialMediaService = require("../services/socialMediaService");
const {
	errorResponse,
	successResponse,
	ResponseCodes,
} = require("../utils/responseHelper");

class SocialMediaController {
	// Create new social media content
	static async createContent(req, res) {
		try {
			// Validate required fields
			const { platform, content, type } = req.body;
			if (!platform || !content || !type) {
				return res.status(400).json(
					errorResponse(
						"Missing required fields",
						ResponseCodes.VALIDATION_ERROR,
						{
							details: ["Platform, content, and type are required"],
						}
					)
				);
			}

			const result = await SocialMediaService.createContent(req.body);
			return res
				.status(201)
				.json(successResponse(result, "Content created successfully"));
		} catch (error) {
			console.error("Error creating content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to create content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get content by ID
	static async getContent(req, res) {
		try {
			const content = await SocialMediaService.getContentById(req.params.id);
			if (!content) {
				return res
					.status(404)
					.json(errorResponse("Content not found", ResponseCodes.NOT_FOUND));
			}
			return res
				.status(200)
				.json(successResponse(content, "Content retrieved successfully"));
		} catch (error) {
			console.error("Error fetching content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get all content for a product
	static async getProductContent(req, res) {
		try {
			const content = await SocialMediaService.getProductContent(
				req.params.productId
			);
			return res
				.status(200)
				.json(
					successResponse(content, "Product content retrieved successfully")
				);
		} catch (error) {
			console.error("Error fetching product content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch product content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get all content for a service
	static async getServiceContent(req, res) {
		try {
			const content = await SocialMediaService.getServiceContent(
				req.params.serviceId
			);
			return res
				.status(200)
				.json(
					successResponse(content, "Service content retrieved successfully")
				);
		} catch (error) {
			console.error("Error fetching service content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch service content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get content by platform
	static async getContentByPlatform(req, res) {
		try {
			const content = await SocialMediaService.getContentByPlatform(
				req.params.platform
			);
			return res
				.status(200)
				.json(
					successResponse(content, "Platform content retrieved successfully")
				);
		} catch (error) {
			console.error("Error fetching platform content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch platform content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Update content
	static async updateContent(req, res) {
		try {
			const content = await SocialMediaService.updateContent(
				req.params.id,
				req.body
			);
			return res
				.status(200)
				.json(successResponse(content, "Content updated successfully"));
		} catch (error) {
			console.error("Error updating content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to update content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Delete content
	static async deleteContent(req, res) {
		try {
			await SocialMediaService.deleteContent(req.params.id);
			return res
				.status(200)
				.json(successResponse(null, "Content deleted successfully"));
		} catch (error) {
			console.error("Error deleting content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to delete content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Schedule content
	static async scheduleContent(req, res) {
		try {
			const { publishDate } = req.body;
			if (!publishDate) {
				return res
					.status(400)
					.json(
						errorResponse(
							"Publish date is required",
							ResponseCodes.VALIDATION_ERROR
						)
					);
			}

			const content = await SocialMediaService.scheduleContent(
				req.params.id,
				publishDate
			);
			return res
				.status(200)
				.json(successResponse(content, "Content scheduled successfully"));
		} catch (error) {
			console.error("Error scheduling content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to schedule content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get scheduled content
	static async getScheduledContent(req, res) {
		try {
			const content = await SocialMediaService.getScheduledContent();
			return res
				.status(200)
				.json(
					successResponse(content, "Scheduled content retrieved successfully")
				);
		} catch (error) {
			console.error("Error fetching scheduled content:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch scheduled content",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Update metrics
	static async updateMetrics(req, res) {
		try {
			const { metrics } = req.body;
			if (!metrics) {
				return res
					.status(400)
					.json(
						errorResponse(
							"Metrics data is required",
							ResponseCodes.VALIDATION_ERROR
						)
					);
			}

			const content = await SocialMediaService.updateMetrics(
				req.params.id,
				metrics
			);
			return res
				.status(200)
				.json(successResponse(content, "Metrics updated successfully"));
		} catch (error) {
			console.error("Error updating metrics:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to update metrics",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}

	// Get analytics
	static async getAnalytics(req, res) {
		try {
			const { platform, startDate, endDate } = req.query;
			if (!platform || !startDate || !endDate) {
				return res
					.status(400)
					.json(
						errorResponse(
							"Platform, start date, and end date are required",
							ResponseCodes.VALIDATION_ERROR
						)
					);
			}

			const analytics = await SocialMediaService.getAnalyticsByPlatform(
				platform,
				new Date(startDate),
				new Date(endDate)
			);
			return res
				.status(200)
				.json(successResponse(analytics, "Analytics retrieved successfully"));
		} catch (error) {
			console.error("Error fetching analytics:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Failed to fetch analytics",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}
}

module.exports = SocialMediaController;
