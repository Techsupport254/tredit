const express = require("express");
const router = express.Router();
const {
	Product,
	ProductSEO,
	ProductShipping,
	ProductAnalytics,
	ProductVariant,
	ProductMedia,
} = require("../models");
const { sequelize } = require("../config/database");

// Create a new product
router.post("/", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			name,
			description,
			short_description,
			sku,
			price,
			discounted_price,
			category_id,
			brand,
			stock_quantity,
			variants,
			tags,
			images,
			videos,
			meta_title,
			meta_description,
			meta_keywords,
			shipping_cost,
			shipping_time,
			free_shipping,
			return_policy,
		} = req.body;

		// Create the main product
		const product = await Product.create(
			{
				name,
				description,
				short_description,
				sku,
				price,
				discounted_price,
				category_id,
				brand,
				stock_quantity,
				tags: JSON.parse(tags || "[]"),
			},
			{ transaction }
		);

		// Handle product variants
		if (variants) {
			const parsedVariants = JSON.parse(variants);
			await Promise.all(
				parsedVariants.map((variant) =>
					ProductVariant.create(
						{
							...variant,
							product_id: product.id,
						},
						{ transaction }
					)
				)
			);
		}

		// Handle media (images and videos)
		if (images && images.length > 0) {
			await Promise.all(
				images.map((image) =>
					ProductMedia.create(
						{
							productId: product.id,
							mediaType: "image",
							mediaUrl: image.ipfsUrl,
							metadata: {
								ipfsHash: image.ipfsHash,
								pinSize: image.pinSize,
								timestamp: image.timestamp,
							},
						},
						{ transaction }
					)
				)
			);
		}

		if (videos && videos.length > 0) {
			await Promise.all(
				videos.map((video) =>
					ProductMedia.create(
						{
							productId: product.id,
							mediaType: "video",
							mediaUrl: video.ipfsUrl,
							platform: video.platform,
							title: video.title,
							description: video.description,
							thumbnailUrl: video.thumbnail?.ipfsUrl,
							metadata: {
								ipfsHash: video.ipfsHash,
								pinSize: video.pinSize,
								timestamp: video.timestamp,
								thumbnailHash: video.thumbnail?.ipfsHash,
							},
						},
						{ transaction }
					)
				)
			);
		}

		// Create SEO information
		await ProductSEO.create(
			{
				product_id: product.id,
				meta_title: meta_title || name,
				meta_description,
				meta_keywords: JSON.parse(meta_keywords || "[]"),
				slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
			},
			{ transaction }
		);

		// Create shipping information
		await ProductShipping.create(
			{
				product_id: product.id,
				shipping_cost,
				shipping_time,
				free_shipping: free_shipping === "true",
				return_policy,
			},
			{ transaction }
		);

		// Create analytics record
		await ProductAnalytics.create(
			{
				product_id: product.id,
				views_count: 0,
				purchases_count: 0,
				wishlist_count: 0,
				cart_additions: 0,
			},
			{ transaction }
		);

		await transaction.commit();

		// Fetch the complete product with all associations
		const completeProduct = await Product.findByPk(product.id, {
			include: [
				ProductSEO,
				ProductShipping,
				ProductAnalytics,
				ProductVariant,
				ProductMedia,
			],
		});

		res.status(201).json({
			success: true,
			product: completeProduct,
		});
	} catch (error) {
		await transaction.rollback();
		console.error("Error creating product:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Get all products
router.get("/", async (req, res) => {
	try {
		const products = await Product.findAll({
			include: [
				ProductSEO,
				ProductShipping,
				ProductAnalytics,
				ProductVariant,
				ProductMedia,
			],
		});
		res.json({ success: true, products });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Get a single product
router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findByPk(req.params.id, {
			include: [
				ProductSEO,
				ProductShipping,
				ProductAnalytics,
				ProductVariant,
				ProductMedia,
			],
		});

		if (!product) {
			return res.status(404).json({
				success: false,
				error: "Product not found",
			});
		}

		res.json({ success: true, product });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Update a product
router.put("/:id", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const product = await Product.findByPk(req.params.id);
		if (!product) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				error: "Product not found",
			});
		}

		const { images, videos, ...updateData } = req.body;

		// Update main product
		await product.update(updateData, { transaction });

		// Update associated models if data is provided
		if (req.body.seo) {
			await ProductSEO.update(req.body.seo, {
				where: { product_id: product.id },
				transaction,
			});
		}

		if (req.body.shipping) {
			await ProductShipping.update(req.body.shipping, {
				where: { product_id: product.id },
				transaction,
			});
		}

		// Handle new media
		if (images && images.length > 0) {
			await Promise.all(
				images.map((image) =>
					ProductMedia.create(
						{
							productId: product.id,
							mediaType: "image",
							mediaUrl: image.ipfsUrl,
							metadata: {
								ipfsHash: image.ipfsHash,
								pinSize: image.pinSize,
								timestamp: image.timestamp,
							},
						},
						{ transaction }
					)
				)
			);
		}

		if (videos && videos.length > 0) {
			await Promise.all(
				videos.map((video) =>
					ProductMedia.create(
						{
							productId: product.id,
							mediaType: "video",
							mediaUrl: video.ipfsUrl,
							platform: video.platform,
							title: video.title,
							description: video.description,
							thumbnailUrl: video.thumbnail?.ipfsUrl,
							metadata: {
								ipfsHash: video.ipfsHash,
								pinSize: video.pinSize,
								timestamp: video.timestamp,
								thumbnailHash: video.thumbnail?.ipfsHash,
							},
						},
						{ transaction }
					)
				)
			);
		}

		await transaction.commit();

		// Fetch updated product with all associations
		const updatedProduct = await Product.findByPk(product.id, {
			include: [
				ProductSEO,
				ProductShipping,
				ProductAnalytics,
				ProductVariant,
				ProductMedia,
			],
		});

		res.json({ success: true, product: updatedProduct });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Delete a product
router.delete("/:id", async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const product = await Product.findByPk(req.params.id);
		if (!product) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				error: "Product not found",
			});
		}

		// Delete associated records
		await Promise.all([
			ProductSEO.destroy({
				where: { product_id: product.id },
				transaction,
			}),
			ProductShipping.destroy({
				where: { product_id: product.id },
				transaction,
			}),
			ProductAnalytics.destroy({
				where: { product_id: product.id },
				transaction,
			}),
			ProductVariant.destroy({
				where: { product_id: product.id },
				transaction,
			}),
			ProductMedia.destroy({
				where: { productId: product.id },
				transaction,
			}),
		]);

		await product.destroy({ transaction });
		await transaction.commit();

		res.json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
