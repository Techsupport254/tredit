const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class User extends Model {}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		walletAddress: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true,
		},
		profileImage: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			validate: {
				isUrl: {
					msg: "Invalid profile image URL",
				},
			},
		},
		ipfsURI: {
			type: DataTypes.STRING(1024),
			allowNull: true,
			unique: true,
			validate: {
				isUrl: {
					msg: "Invalid IPFS URI format",
				},
			},
		},
		ipfsUrl: {
			type: DataTypes.STRING(255),
			allowNull: true,
			comment: "The IPFS gateway URL for the user data",
		},
		ipfsCid: {
			type: DataTypes.STRING(64),
			allowNull: true,
			comment: "The IPFS CID of the user data",
		},
		ipfsMetadata: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
			comment: "Additional IPFS metadata including version history",
		},
		role: {
			type: DataTypes.ENUM("user", "vendor", "arbitrator", "admin"),
			allowNull: false,
			defaultValue: "user",
		},
		taxId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		country: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		cityState: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		address: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		postalCode: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		verificationToken: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
		},
		lastLogin: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		preferences: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		socialSettings: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: {},
		},
		bio: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		sequelize,
		modelName: "User",
		tableName: "Users",
		timestamps: true,
	}
);

module.exports = User;
