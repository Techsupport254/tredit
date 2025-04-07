const { SocialMediaContent, Product, Service } = require("../models");
const { Op } = require("sequelize");

class SocialMediaService {
	// Create new social media content
	static async createContent(data) {
		try {
			const content = await SocialMediaContent.create(data);
			return content;
		} catch (error) {
			throw new Error(
				`Failed to create social media content: ${error.message}`
			);
		}
	}

	// Get content by ID
	static async getContentById(id) {
		try {
			const content = await SocialMediaContent.findByPk(id);
			if (!content) {
				throw new Error("Social media content not found");
			}
			return content;
		} catch (error) {
			throw new Error(`Failed to get social media content: ${error.message}`);
		}
	}

	// Get all content for a product
	static async getProductContent(productId) {
		try {
			const content = await SocialMediaContent.findAll({
				where: { productId, isActive: true },
				order: [["createdAt", "DESC"]],
			});
			return content;
		} catch (error) {
			throw new Error(
				`Failed to get product social media content: ${error.message}`
			);
		}
	}

	// Get all content for a service
	static async getServiceContent(serviceId) {
		try {
			const content = await SocialMediaContent.findAll({
				where: { serviceId, isActive: true },
				order: [["createdAt", "DESC"]],
			});
			return content;
		} catch (error) {
			throw new Error(
				`Failed to get service social media content: ${error.message}`
			);
		}
	}

	// Get content by platform
	static async getContentByPlatform(platform) {
		try {
			const content = await SocialMediaContent.findAll({
				where: { platform, isActive: true },
				order: [["createdAt", "DESC"]],
			});
			return content;
		} catch (error) {
			throw new Error(`Failed to get platform content: ${error.message}`);
		}
	}

	// Update content
	static async updateContent(id, data) {
		try {
			const content = await SocialMediaContent.findByPk(id);
			if (!content) {
				throw new Error("Social media content not found");
			}
			await content.update(data);
			return content;
		} catch (error) {
			throw new Error(
				`Failed to update social media content: ${error.message}`
			);
		}
	}

	// Delete content
	static async deleteContent(id) {
		try {
			const content = await SocialMediaContent.findByPk(id);
			if (!content) {
				throw new Error("Social media content not found");
			}
			await content.update({ isActive: false });
			return true;
		} catch (error) {
			throw new Error(
				`Failed to delete social media content: ${error.message}`
			);
		}
	}

	// Schedule content
	static async scheduleContent(id, publishDate) {
		try {
			const content = await SocialMediaContent.findByPk(id);
			if (!content) {
				throw new Error("Social media content not found");
			}
			await content.schedule(publishDate);
			return content;
		} catch (error) {
			throw new Error(`Failed to schedule content: ${error.message}`);
		}
	}

	// Get scheduled content
	static async getScheduledContent() {
		try {
			const content = await SocialMediaContent.findAll({
				where: {
					status: "scheduled",
					scheduledFor: {
						[Op.gt]: new Date(),
					},
					isActive: true,
				},
				order: [["scheduledFor", "ASC"]],
			});
			return content;
		} catch (error) {
			throw new Error(`Failed to get scheduled content: ${error.message}`);
		}
	}

	// Update metrics
	static async updateMetrics(id, metrics) {
		try {
			const content = await SocialMediaContent.findByPk(id);
			if (!content) {
				throw new Error("Social media content not found");
			}
			await content.updateMetrics(metrics);
			return content;
		} catch (error) {
			throw new Error(`Failed to update metrics: ${error.message}`);
		}
	}

	// Get analytics by platform
	static async getAnalyticsByPlatform(platform, startDate, endDate) {
		try {
			const content = await SocialMediaContent.findAll({
				where: {
					platform,
					isActive: true,
					publishedAt: {
						[Op.between]: [startDate, endDate],
					},
				},
				attributes: [
					"platform",
					[sequelize.fn("SUM", sequelize.col("metrics.views")), "totalViews"],
					[sequelize.fn("SUM", sequelize.col("metrics.likes")), "totalLikes"],
					[
						sequelize.fn("SUM", sequelize.col("metrics.comments")),
						"totalComments",
					],
					[sequelize.fn("SUM", sequelize.col("metrics.shares")), "totalShares"],
				],
				group: ["platform"],
			});
			return content;
		} catch (error) {
			throw new Error(`Failed to get analytics: ${error.message}`);
		}
	}
}

module.exports = SocialMediaService;
