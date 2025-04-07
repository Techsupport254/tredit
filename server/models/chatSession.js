const { Model, DataTypes } = require("sequelize");

class ChatSession extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		buyerId: {
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
		status: {
			type: DataTypes.ENUM("active", "archived", "closed"),
			defaultValue: "active",
			allowNull: false,
			validate: {
				isIn: [["active", "archived", "closed"]],
			},
		},
		lastMessageAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {},
			validate: {
				isValidMetadata(value) {
					if (typeof value !== "object" || value === null) {
						throw new Error("Metadata must be a valid JSON object");
					}
				},
			},
		},
	};

	static initModel(sequelize) {
		return ChatSession.init(this.schema, {
			sequelize,
			modelName: "ChatSession",
			tableName: "ChatSessions",
			timestamps: true,
			indexes: [
				{
					fields: ["buyerId"],
				},
				{
					fields: ["businessId"],
				},
				{
					fields: ["status"],
				},
				{
					fields: ["lastMessageAt"],
				},
			],
		});
	}

	static associate(models) {
		if (models.User) {
			ChatSession.belongsTo(models.User, {
				foreignKey: "buyerId",
				as: "buyer",
			});
		}

		if (models.Business) {
			ChatSession.belongsTo(models.Business, {
				foreignKey: "businessId",
				as: "business",
			});
		}

		if (models.Message) {
			ChatSession.hasMany(models.Message, {
				foreignKey: "chatSessionId",
				as: "messages",
			});
		}
	}
}

module.exports = ChatSession;
