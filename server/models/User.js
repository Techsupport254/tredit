const { Model, DataTypes } = require("sequelize");
const crypto = require("crypto");

class User extends Model {
	static associate(models) {
		// Add business associations
		User.hasMany(models.Business, {
			foreignKey: "userId",
			as: "ownedBusinesses",
		});

		User.belongsToMany(models.Business, {
			through: "BusinessTeamMembers",
			foreignKey: "userId",
			otherKey: "businessId",
			as: "teamMemberships",
		});
	}

	// Instance methods
	getFullName() {
		return this.name || "Anonymous User";
	}

	isAdmin() {
		return this.role === "admin";
	}

	isFreelancer() {
		return this.role === "freelancer";
	}

	getAge() {
		if (!this.dob) return null;
		const today = new Date();
		const birthDate = new Date(this.dob);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}

	// Static methods
	static async findByWallet(walletAddress) {
		return await this.findOne({
			where: { walletAddress: walletAddress.toLowerCase() },
		});
	}

	static initModel(sequelize) {
		return super.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
					allowNull: false,
				},
				walletAddress: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						isLowercase: true,
						notEmpty: true,
						is: /^0x[a-fA-F0-9]{40}$/i,
					},
				},
				name: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						len: [2, 100],
					},
				},
				email: {
					type: DataTypes.STRING,
					unique: true,
					allowNull: true,
					validate: {
						isEmail: true,
					},
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
				gender: {
					type: DataTypes.ENUM("male", "female"),
					allowNull: true,
				},
				dob: {
					type: DataTypes.DATEONLY,
					allowNull: true,
					validate: {
						isDate: true,
						isBefore: new Date().toISOString(),
					},
				},
				phoneNumber: {
					type: DataTypes.STRING,
					allowNull: true,
					validate: {
						is: /^\+?[\d\s-()]+$/,
					},
				},
				location: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				role: {
					type: DataTypes.ENUM("user", "admin", "freelancer"),
					allowNull: false,
					defaultValue: "user",
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
					defaultValue: {
						theme: "light",
						notifications: {
							email: true,
							push: true,
						},
						language: "en",
					},
				},
				bio: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				ipfsCid: {
					type: DataTypes.STRING,
					allowNull: true,
					comment: "IPFS Content Identifier for user profile",
				},
				ipfsUrl: {
					type: DataTypes.STRING(1024),
					allowNull: true,
					validate: {
						isUrl: {
							msg: "Invalid IPFS URL",
						},
					},
					comment: "Full IPFS gateway URL for user profile",
				},
				blockchainTxHash: {
					type: DataTypes.STRING,
					allowNull: true,
					comment: "Transaction hash of the last blockchain update",
				},
				lastBlockchainUpdate: {
					type: DataTypes.DATE,
					allowNull: true,
					comment: "Timestamp of the last blockchain update",
				},
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
					defaultValue: {},
					comment: "Additional metadata for the user profile",
				},
				uid: {
					type: DataTypes.STRING,
					allowNull: true,
					comment: "Firebase user ID",
				},
				acceptBlockchainStorage: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true,
					comment: "Whether user accepts blockchain storage",
				},
			},
			{
				sequelize,
				modelName: "User",
				tableName: "Users",
				timestamps: true,
				hooks: {
					beforeValidate: (user) => {
						if (user.walletAddress) {
							user.walletAddress = user.walletAddress.toLowerCase();
						}
					},
				},
				indexes: [
					{
						unique: true,
						fields: ["walletAddress"],
					},
					{
						unique: true,
						fields: ["email"],
					},
				],
			}
		);
	}
}

module.exports = User;
