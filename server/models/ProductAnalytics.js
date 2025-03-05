const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductAnalytics = sequelize.define(
	"ProductAnalytics",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		product_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Products",
				key: "id",
			},
		},
		views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		purchases_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		wishlist_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		cart_additions: { type: DataTypes.INTEGER, defaultValue: 0 },
	},
	{
		indexes: [
			{ fields: ["product_id"] }, // Index for filtering by product
		],
	}
);

module.exports = ProductAnalytics;
