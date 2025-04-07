const { Model, DataTypes } = require("sequelize");

class ProductVariant extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		productId: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		sku: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "USD",
			validate: {
				isIn: [["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "KES"]],
			},
		},
		stockQuantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		isInStock: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		color: DataTypes.STRING,
		size: DataTypes.STRING,
		weight: {
			type: DataTypes.FLOAT,
			validate: {
				min: 0,
			},
		},
		dimensions: DataTypes.STRING,
		material: DataTypes.STRING,
		media: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: [],
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		tax: {
			type: DataTypes.JSONB,
			defaultValue: {
				rate: 0,
				exempt: false,
				exemptRegions: [],
			},
		},
		discount: {
			type: DataTypes.JSONB,
			defaultValue: {
				amount: 0,
				type: "fixed",
				startDate: null,
				endDate: null,
				conditions: [],
			},
		},
		availability: {
			type: DataTypes.JSONB,
			defaultValue: {
				startDate: null,
				endDate: null,
				preOrder: false,
				preOrderDays: 0,
				restockDate: null,
				restockNotification: false,
			},
		},
		warranty: {
			type: DataTypes.JSONB,
			defaultValue: {
				period: 0,
				terms: "",
				coverage: [],
				exclusions: [],
				registrationRequired: false,
			},
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {},
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	};

	static initModel(sequelize) {
		return super.init(ProductVariant.schema, {
			sequelize,
			modelName: "ProductVariant",
			tableName: "ProductVariants",
			timestamps: true,
			paranoid: true,
			hooks: {
				beforeSave: async (variant) => {
					// Update isInStock based on stockQuantity
					variant.isInStock = variant.stockQuantity > 0;
				},
			},
			indexes: [
				{
					fields: ["productId"],
				},
				{
					fields: ["sku"],
					unique: true,
				},
				{
					fields: ["isActive"],
				},
				{
					fields: ["isInStock"],
				},
			],
		});
	}

	static associate(models) {
		this.belongsTo(models.Product, {
			foreignKey: "productId",
			as: "product",
		});
	}
}

module.exports = ProductVariant;
