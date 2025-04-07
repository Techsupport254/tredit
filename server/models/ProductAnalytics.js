const { Model, DataTypes } = require("sequelize");

class ProductAnalytics extends Model {
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
				},
				views: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				uniqueVisitors: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				addToCart: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				purchases: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				revenue: {
					type: DataTypes.DECIMAL(10, 2),
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				conversionRate: {
					type: DataTypes.FLOAT,
					defaultValue: 0,
					validate: {
						min: 0,
						max: 100,
					},
				},
				averageRating: {
					type: DataTypes.FLOAT,
					defaultValue: 0,
					validate: {
						min: 0,
						max: 5,
					},
				},
				reviewCount: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				searchImpressions: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				searchClicks: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
					validate: {
						min: 0,
					},
				},
				searchClickThroughRate: {
					type: DataTypes.FLOAT,
					defaultValue: 0,
					validate: {
						min: 0,
						max: 100,
					},
				},
				lastUpdated: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
				popularityScore: {
					type: DataTypes.FLOAT,
					defaultValue: 0,
				},
				customMetrics: {
					type: DataTypes.JSONB,
					defaultValue: {},
				},
			},
			{
				sequelize,
				tableName: "ProductAnalytics",
				modelName: "ProductAnalytics",
				timestamps: true,
				indexes: [
					{
						fields: ["productId"],
						unique: true,
					},
					{
						fields: ["popularityScore"],
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

module.exports = ProductAnalytics;
