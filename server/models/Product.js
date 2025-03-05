const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
	"Product",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		short_description: { type: DataTypes.STRING, allowNull: true },
		sku: { type: DataTypes.STRING, allowNull: false, unique: true },
		price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		discounted_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
		currency: {
			type: DataTypes.STRING(3),
			allowNull: false,
			defaultValue: "KES",
		},
		category_id: { type: DataTypes.INTEGER, allowNull: false },
		brand: { type: DataTypes.STRING, allowNull: true },
		stock_quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		is_in_stock: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		weight: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
		dimensions: { type: DataTypes.STRING, allowNull: true },
		material: { type: DataTypes.STRING, allowNull: true },
		color: { type: DataTypes.STRING, allowNull: true },
		size: { type: DataTypes.STRING, allowNull: true },
		tags: { type: DataTypes.JSON, allowNull: true },
		rating: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
		reviews_count: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
		video_url: { type: DataTypes.STRING, allowNull: true }, // YouTube video URL
		image_urls: { type: DataTypes.JSON, allowNull: true }, // Array of image URLs
		video_urls: { type: DataTypes.JSON, allowNull: true }, // Array of additional video URLs
	},
	{
		tableName: "Products",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		indexes: [
			{ fields: ["category_id"] }, // Index for filtering by category
			{ fields: ["brand"] }, // Index for filtering by brand
			{ fields: ["price"] }, // Index for sorting by price
		],
	}
);

module.exports = Product;
