const { Model, DataTypes } = require("sequelize");

class Message extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		chatSessionId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "ChatSessions",
				key: "id",
			},
		},
		senderId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		senderType: {
			type: DataTypes.ENUM("buyer", "business", "system"),
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				len: {
					args: [1, 5000],
					msg: "Message content must be between 1 and 5000 characters",
				},
			},
		},
		isRead: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		readBy: {
			type: DataTypes.JSONB,
			defaultValue: [],
			validate: {
				isValidReadBy(value) {
					if (!Array.isArray(value)) {
						throw new Error("readBy must be an array");
					}
					if (value.some((id) => typeof id !== "string")) {
						throw new Error("All readBy entries must be user IDs");
					}
				},
			},
		},
		metadata: {
			type: DataTypes.JSONB,
			defaultValue: {},
			validate: {
				isValidMetadata(value) {
					if (typeof value !== "object" || value === null) {
						throw new Error("Metadata must be a valid JSON object");
					}
					// Validate specific metadata fields if needed
					if (value.attachments) {
						if (!Array.isArray(value.attachments)) {
							throw new Error("Attachments must be an array");
						}
						value.attachments.forEach((attachment) => {
							if (!attachment.url || !attachment.type) {
								throw new Error("Each attachment must have url and type");
							}
						});
					}
				},
			},
		},
	};

	static initModel(sequelize) {
		return Message.init(this.schema, {
			sequelize,
			modelName: "Message",
			tableName: "Messages",
			timestamps: true,
			indexes: [
				{
					fields: ["chatSessionId"],
				},
				{
					fields: ["senderId"],
				},
				{
					fields: ["createdAt"],
				},
				{
					fields: ["isRead"],
				},
			],
		});
	}

	static associate(models) {
		if (models.ChatSession) {
			Message.belongsTo(models.ChatSession, {
				foreignKey: "chatSessionId",
				as: "chatSession",
			});
		}

		if (models.User) {
			Message.belongsTo(models.User, {
				foreignKey: "senderId",
				as: "sender",
			});
		}
	}
}

module.exports = Message;
