const { Model, DataTypes } = require("sequelize");

class WhatsAppConfig extends Model {
	static initModel(sequelize) {
		WhatsAppConfig.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				businessId: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: "Businesses",
						key: "id",
					},
				},
				phoneNumberId: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				accessToken: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				phoneNumber: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				displayName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				businessProfileId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				status: {
					type: DataTypes.ENUM("active", "inactive", "pending"),
					defaultValue: "pending",
				},
				webhookUrl: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				webhookSecret: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: "WhatsAppConfig",
				tableName: "WhatsAppConfigs",
				timestamps: true,
				paranoid: true,
			}
		);

		// Define associations
		WhatsAppConfig.associate = (models) => {
			WhatsAppConfig.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
			});
		};

		return WhatsAppConfig;
	}
}

module.exports = WhatsAppConfig;
