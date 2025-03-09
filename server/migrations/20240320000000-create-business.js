module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Businesses", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			walletAddress: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: "Users",
					key: "walletAddress",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			type: {
				type: Sequelize.ENUM("product", "service"),
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			category: {
				type: Sequelize.ENUM(
					"Fashion & Apparel",
					"Electronics",
					"Home & Garden",
					"Beauty & Personal Care",
					"Sports & Outdoors",
					"Books & Media",
					"Food & Beverages",
					"Health & Wellness",
					"Art & Collectibles",
					"Services",
					"Other"
				),
				allowNull: false,
			},
			logo: {
				type: Sequelize.STRING(1024),
				allowNull: true,
			},
			website: {
				type: Sequelize.STRING(1024),
				allowNull: true,
			},
			businessModel: {
				type: Sequelize.ENUM("B2C", "B2B", "C2C"),
				allowNull: false,
			},
			operationMode: {
				type: Sequelize.ENUM("physical", "online", "hybrid"),
				allowNull: false,
			},
			locations: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: [],
			},
			productCategories: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: [],
			},
			serviceCategories: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: [],
			},
			inventoryManagement: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			pricingModel: {
				type: Sequelize.ENUM("fixed", "negotiable", "subscription"),
				allowNull: false,
				defaultValue: "fixed",
			},
			escrowWallet: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			currency: {
				type: Sequelize.STRING(3),
				allowNull: false,
				defaultValue: "USD",
			},
			taxInformation: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			payoutMethods: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: [],
			},
			socialMedia: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {
					facebook: {
						clientId: null,
						accessToken: null,
						refreshToken: null,
						tokenExpiry: null,
						pageId: null,
						connected: false,
					},
					instagram: {
						clientId: null,
						accessToken: null,
						refreshToken: null,
						tokenExpiry: null,
						userId: null,
						connected: false,
					},
					tiktok: {
						clientId: null,
						accessToken: null,
						refreshToken: null,
						tokenExpiry: null,
						openId: null,
						connected: false,
					},
					youtube: {
						clientId: null,
						accessToken: null,
						refreshToken: null,
						tokenExpiry: null,
						channelId: null,
						connected: false,
					},
				},
			},
			customerReviews: {
				type: Sequelize.JSONB,
				allowNull: false,
				defaultValue: {
					averageRating: 0,
					totalReviews: 0,
				},
			},
			ipfsCid: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			ipfsUrl: {
				type: Sequelize.STRING(1024),
				allowNull: true,
			},
			lastBlockchainUpdate: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			isVerified: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			complianceDocuments: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: [],
			},
			status: {
				type: Sequelize.ENUM("active", "suspended", "closed"),
				allowNull: false,
				defaultValue: "active",
			},
			metadata: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		// Add indexes
		await queryInterface.addIndex("Businesses", ["walletAddress", "name"], {
			unique: true,
		});
		await queryInterface.addIndex("Businesses", ["category"]);
		await queryInterface.addIndex("Businesses", ["status"]);
		await queryInterface.addIndex("Businesses", ["type"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Businesses");
	},
};
