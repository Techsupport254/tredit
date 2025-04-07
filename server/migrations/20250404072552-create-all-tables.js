"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Create Users table first
		await queryInterface.createTable("Users", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			role: {
				type: Sequelize.ENUM("user", "admin", "business_owner"),
				defaultValue: "user",
			},
			walletAddress: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			blockchainTxHash: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			ipfsUrl: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create Businesses table
		await queryInterface.createTable("Businesses", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			ownerId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
			},
			status: {
				type: Sequelize.ENUM("active", "inactive", "suspended"),
				defaultValue: "active",
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create Products table
		await queryInterface.createTable("Products", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Businesses",
					key: "id",
				},
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			stockQuantity: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			taxRate: {
				type: Sequelize.DECIMAL(5, 2),
				defaultValue: 0,
			},
			isService: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create ProductVariants table
		await queryInterface.createTable("ProductVariants", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			productId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Products",
					key: "id",
				},
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			sku: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			stockQuantity: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create ProductCarts table
		await queryInterface.createTable("ProductCarts", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
			},
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Businesses",
					key: "id",
				},
			},
			status: {
				type: Sequelize.ENUM("active", "abandoned", "converted"),
				defaultValue: "active",
			},
			subtotal: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			tax: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			shippingCost: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			discount: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			discountType: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			discountValue: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			totalAmount: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			currency: {
				type: Sequelize.STRING,
				defaultValue: "USD",
			},
			requiresShipping: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			shippingAddress: {
				type: Sequelize.STRING(1000),
				allowNull: true,
			},
			shippingMethod: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			estimatedDeliveryDate: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			lastActivity: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create ProductCartItems table
		await queryInterface.createTable("ProductCartItems", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			cartId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "ProductCarts",
					key: "id",
				},
			},
			productId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Products",
					key: "id",
				},
			},
			variantId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "ProductVariants",
					key: "id",
				},
			},
			quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			unitPrice: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			subtotal: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			tax: {
				type: Sequelize.JSONB,
				defaultValue: { rate: 0, exempt: false, exemptRegions: [] },
			},
			customizations: {
				type: Sequelize.JSONB,
				defaultValue: {},
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
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

		// Create Orders table
		await queryInterface.createTable("Orders", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
			},
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Businesses",
					key: "id",
				},
			},
			cartId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "ProductCarts",
					key: "id",
				},
			},
			orderNumber: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			status: {
				type: Sequelize.ENUM(
					"pending",
					"confirmed",
					"processing",
					"shipped",
					"delivered",
					"cancelled",
					"refunded"
				),
				defaultValue: "pending",
			},
			paymentStatus: {
				type: Sequelize.ENUM("pending", "paid", "failed", "refunded"),
				defaultValue: "pending",
			},
			subtotal: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			tax: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			shippingCost: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			discount: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			totalAmount: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			currency: {
				type: Sequelize.STRING,
				defaultValue: "USD",
			},
			shippingAddress: {
				type: Sequelize.STRING(1000),
				allowNull: false,
			},
			billingAddress: {
				type: Sequelize.STRING(1000),
				allowNull: true,
			},
			estimatedDeliveryDate: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			notes: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			metadata: {
				type: Sequelize.JSONB,
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

		// Create OrderItems table
		await queryInterface.createTable("OrderItems", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			orderId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Orders",
					key: "id",
				},
			},
			productId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Products",
					key: "id",
				},
			},
			variantId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: "ProductVariants",
					key: "id",
				},
			},
			quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			unitPrice: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			subtotal: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			tax: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			isService: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			serviceDate: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			serviceDuration: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			customizations: {
				type: Sequelize.JSONB,
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
	},

	async down(queryInterface, Sequelize) {
		// Drop tables in reverse order
		await queryInterface.dropTable("OrderItems");
		await queryInterface.dropTable("Orders");
		await queryInterface.dropTable("ProductCartItems");
		await queryInterface.dropTable("ProductCarts");
		await queryInterface.dropTable("ProductVariants");
		await queryInterface.dropTable("Products");
		await queryInterface.dropTable("Businesses");
		await queryInterface.dropTable("Users");
	},
};
