const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductMedia = sequelize.define("ProductMedia", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	productId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "Products",
			key: "id",
		},
	},
	mediaType: {
		type: DataTypes.ENUM("image", "video"),
		allowNull: false,
	},
	mediaUrl: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	platform: {
		type: DataTypes.STRING,
		allowNull: true,
		comment: "Social media platform (e.g., TikTok, Instagram, Facebook)",
	},
	title: {
		type: DataTypes.STRING,
		allowNull: true,
		comment: "Title/caption for the media content",
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true,
		comment: "Description for the media content",
	},
	thumbnailUrl: {
		type: DataTypes.STRING,
		allowNull: true,
		comment: "URL of the thumbnail image for videos",
	},
	socialMediaId: {
		type: DataTypes.STRING,
		allowNull: true,
		comment: "ID of the media on the social platform after upload",
	},
	uploadStatus: {
		type: DataTypes.ENUM("pending", "uploading", "completed", "failed"),
		defaultValue: "pending",
		allowNull: false,
	},
	uploadError: {
		type: DataTypes.TEXT,
		allowNull: true,
		comment: "Error message if upload fails",
	},
	metadata: {
		type: DataTypes.JSON,
		allowNull: true,
		comment: "Additional platform-specific metadata",
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
	updatedAt: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW,
	},
});

module.exports = ProductMedia;
