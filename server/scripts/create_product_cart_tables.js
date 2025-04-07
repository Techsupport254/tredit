const { sequelize } = require("../config/config");

async function createProductCartTables() {
	try {
		console.log("Starting ProductCart tables creation process");

		// Begin transaction
		const transaction = await sequelize.transaction();

		try {
			// Drop existing tables if they exist
			console.log("Dropping existing tables...");
			await sequelize.query(
				`DROP TABLE IF EXISTS "ProductCartItems" CASCADE;`,
				{
					transaction,
				}
			);
			await sequelize.query(`DROP TABLE IF EXISTS "ProductCarts" CASCADE;`, {
				transaction,
			});

			// Create ProductCarts table
			console.log("Creating ProductCarts table...");
			await sequelize.query(
				`
				CREATE TABLE "ProductCarts" (
					"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
					"userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
					"status" VARCHAR(20) NOT NULL DEFAULT 'active',
					"subtotal" DECIMAL(10, 2) DEFAULT 0,
					"tax" DECIMAL(10, 2) DEFAULT 0,
					"shippingCost" DECIMAL(10, 2) DEFAULT 0,
					"discount" DECIMAL(10, 2) DEFAULT 0,
					"discountType" VARCHAR(20),
					"discountValue" DECIMAL(10, 2) DEFAULT 0,
					"totalAmount" DECIMAL(10, 2) DEFAULT 0,
					"currency" VARCHAR(10) DEFAULT 'USD',
					"requiresShipping" BOOLEAN DEFAULT TRUE,
					"shippingAddress" JSONB,
					"shippingMethod" VARCHAR(50),
					"estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE,
					"expiresAt" TIMESTAMP WITH TIME ZONE,
					"lastActivity" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
					"metadata" JSONB DEFAULT '{}',
					"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
					"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
				);
			`,
				{ transaction }
			);

			// Create ProductCartItems table
			console.log("Creating ProductCartItems table...");
			await sequelize.query(
				`
				CREATE TABLE "ProductCartItems" (
					"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
					"cartId" UUID NOT NULL REFERENCES "ProductCarts"("id") ON DELETE CASCADE,
					"productId" UUID NOT NULL REFERENCES "Products"("id") ON DELETE CASCADE,
					"variantId" UUID REFERENCES "ProductVariants"("id") ON DELETE SET NULL,
					"businessId" UUID REFERENCES "Businesses"("id") ON DELETE SET NULL,
					"quantity" INTEGER NOT NULL DEFAULT 1,
					"unitPrice" DECIMAL(10, 2) NOT NULL,
					"subtotal" DECIMAL(10, 2) NOT NULL,
					"tax" JSONB DEFAULT '{"rate": 0, "exempt": false, "exemptRegions": []}',
					"selectedOptions" JSONB,
					"customizations" JSONB,
					"giftWrapping" BOOLEAN DEFAULT FALSE,
					"giftMessage" TEXT,
					"notes" TEXT,
					"isActive" BOOLEAN DEFAULT TRUE,
					"taxInfo" JSONB,
					"discountInfo" JSONB,
					"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
					"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
				);
			`,
				{ transaction }
			);

			// Add indexes for better performance
			console.log("Adding indexes...");
			await sequelize.query(
				`CREATE INDEX "idx_productcart_user" ON "ProductCarts"("userId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_productcartitem_cart" ON "ProductCartItems"("cartId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_productcartitem_product" ON "ProductCartItems"("productId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_productcartitem_variant" ON "ProductCartItems"("variantId");`,
				{ transaction }
			);
			await sequelize.query(
				`CREATE INDEX "idx_productcartitem_business" ON "ProductCartItems"("businessId");`,
				{ transaction }
			);

			console.log("Committing transaction...");
			await transaction.commit();
			console.log("ProductCart tables created successfully!");

			return true;
		} catch (error) {
			await transaction.rollback();
			console.error("Error creating ProductCart tables:", error);
			throw error;
		}
	} catch (error) {
		console.error("Error in createProductCartTables:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
}

// Run the function if this script is run directly
if (require.main === module) {
	createProductCartTables()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}

module.exports = createProductCartTables;
