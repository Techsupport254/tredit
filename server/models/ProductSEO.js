const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductSEO = sequelize.define(
	"ProductSEO",
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
		meta_title: { type: DataTypes.STRING, allowNull: true },
		meta_description: { type: DataTypes.TEXT, allowNull: true },
		meta_keywords: { type: DataTypes.JSON, allowNull: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		canonical_url: { type: DataTypes.STRING, allowNull: true },
	},
	{
		indexes: [{ fields: ["product_id"] }],
	}
);

module.exports = ProductSEO;
