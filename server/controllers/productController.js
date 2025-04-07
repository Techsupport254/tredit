const { db, sequelize } = require("../models");
const {
	Product,
	Business,
	ProductVariant,
	ProductAnalytics,
	ProductSEO,
	SocialMediaContent,
} = db;
const { checkBusinessOwnership } = require("../middleware/business");
const { Op } = require("sequelize");
const { uploadToIPFS } = require("../utils/ipfs");

class ProductController {
	// Create a new product
	async create(req, res) {
		try {
			const { businessId } = req.params;
			const productData = req.body;
			const { variants, ...productDetails } = productData;

			// Validate required fields
			if (
				!productDetails.name ||
				!productDetails.description ||
				!productDetails.category
			) {
				return res.status(400).json({
					success: false,
					message: "Missing required fields",
					code: "VALIDATION_ERROR",
				});
			}

			// Validate variants
			if (!variants || !Array.isArray(variants) || variants.length === 0) {
				return res.status(400).json({
					success: false,
					message: "Product must have at least one variant",
					code: "VALIDATION_ERROR",
				});
			}

			// Get business to verify it exists
			const business = await Business.findByPk(businessId);
			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
					code: "NOT_FOUND",
				});
			}

			// Create product with transaction
			const result = await sequelize.transaction(async (t) => {
				// Create product
				const product = await Product.create(
					{
						...productDetails,
						businessId,
					},
					{ transaction: t }
				);

				// Create variants
				const variantPromises = variants.map((variantData) =>
					ProductVariant.create(
						{
							...variantData,
							productId: product.id,
							isActive: true,
						},
						{ transaction: t }
					)
				);
				await Promise.all(variantPromises);

				return product;
			});

			res.status(201).json({
				success: true,
				data: result,
				message: "Product created successfully",
			});
		} catch (error) {
			console.error("Error creating product:", error);
			res.status(500).json({
				success: false,
				message: "Error creating product",
				code: "INTERNAL_ERROR",
				details: error.message,
			});
		}
	}

	// Get all products for a business
	async getAllByBusiness(req, res) {
		try {
			const { businessId } = req.params;

			// Find business by ID
			const business = await Business.findByPk(businessId);

			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
					code: "NOT_FOUND",
				});
			}

			const products = await Product.findAll({
				where: { businessId },
				include: [
					{
						model: Business,
						as: "business",
						attributes: ["id", "name", "description"],
					},
					{
						model: ProductVariant,
						as: "variants",
						where: { isActive: true },
						required: false,
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: products,
			});
		} catch (error) {
			console.error("Error fetching products:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch products",
				error: error.message,
			});
		}
	}

	// Get a single product
	async getOne(req, res) {
		try {
			const { businessId, productId } = req.params;

			// Find business by ID
			const business = await Business.findByPk(businessId);

			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
					code: "NOT_FOUND",
				});
			}

			const product = await Product.findOne({
				where: { id: productId, businessId },
				include: [
					{
						model: Business,
						as: "business",
						attributes: ["id", "name", "description"],
					},
					{
						model: ProductVariant,
						as: "variants",
						where: { isActive: true },
						required: false,
					},
					{
						model: ProductAnalytics,
						as: "analytics",
						required: false,
					},
					{
						model: ProductSEO,
						as: "seo",
						required: false,
					},
					{
						model: SocialMediaContent,
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

			res.status(200).json({
				success: true,
				data: product,
			});
		} catch (error) {
			console.error("Error fetching product:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch product",
				error: error.message,
			});
		}
	}

	// Update a product
	async update(req, res) {
		try {
			const { businessId, productId } = req.params;
			const updateData = req.body;

			// Find business by ID
			const business = await Business.findByPk(businessId);

			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
					code: "NOT_FOUND",
				});
			}

			const product = await Product.findOne({
				where: { id: productId, businessId },
			});

			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			await product.update(updateData);

			res.status(200).json({
				success: true,
				data: product,
			});
		} catch (error) {
			console.error("Error updating product:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update product",
				error: error.message,
			});
		}
	}

	// Delete a product
	async delete(req, res) {
		try {
			const { businessId, productId } = req.params;

			// Find business by ID
			const business = await Business.findByPk(businessId);

			if (!business) {
				return res.status(404).json({
					success: false,
					message: "Business not found",
					code: "NOT_FOUND",
				});
			}

			const product = await Product.findOne({
				where: { id: productId, businessId },
			});

			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			await product.destroy();

			res.status(200).json({
				success: true,
				message: "Product deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting product:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete product",
				error: error.message,
			});
		}
	}

	// Search products
	async search(req, res) {
		try {
			const { query, category, minPrice, maxPrice, businessId } = req.query;
			const where = {};

			// Add search conditions
			if (query) {
				where[Op.or] = [
					{ name: { [Op.iLike]: `%${query}%` } },
					{ description: { [Op.iLike]: `%${query}%` } },
				];
			}

			if (category) {
				where.category = category;
			}

			if (businessId) {
				where.businessId = businessId;
			}

			if (minPrice || maxPrice) {
				where.price = {};
				if (minPrice) where.price[Op.gte] = minPrice;
				if (maxPrice) where.price[Op.lte] = maxPrice;
			}

			const products = await Product.findAll({
				where,
				include: [
					{
						model: Business,
						as: "business",
						attributes: ["id", "name"],
					},
				],
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: products,
			});
		} catch (error) {
			console.error("Error searching products:", error);
			res.status(500).json({
				success: false,
				message: "Failed to search products",
				error: error.message,
			});
		}
	}
}

// Create a single instance and bind all methods
const productController = new ProductController();

module.exports = productController;
