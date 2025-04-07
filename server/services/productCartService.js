const { db } = require("../models");
const { Op } = require("sequelize");

const {
	ProductCart,
	ProductCartItem,
	Product,
	User,
	Business,
	BusinessTeamMember,
	ProductVariant,
	sequelize,
} = db;

class ProductCartService {
	/**
	 * Get or create cart for user
	 * @param {string} userId - User ID
	 * @returns {Promise<Object>} Cart object
	 */
	async getOrCreateCart(userId) {
		try {
			console.log("Getting cart for user:", userId);

			// First try to find an existing cart
			let cart = await ProductCart.findOne({
				where: { userId, status: "active" },
				include: [
					{
						model: ProductCartItem,
						as: "items",
						include: [
							{
								model: Product,
								as: "product",
								include: [
									{
										model: Business,
										as: "business",
									},
								],
							},
						],
					},
				],
			});

			if (!cart) {
				// Create a new cart with a default business ID
				// We'll update this when the first item is added
				const defaultBusiness = await Business.findOne();
				if (!defaultBusiness) {
					throw new Error("No business found in the system");
				}

				cart = await ProductCart.create({
					userId,
					businessId: defaultBusiness.id, // Set a default business ID
					status: "active",
					subtotal: 0,
					tax: 0,
					shippingCost: 0,
					discount: 0,
					discountValue: 0,
					totalAmount: 0,
					currency: "USD",
					requiresShipping: true,
					lastActivity: new Date(),
					metadata: {},
				});
				console.log("Created new cart:", cart.id);
			}

			// Get cart items separately with all necessary associations
			const items = await ProductCartItem.findAll({
				where: { cartId: cart.id },
				include: [
					{
						model: Product,
						as: "product",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
					{
						model: ProductVariant,
						as: "variant",
					},
					{
						model: Business,
						as: "business",
					},
				],
			});

			// If we have items, ensure the cart's businessId matches the first item's business
			if (items.length > 0 && items[0].product?.business?.id) {
				const firstItemBusinessId = items[0].product.business.id;
				if (cart.businessId !== firstItemBusinessId) {
					await cart.update({ businessId: firstItemBusinessId });
				}
			}

			// Attach items to cart
			cart.setDataValue("items", items);

			// Calculate totals before returning
			await cart.calculateTotals();

			return cart;
		} catch (error) {
			console.error("Error getting/creating cart:", error);
			throw error;
		}
	}

	/**
	 * Add item to cart
	 * @param {string} cartId - Cart ID
	 * @param {string} productId - Product ID
	 * @param {string} variantId - Variant ID (optional)
	 * @param {number} quantity - Quantity
	 * @param {Object} customizations - Customizations (optional)
	 * @returns {Promise<Object>} Cart item object
	 */
	async addItemToCart(
		cartId,
		productId,
		variantId,
		quantity,
		customizations = null
	) {
		const t = await sequelize.transaction();

		try {
			// Get product with business info
			const product = await Product.findByPk(productId, {
				include: [
					{
						model: Business,
						as: "business",
					},
				],
			});

			if (!product) {
				throw new Error("Product not found");
			}

			// Get variant if specified
			let variant = null;
			if (variantId) {
				variant = await ProductVariant.findByPk(variantId);
				if (!variant) {
					throw new Error("Product variant not found");
				}
			}

			// Check stock
			const stockQuantity = variant
				? variant.stockQuantity
				: product.stockQuantity;
			if (stockQuantity < quantity) {
				throw new Error("Insufficient stock");
			}

			// Get cart
			const cart = await ProductCart.findByPk(cartId);
			if (!cart) {
				throw new Error("Cart not found");
			}

			// If this is the first item, update cart's businessId
			const existingItems = await ProductCartItem.count({ where: { cartId } });
			if (existingItems === 0) {
				await cart.update(
					{ businessId: product.business.id },
					{ transaction: t }
				);
			} else {
				// Check if the item's business matches the cart's business
				if (cart.businessId !== product.business.id) {
					throw new Error(
						"Cannot add items from different businesses to the same cart"
					);
				}
			}

			// Create cart item
			const cartItem = await ProductCartItem.create(
				{
					cartId,
					productId,
					variantId,
					businessId: product.business.id,
					quantity,
					unitPrice: variant ? variant.price : product.price,
					subtotal: quantity * (variant ? variant.price : product.price),
					customizations,
					tax: product.tax || { rate: 0, exempt: false, exemptRegions: [] },
					selectedOptions: {},
					isActive: true,
				},
				{ transaction: t }
			);

			await t.commit();

			// Return cart item with associations
			return ProductCartItem.findByPk(cartItem.id, {
				include: [
					{
						model: Product,
						as: "product",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
					{
						model: ProductVariant,
						as: "variant",
					},
					{
						model: Business,
						as: "business",
					},
				],
			});
		} catch (error) {
			await t.rollback();
			throw error;
		}
	}

	/**
	 * Update cart item quantity
	 * @param {string} itemId - Cart item ID
	 * @param {number} quantity - New quantity
	 * @returns {Promise<Object>} Updated cart item
	 */
	async updateCartItemQuantity(itemId, quantity) {
		try {
			const item = await ProductCartItem.findOne({
				where: { id: itemId },
				include: [
					{
						model: ProductVariant,
						as: "variant",
					},
				],
			});

			if (!item) {
				throw new Error("Item not found in cart");
			}

			// Check stock availability
			if (item.variant.stockQuantity < quantity) {
				throw new Error("Insufficient stock");
			}

			await item.update({
				quantity,
				subtotal: quantity * item.unitPrice,
			});

			return item;
		} catch (error) {
			console.error("Error updating cart item quantity:", error);
			throw error;
		}
	}

	/**
	 * Remove item from cart
	 * @param {string} itemId - Cart item ID
	 * @returns {Promise<void>}
	 */
	async removeItemFromCart(itemId) {
		try {
			const item = await ProductCartItem.findOne({
				where: { id: itemId },
			});

			if (!item) {
				throw new Error("Item not found in cart");
			}

			await item.destroy();
		} catch (error) {
			console.error("Error removing item from cart:", error);
			throw error;
		}
	}

	/**
	 * Clear cart
	 * @param {string} userId - User ID
	 * @returns {Promise<void>}
	 */
	async clearCart(userId) {
		try {
			const cart = await ProductCart.findOne({
				where: { userId },
			});

			if (cart) {
				await ProductCartItem.destroy({ where: { cartId: cart.id } });
			}
		} catch (error) {
			console.error("Error clearing cart:", error);
			throw error;
		}
	}

	/**
	 * Apply coupon to cart
	 * @param {string} userId - User ID
	 * @param {string} couponCode - Coupon code
	 * @returns {Promise<Object>} Updated cart with applied coupon
	 */
	async applyCoupon(userId, couponCode) {
		try {
			const cart = await ProductCart.findOne({
				where: { userId },
			});

			if (!cart) {
				throw new Error("Cart not found");
			}

			await cart.update({ couponCode });
			return this.getOrCreateCart(userId);
		} catch (error) {
			console.error("Error applying coupon:", error);
			throw error;
		}
	}

	async updateShippingAddress(userId, shippingAddress) {
		try {
			const cart = await this.getOrCreateCart(userId);
			await cart.update({ shippingAddress });
			await cart.calculateTotals();
			return cart;
		} catch (error) {
			console.error("Error updating shipping address:", error);
			throw error;
		}
	}

	async updateCart(cartId, updates) {
		try {
			const cart = await ProductCart.findByPk(cartId);
			if (!cart) {
				throw new Error("Cart not found");
			}

			await cart.update(updates);
			await cart.calculateTotals();

			return cart;
		} catch (error) {
			console.error("Error updating cart:", error);
			throw error;
		}
	}
}

module.exports = new ProductCartService();
