const { Model, DataTypes, Op } = require("sequelize");
const crypto = require("crypto");
const { USER_CONSTANTS } = require("../config/constants");

class User extends Model {
	static schema = {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [
					USER_CONSTANTS.VALIDATION.NAME_LENGTH.MIN,
					USER_CONSTANTS.VALIDATION.NAME_LENGTH.MAX,
				],
			},
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		walletAddress: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				is: USER_CONSTANTS.VALIDATION.WALLET_ADDRESS_REGEX,
			},
		},
		blockchainTxHash: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		ipfsUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		acceptBlockchainStorage: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		profileImage: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "",
			set(value) {
				this.setDataValue("profileImage", value || "");
			},
		},
		gender: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "prefer_not_to_say",
			validate: {
				isIn: [["male", "female", "other", "prefer_not_to_say"]],
			},
		},
		dob: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		phoneNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "",
			validate: {
				is: USER_CONSTANTS.VALIDATION.PHONE_REGEX,
			},
		},
		location: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				country: "",
				state: "",
				city: "",
				address: "",
				postalCode: "",
				coordinates: {
					latitude: null,
					longitude: null,
				},
			},
		},
		bio: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: "",
		},
		preferences: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				theme: "light",
				notifications: {
					email: true,
					push: true,
				},
				language: "en",
			},
		},
		lastLogin: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: USER_CONSTANTS.STATUS.ACTIVE,
			validate: {
				isIn: [Object.values(USER_CONSTANTS.STATUS)],
			},
		},
		role: {
			type: DataTypes.STRING,
			defaultValue: USER_CONSTANTS.ROLES.USER,
			validate: {
				isIn: [Object.values(USER_CONSTANTS.ROLES)],
			},
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: false,
			defaultValue: {
				businesses: [],
			},
		},
	};

	static initModel(sequelize) {
		return super.init(this.schema, {
			sequelize,
			modelName: "User",
			tableName: "Users",
			timestamps: true,
			paranoid: true,
			hooks: {
				beforeCreate: async (user) => {
					// Ensure wallet address is lowercase
					if (user.walletAddress) {
						user.walletAddress = user.walletAddress.toLowerCase();
					}
					// Ensure email is lowercase
					if (user.email) {
						user.email = user.email.toLowerCase();
					}
				},
				beforeUpdate: async (user) => {
					// Ensure wallet address is lowercase
					if (user.walletAddress) {
						user.walletAddress = user.walletAddress.toLowerCase();
					}
					// Ensure email is lowercase
					if (user.email) {
						user.email = user.email.toLowerCase();
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
					where: {
						email: {
							[Op.ne]: null,
						},
					},
				},
			],
		});
	}

	static associate(models) {
		// Business associations
		this.hasMany(models.Business, {
			foreignKey: "userId",
			as: "ownedBusinesses",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Team member associations
		this.hasMany(models.BusinessTeamMember, {
			foreignKey: "userId",
			as: "teamMemberships",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Order associations
		this.hasMany(models.Order, {
			foreignKey: "buyerId",
			as: "orders",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		});

		// Cart associations
		this.hasMany(models.ProductCart, {
			foreignKey: "userId",
			as: "carts",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Service cart associations
		this.hasMany(models.ServiceCart, {
			foreignKey: "userId",
			as: "serviceCarts",
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		});

		// Chat associations
		this.hasMany(models.ChatSession, {
			foreignKey: "buyerId",
			as: "buyerChats",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		});

		// Message associations
		this.hasMany(models.Message, {
			foreignKey: "senderId",
			as: "sentMessages",
			onDelete: "SET NULL",
			onUpdate: "CASCADE",
		});
	}

	// Instance methods
	getFullName() {
		return this.name || "Anonymous User";
	}

	isAdmin() {
		return this.role === USER_CONSTANTS.ROLES.ADMIN;
	}

	isSuperAdmin() {
		return this.role === USER_CONSTANTS.ROLES.SUPERADMIN;
	}

	isActive() {
		return this.status === USER_CONSTANTS.STATUS.ACTIVE;
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

	// Business-related methods
	async getBusinesses() {
		return this.metadata?.businesses || [];
	}

	async getBusinessById(businessId) {
		return (this.metadata?.businesses || []).find((b) => b.id === businessId);
	}

	async hasBusinessAccess(businessId) {
		return (this.metadata?.businesses || []).some((b) => b.id === businessId);
	}

	async hasBusinessPermission(businessId, permission) {
		const business = await this.getBusinessById(businessId);
		if (!business) return false;
		return (
			business.permissions?.all || business.permissions?.[permission] || false
		);
	}

	async getBusinessRole(businessId) {
		const business = await this.getBusinessById(businessId);
		return business?.role;
	}

	// Static methods
	static async findByWallet(walletAddress) {
		if (!walletAddress) return null;
		return await this.findOne({
			where: {
				walletAddress: walletAddress.toLowerCase(),
			},
		});
	}

	static async findByEmail(email) {
		if (!email) return null;
		return await this.findOne({
			where: {
				email: email.toLowerCase(),
			},
		});
	}

	static async findByPhone(phoneNumber) {
		if (!phoneNumber) return null;
		return await this.findOne({
			where: {
				phoneNumber,
			},
		});
	}
}

module.exports = User;
