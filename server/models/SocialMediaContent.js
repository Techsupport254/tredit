const { Model, DataTypes } = require("sequelize");

class SocialMediaContent extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: false,
		},
		serviceId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: false,
		},
		platform: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [["youtube", "facebook", "instagram", "tiktok"]],
			},
		},
		contentType: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [["video", "post", "reel", "story"]],
			},
		},
		contentUrl: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isUrl: true,
			},
		},
		platformPostId: {
			type: DataTypes.STRING,
			comment: "ID of the post/video on the platform",
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: DataTypes.TEXT,
		thumbnailUrl: {
			type: DataTypes.STRING,
			validate: {
				isUrl: true,
			},
		},
		publishedAt: DataTypes.DATE,
		scheduledFor: DataTypes.DATE,
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "draft",
			validate: {
				isIn: [["draft", "scheduled", "published", "failed"]],
			},
		},
		metrics: {
			type: DataTypes.JSONB,
			defaultValue: {
				views: 0,
				likes: 0,
				comments: 0,
				shares: 0,
				engagement: 0,
			},
		},
		platformSettings: {
			type: DataTypes.JSONB,
			defaultValue: {},
			comment: "Platform-specific settings like privacy, targeting, etc.",
		},
		tags: {
			type: DataTypes.JSONB,
			defaultValue: [],
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	};

	static initModel(sequelize) {
		return super.init(this.schema, {
			sequelize,
			modelName: "SocialMediaContent",
			tableName: "SocialMediaContents",
			timestamps: true,
			indexes: [
				{
					fields: ["productId"],
				},
				{
					fields: ["serviceId"],
				},
				{
					fields: ["platform"],
				},
				{
					fields: ["status"],
				},
				{
					fields: ["publishedAt"],
				},
			],
			validate: {
				eitherProductOrService() {
					if (
						(this.productId && this.serviceId) ||
						(!this.productId && !this.serviceId)
					) {
						throw new Error(
							"Content must be associated with either a product or a service, but not both"
						);
					}
				},
			},
		});
	}

	static associate(models) {
		this.belongsTo(models.Product, {
			foreignKey: "productId",
			as: "product",
			constraints: false, // Disable foreign key constraint
		});
		this.belongsTo(models.Service, {
			foreignKey: "serviceId",
			as: "service",
			constraints: false, // Disable foreign key constraint
		});
	}

	// Helper method to update metrics from platform API
	async updateMetrics(newMetrics) {
		this.metrics = {
			...this.metrics,
			...newMetrics,
			lastUpdated: new Date(),
		};
		await this.save();
	}

	// Helper method to schedule content
	async schedule(publishDate) {
		this.scheduledFor = publishDate;
		this.status = "scheduled";
		await this.save();
	}

	// Helper method to mark as published
	async markAsPublished(platformPostId) {
		this.platformPostId = platformPostId;
		this.publishedAt = new Date();
		this.status = "published";
		await this.save();
	}
}

module.exports = SocialMediaContent;
