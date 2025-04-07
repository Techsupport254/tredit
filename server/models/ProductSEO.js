const { Model, DataTypes } = require("sequelize");

class ProductSEO extends Model {
	static initModel(sequelize) {
		return super.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				productId: {
					type: DataTypes.UUID,
					allowNull: false,
					unique: true,
					references: {
						model: "Products",
						key: "id",
						onUpdate: "CASCADE",
						onDelete: "CASCADE",
					},
				},
				metaTitle: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				metaDescription: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				keywords: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					defaultValue: [],
				},
				canonicalUrl: {
					type: DataTypes.STRING,
					validate: {
						isUrl: true,
					},
				},
				ogTitle: DataTypes.STRING,
				ogDescription: DataTypes.TEXT,
				ogImage: {
					type: DataTypes.STRING,
					validate: {
						isUrl: true,
					},
				},
				structuredData: {
					type: DataTypes.JSONB,
					defaultValue: {},
				},
			},
			{
				sequelize,
				modelName: "ProductSEO",
				tableName: "ProductSEO",
				timestamps: true,
				indexes: [
					{
						fields: ["productId"],
						unique: true,
					},
				],
			}
		);
	}

	static associate(models) {
		this.belongsTo(models.Product, {
			foreignKey: "productId",
			as: "product",
		});
	}
}

module.exports = ProductSEO;
