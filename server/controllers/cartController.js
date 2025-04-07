const { db } = require("../models");
const {
	Cart,
	CartItem,
	Product,
	Service,
	ProductVariant,
	User,
	Business,
	ProductCart,
	ProductCartItem,
} = db;
const {
	calculateTax,
	calculateShippingCost,
	validateAddress,
} = require("../utils/orderUtils");
const { Op, DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../config/config");
const { ValidationError } = require("sequelize");
const productCartService = require("../services/productCartService");

class ProductCartController {
	/**
	 * Get user's cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async getCart(req, res) {
		try {
			const cart = await productCartService.getOrCreateCart(req.user.id);
			res.json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error getting cart:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to get cart",
			});
		}
	}

	/**
	 * Add item to cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async addItemToCart(req, res) {
		try {
			const { productId, variantId, quantity, customizations } = req.body;

			// Validate product exists
			const product = await Product.findByPk(productId);
			if (!product) {
				return res.status(404).json({
					success: false,
					message: "Product not found",
				});
			}

			// Validate variant if provided
			let variant = null;
			if (variantId) {
				variant = await ProductVariant.findByPk(variantId);
				if (!variant) {
					return res.status(404).json({
						success: false,
						message: "Product variant not found",
					});
				}
				if (variant.stockQuantity < quantity) {
					return res.status(400).json({
						success: false,
						message: "Insufficient stock",
					});
				}
			} else if (product.stockQuantity < quantity) {
				return res.status(400).json({
					success: false,
					message: "Insufficient stock",
				});
			}

			// Get or create cart
			const cart = await productCartService.getOrCreateCart(req.user.id);

			// Add item to cart
			const cartItem = await productCartService.addItemToCart(
				cart.id,
				productId,
				variantId,
				quantity,
				customizations
			);

			res.status(201).json({
				success: true,
				data: cartItem,
			});
		} catch (error) {
			console.error("Error adding item to cart:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to add item to cart",
			});
		}
	}

	/**
	 * Update cart item quantity
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async updateCartItemQuantity(req, res) {
		try {
			const { itemId } = req.params;
			const { quantity } = req.body;

			const cartItem = await productCartService.updateCartItemQuantity(
				itemId,
				quantity
			);

			res.json({
				success: true,
				data: cartItem,
			});
		} catch (error) {
			console.error("Error updating cart item quantity:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to update cart item quantity",
			});
		}
	}

	/**
	 * Remove item from cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async removeItemFromCart(req, res) {
		try {
			const { itemId } = req.params;

			await productCartService.removeItemFromCart(itemId);

			res.json({
				success: true,
				message: "Item removed from cart",
			});
		} catch (error) {
			console.error("Error removing item from cart:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to remove item from cart",
			});
		}
	}

	/**
	 * Clear cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async clearCart(req, res) {
		try {
			await productCartService.clearCart(req.user.id);

			res.json({
				success: true,
				message: "Cart cleared successfully",
			});
		} catch (error) {
			console.error("Error clearing cart:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to clear cart",
			});
		}
	}

	/**
	 * Apply coupon to cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async applyCoupon(req, res) {
		try {
			const { couponCode } = req.body;

			const cart = await productCartService.applyCoupon(
				req.user.id,
				couponCode
			);

			res.json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error applying coupon:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to apply coupon",
			});
		}
	}

	/**
	 * Update cart
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async updateCart(req, res) {
		try {
			const { cartId } = req.params;
			const updates = req.body;

			const cart = await productCartService.updateCart(cartId, updates);

			res.json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error updating cart:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to update cart",
			});
		}
	}

	/**
	 * Update shipping address
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async updateShippingAddress(req, res) {
		try {
			const { shippingAddress } = req.body;

			if (!shippingAddress) {
				return res.status(400).json({
					success: false,
					message: "Shipping address is required",
				});
			}

			const cart = await productCartService.updateShippingAddress(
				req.user.id,
				shippingAddress
			);

			res.json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error updating shipping address:", error);
			res.status(500).json({
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to update shipping address",
			});
		}
	}
}

module.exports = new ProductCartController();
