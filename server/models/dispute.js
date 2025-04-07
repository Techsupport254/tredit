const { Model, DataTypes } = require("sequelize");

class Dispute extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		orderId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Orders",
				key: "id",
			},
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Businesses",
				key: "id",
			},
		},
		reason: {
			type: DataTypes.ENUM(
				"damaged_item",
				"wrong_item",
				"missing_item",
				"late_delivery",
				"quality_issue",
				"other"
			),
			allowNull: false,
		},
		pinataCid: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
			defaultValue: "open",
			allowNull: false,
		},
		evidence: {
			type: DataTypes.JSONB,
			defaultValue: [],
			allowNull: false,
		},
		resolution: {
			type: DataTypes.JSONB,
			defaultValue: null,
			allowNull: true,
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {
				blockchainTransactionHash: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			allowNull: false,
		},
	};

	static initModel(sequelize) {
		return super.init(this.schema, {
			sequelize,
			modelName: "Dispute",
			tableName: "disputes",
			timestamps: true,
			indexes: [
				{
					fields: ["userId"],
					name: "disputesUserId",
				},
				{
					fields: ["businessId"],
					name: "disputesBusinessId",
				},
				{
					fields: ["status"],
					name: "disputesStatus",
				},
				{
					fields: ["metadata", "createdAt"],
					name: "disputesMetadataCreatedAt",
				},
			],
		});
	}

	static associate(models) {
		this.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
			constraints: false,
		});
		this.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
			constraints: false,
		});
		this.belongsTo(models.Business, {
			foreignKey: "businessId",
			as: "business",
			constraints: false,
		});
	}
}

module.exports = Dispute;
