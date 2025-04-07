const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const {
	checkBusinessOwnership,
	validateBusinessType,
} = require("../middleware/business");
const { db } = require("../models");
const { validateProduct } = require("../middleware/validation");
const { handleAsync } = require("../utils/errorHandler");
const { uploadToIPFS } = require("../utils/ipfs");
const { sequelize } = require("../models");

// Middleware to track product views and update analytics
const trackProductView = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const visitorId = req.headers["x-visitor-id"]; // Should be set by frontend

		// Get or create analytics record
		let [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				views: 0,
				uniqueVisitors: 0,
				addToCart: 0,
				purchases: 0,
				revenue: 0,
				conversionRate: 0,
				averageRating: 0,
				reviewCount: 0,
				searchImpressions: 0,
				searchClicks: 0,
				searchClickThroughRate: 0,
				popularityScore: 0,
				customMetrics: {},
			},
		});

		// Increment views
		analytics.views += 1;

		// Track unique visitors
		if (visitorId) {
			const uniqueVisitors = new Set(analytics.customMetrics.visitorIds || []);
			if (!uniqueVisitors.has(visitorId)) {
				uniqueVisitors.add(visitorId);
				analytics.uniqueVisitors += 1;
				analytics.customMetrics.visitorIds = Array.from(uniqueVisitors);
			}
		}

		// Update conversion rate
		if (analytics.views > 0) {
			analytics.conversionRate = (analytics.purchases / analytics.views) * 100;
		}

		// Update popularity score based on views, purchases, and ratings
		analytics.popularityScore =
			analytics.views * 0.3 +
			analytics.purchases * 0.4 +
			analytics.averageRating * 20 * 0.3;

		// Update last updated timestamp
		analytics.lastUpdated = new Date();

		await analytics.save();
	} catch (error) {
		console.error("Error tracking product view:", error);
	}
	next();
};

// Middleware to track search impressions
const trackSearchImpression = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				searchImpressions: 0,
				searchClicks: 0,
				searchClickThroughRate: 0,
			},
		});

		analytics.searchImpressions += 1;
		if (analytics.searchImpressions > 0) {
			analytics.searchClickThroughRate =
				(analytics.searchClicks / analytics.searchImpressions) * 100;
		}
		analytics.lastUpdated = new Date();
		await analytics.save();
	} catch (error) {
		console.error("Error tracking search impression:", error);
	}
	next();
};

// Middleware to track search clicks
const trackSearchClick = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				searchImpressions: 1,
				searchClicks: 0,
				searchClickThroughRate: 0,
			},
		});

		analytics.searchClicks += 1;
		analytics.searchClickThroughRate =
			(analytics.searchClicks / analytics.searchImpressions) * 100;
		analytics.lastUpdated = new Date();
		await analytics.save();
	} catch (error) {
		console.error("Error tracking search click:", error);
	}
	next();
};

// Middleware to track add to cart
const trackAddToCart = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				addToCart: 0,
				purchases: 0,
				revenue: 0,
				conversionRate: 0,
			},
		});

		analytics.addToCart += 1;
		analytics.lastUpdated = new Date();
		await analytics.save();
	} catch (error) {
		console.error("Error tracking add to cart:", error);
	}
	next();
};

// Middleware to track purchases
const trackPurchase = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const { quantity, price } = req.body;

		const [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				purchases: 0,
				revenue: 0,
				conversionRate: 0,
			},
		});

		analytics.purchases += quantity || 1;
		analytics.revenue =
			parseFloat(analytics.revenue) + parseFloat(price) * (quantity || 1);

		if (analytics.views > 0) {
			analytics.conversionRate = (analytics.purchases / analytics.views) * 100;
		}

		// Update popularity score
		analytics.popularityScore =
			analytics.views * 0.3 +
			analytics.purchases * 0.4 +
			analytics.averageRating * 20 * 0.3;

		analytics.lastUpdated = new Date();
		await analytics.save();
	} catch (error) {
		console.error("Error tracking purchase:", error);
	}
	next();
};

// Middleware to track ratings and reviews
const trackRating = async (req, res, next) => {
	try {
		const { productId } = req.params;
		const { rating } = req.body;

		const [analytics] = await db.ProductAnalytics.findOrCreate({
			where: { productId },
			defaults: {
				averageRating: 0,
				reviewCount: 0,
			},
		});

		// Update average rating
		const currentTotal = analytics.averageRating * analytics.reviewCount;
		analytics.reviewCount += 1;
		analytics.averageRating = (currentTotal + rating) / analytics.reviewCount;

		// Update popularity score
		analytics.popularityScore =
			analytics.views * 0.3 +
			analytics.purchases * 0.4 +
			analytics.averageRating * 20 * 0.3;

		analytics.lastUpdated = new Date();
		await analytics.save();
	} catch (error) {
		console.error("Error tracking rating:", error);
	}
	next();
};

// Create a new product
router.post(
	"/",
	protect,
	checkBusinessOwnership,
	validateBusinessType,
	validateProduct,
	handleAsync(async (req, res) => {
		const { variants, ...productData } = req.body;

		// Start a transaction to ensure both product and variants are created
		const result = await sequelize.transaction(async (t) => {
			// Create the product in database
			const product = await db.Product.create(productData, { transaction: t });

			// Create variants if provided
			if (variants && variants.length > 0) {
				const createdVariants = await Promise.all(
					variants.map(async (variantData) => {
						const variant = await db.ProductVariant.create(
							{
								...variantData,
								productId: product.id,
							},
							{ transaction: t }
						);
						return variant;
					})
				);
				product.variants = createdVariants;
			} else {
				throw new Error("At least one variant is required for the product");
			}

			// Upload product data to IPFS
			const ipfsResult = await uploadToIPFS(product);

			return {
				product,
				ipfs: {
					hash: ipfsResult.ipfsCid,
					url: ipfsResult.ipfsUrl,
				},
			};
		});

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: result,
		});
	})
);

// Get all products
router.get(
	"/",
	handleAsync(async (req, res) => {
		const products = await db.Product.findAll({
			include: [
				{
					model: db.ProductVariant,
					as: "variants",
					where: { isActive: true },
					required: false,
				},
				{
					model: db.Business,
					as: "business",
					attributes: ["id", "name", "description"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		// Calculate stock status based on variants
		const productsWithStock = products.map((product) => {
			const hasStock = product.variants.some(
				(variant) => variant.stockQuantity > 0
			);
			return {
				...product.toJSON(),
				isInStock: hasStock,
			};
		});

		res.json({
			success: true,
			data: productsWithStock,
		});
	})
);

// Get a single product
router.get(
	"/:id",
	handleAsync(async (req, res) => {
		const product = await db.Product.findByPk(req.params.id, {
			include: [
				{
					model: db.ProductVariant,
					as: "variants",
					where: { isActive: true },
					required: false,
				},
				{
					model: db.Business,
					as: "business",
					attributes: ["id", "name", "description"],
				},
				{
					model: db.ProductAnalytics,
					as: "analytics",
					required: false,
				},
				{
					model: db.ProductSEO,
					as: "seo",
					required: false,
				},
				{
					model: db.SocialMediaContent,
					as: "socialMedia",
					where: { isActive: true },
					required: false,
				},
			],
		});

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Calculate stock status based on variants
		const hasStock =
			product.variants &&
			product.variants.some((variant) => variant.stockQuantity > 0);
		const productData = {
			...product.toJSON(),
			isInStock: hasStock,
		};

		res.json({
			success: true,
			data: productData,
		});
	})
);

// Update a product
router.put(
	"/:id",
	validateProduct,
	handleAsync(async (req, res) => {
		const product = await db.Product.findByPk(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Update product in database
		await product.update(req.body);

		// Upload updated data to IPFS
		const ipfsResult = await uploadToIPFS(product);

		res.json({
			success: true,
			message: "Product updated successfully",
			data: {
				product,
				ipfs: {
					hash: ipfsResult.ipfsCid,
					url: ipfsResult.ipfsUrl,
				},
			},
		});
	})
);

// Delete a product
router.delete(
	"/:id",
	handleAsync(async (req, res) => {
		const product = await db.Product.findByPk(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		await product.destroy();

		res.json({
			success: true,
			message: "Product deleted successfully",
		});
	})
);

// Get all products for a business
router.get(
	"/business/:businessId",
	protect,
	productController.getAllByBusiness
);

// Get a single product (with view tracking)
router.get(
	"/business/:businessId/:productId",
	protect,
	trackProductView,
	productController.getOne
);

// Search products
router.get("/search", protect, productController.search);

// Get product details from search (with tracking)
router.get(
	"/search/product/:productId",
	protect,
	trackSearchClick,
	productController.getOne
);

// Update a product
router.put(
	"/business/:businessId/:productId",
	protect,
	checkBusinessOwnership,
	productController.update
);

// Delete a product
router.delete(
	"/business/:businessId/:productId",
	protect,
	checkBusinessOwnership,
	productController.delete
);

// Create or update product SEO
router.post(
	"/business/:businessId/:productId/seo",
	protect,
	checkBusinessOwnership,
	async (req, res) => {
		try {
			const { productId } = req.params;
			const seoData = req.body;

			// Verify product exists
			const product = await db.Product.findByPk(productId);
			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			const [seo, created] = await db.ProductSEO.upsert({
				...seoData,
				productId,
			});

			res.status(created ? 201 : 200).json({
				success: true,
				data: seo,
			});
		} catch (error) {
			console.error("Error managing product SEO:", error);
			res.status(500).json({
				success: false,
				message: "Failed to manage product SEO",
				error: error.message,
			});
		}
	}
);

// Create or update product variants
router.post(
	"/business/:businessId/:productId/variants",
	protect,
	checkBusinessOwnership,
	async (req, res) => {
		try {
			const { productId } = req.params;
			const variantsData = req.body;

			// Verify product exists
			const product = await db.Product.findByPk(productId);
			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			// Handle multiple variants
			const variants = Array.isArray(variantsData)
				? variantsData
				: [variantsData];
			const createdVariants = await Promise.all(
				variants.map(async (variantData) => {
					const [variant, created] = await db.ProductVariant.upsert({
						...variantData,
						productId,
					});
					return variant;
				})
			);

			res.status(201).json({
				success: true,
				data: createdVariants,
			});
		} catch (error) {
			console.error("Error managing product variants:", error);
			res.status(500).json({
				success: false,
				message: "Failed to manage product variants",
				error: error.message,
			});
		}
	}
);

// Create or update product analytics
router.post(
	"/business/:businessId/:productId/analytics",
	protect,
	checkBusinessOwnership,
	async (req, res) => {
		try {
			const { productId } = req.params;
			const analyticsData = req.body;

			// Verify product exists
			const product = await db.Product.findByPk(productId);
			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			const [analytics, created] = await db.ProductAnalytics.upsert({
				...analyticsData,
				productId,
				lastUpdated: new Date(),
			});

			res.status(created ? 201 : 200).json({
				success: true,
				data: analytics,
			});
		} catch (error) {
			console.error("Error managing product analytics:", error);
			res.status(500).json({
				success: false,
				message: "Failed to manage product analytics",
				error: error.message,
			});
		}
	}
);

// Add to cart endpoint
router.post(
	"/business/:businessId/:productId/cart",
	protect,
	trackAddToCart,
	async (req, res) => {
		try {
			const { productId } = req.params;
			// Add to cart logic here
			res.status(200).json({
				success: true,
				message: "Product added to cart",
			});
		} catch (error) {
			console.error("Error adding to cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add product to cart",
				error: error.message,
			});
		}
	}
);

// Purchase endpoint
router.post(
	"/business/:businessId/:productId/purchase",
	protect,
	trackPurchase,
	async (req, res) => {
		try {
			const { productId } = req.params;
			// Purchase logic here
			res.status(200).json({
				success: true,
				message: "Purchase successful",
			});
		} catch (error) {
			console.error("Error processing purchase:", error);
			res.status(500).json({
				success: false,
				message: "Failed to process purchase",
				error: error.message,
			});
		}
	}
);

// Rating endpoint
router.post(
	"/business/:businessId/:productId/rating",
	protect,
	trackRating,
	async (req, res) => {
		try {
			const { productId } = req.params;
			const { rating, review } = req.body;

			// Validate rating
			if (rating < 1 || rating > 5) {
				return res.status(400).json({
					success: false,
					message: "Rating must be between 1 and 5",
				});
			}

			// Store rating and review logic here
			res.status(200).json({
				success: true,
				message: "Rating and review submitted successfully",
			});
		} catch (error) {
			console.error("Error submitting rating:", error);
			res.status(500).json({
				success: false,
				message: "Failed to submit rating",
				error: error.message,
			});
		}
	}
);

// Update a variant
router.patch(
	"/business/:businessId/:productId/variants/:variantId",
	protect,
	checkBusinessOwnership,
	handleAsync(async (req, res) => {
		const { productId, variantId } = req.params;
		const variantData = req.body;

		// Verify product exists and belongs to the business
		const product = await db.Product.findByPk(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Verify variant exists and belongs to the product
		const variant = await db.ProductVariant.findOne({
			where: { id: variantId, productId },
		});
		if (!variant) {
			return res.status(404).json({
				success: false,
				message: "Variant not found",
			});
		}

		// Update variant
		await variant.update(variantData);

		res.json({
			success: true,
			message: "Variant updated successfully",
			data: variant,
		});
	})
);

// Update multiple variants
router.put(
	"/business/:businessId/:productId/variants",
	protect,
	checkBusinessOwnership,
	handleAsync(async (req, res) => {
		const { productId } = req.params;
		const variantsData = req.body;

		// Verify product exists and belongs to the business
		const product = await db.Product.findByPk(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Update each variant
		const updatedVariants = await Promise.all(
			variantsData.map(async (variantData) => {
				const { id, ...updateData } = variantData;
				const variant = await db.ProductVariant.findOne({
					where: { id, productId },
				});
				if (!variant) {
					throw new Error(`Variant with ID ${id} not found`);
				}
				await variant.update(updateData);
				return variant;
			})
		);

		res.json({
			success: true,
			message: "Variants updated successfully",
			data: updatedVariants,
		});
	})
);

// Create a new product for a business
router.post(
	"/business/:businessId",
	protect,
	checkBusinessOwnership,
	validateBusinessType,
	validateProduct,
	async (req, res) => {
		try {
			const { businessId } = req.params;
			const { variants, ...productData } = req.body;

			// Start a transaction to ensure both product and variants are created
			const result = await sequelize.transaction(async (t) => {
				// Create the product in database
				const product = await db.Product.create(
					{
						...productData,
						businessId,
					},
					{ transaction: t }
				);

				// Create variants if provided
				if (variants && variants.length > 0) {
					const createdVariants = await Promise.all(
						variants.map(async (variantData) => {
							const variant = await db.ProductVariant.create(
								{
									...variantData,
									productId: product.id,
								},
								{ transaction: t }
							);
							return variant;
						})
					);
					product.variants = createdVariants;
				} else {
					throw new Error("At least one variant is required for the product");
				}

				// Upload product data to IPFS
				const ipfsResult = await uploadToIPFS(product);

				return {
					product,
					ipfs: {
						hash: ipfsResult.ipfsCid,
						url: ipfsResult.ipfsUrl,
					},
				};
			});

			res.status(201).json({
				success: true,
				message: "Product created successfully",
				data: result,
			});
		} catch (error) {
			console.error("Error creating product:", error);
			res.status(500).json({
				success: false,
				message: "Error creating product",
				error: error.message,
			});
		}
	}
);

module.exports = router;
