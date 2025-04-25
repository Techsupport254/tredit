import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Helper function to calculate cart total, considering variant prices
const calculateTotal = (items: any[]) => {
	if (!items || !Array.isArray(items)) {
		return 0;
	}

	return items.reduce((sum, item) => {
		if (!item) {
			return sum;
		}

		let price = 0;
		// Check for variant price first
		if (
			item.variant &&
			typeof item.variant.price !== "undefined" &&
			item.variant.price !== null
		) {
			price = Number(item.variant.price);
		}
		// Fall back to product price if variant price is not available
		else if (
			item.product &&
			typeof item.product.price !== "undefined" &&
			item.product.price !== null
		) {
			price = Number(item.product.price);
		}

		return sum + price * item.quantity;
	}, 0);
};

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		let cart = await prisma.cart.findUnique({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
								variants: true,
							},
						},
						variant: {
							include: {
								product: {
									include: {
										media: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});

		if (!cart) {
			// If no cart, create one and return it empty
			cart = await prisma.cart.create({
				data: { userId: session.user.id, status: "ACTIVE" },
				include: {
					items: {
						include: {
							product: {
								include: {
									media: true,
									variants: true,
								},
							},
							variant: {
								include: {
									product: {
										include: {
											media: true,
										},
									},
								},
							},
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
			});
		}

		// Filter out items with deleted products
		const validItems = cart.items.filter((item) => item.product !== null);
		const deletedItems = cart.items.filter((item) => item.product === null);

		// If there are deleted items, remove them from the cart
		if (deletedItems.length > 0) {
			await prisma.cartItem.deleteMany({
				where: {
					id: {
						in: deletedItems.map((item) => item.id),
					},
				},
			});
		}

		const total = calculateTotal(validItems);

		// Return the full cart item structure including variant if present
		return NextResponse.json({
			cartId: cart.id,
			cart: validItems,
			total,
			deletedItems: deletedItems.length > 0 ? deletedItems.length : 0,
		});
	} catch (error) {
		console.error("Error fetching cart:", error);
		return NextResponse.json(
			{ error: "Failed to fetch cart" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { productId, quantity, variantId } = await request.json();
		const userId = session.user.id;

		if (!productId || typeof quantity !== "number" || quantity < 1) {
			return NextResponse.json(
				{ error: "Invalid product ID or quantity" },
				{ status: 400 }
			);
		}

		// Increase transaction timeout to 10 seconds
		const transactionResult = await prisma.$transaction(
			async (tx) => {
				// 1. Find or create user's cart
				let cart = await tx.cart.findUnique({ where: { userId } });
				if (!cart) {
					cart = await tx.cart.create({ data: { userId, status: "ACTIVE" } });
				}

				// 2. Check stock and get product/variant details
				let currentStock = 0;
				let productData: any;
				if (variantId) {
					productData = await tx.productVariant.findUnique({
						where: { id: variantId, productId: productId },
					});
					if (!productData) {
						throw new Error("Variant not found");
					}
					currentStock = productData.stock;
				} else {
					productData = await tx.product.findUnique({
						where: { id: productId },
					});
					if (!productData) {
						throw new Error("Product not found");
					}
					currentStock = productData.stock;
				}

				// 3. Find existing cart item
				const existingItem = await tx.cartItem.findFirst({
					where: {
						cartId: cart.id,
						productId: productId,
						variantId: variantId || null,
					},
				});

				const requestedQuantity = quantity;
				const finalQuantity = existingItem
					? existingItem.quantity + requestedQuantity
					: requestedQuantity;

				// Check if requested quantity exceeds current stock
				if (currentStock < finalQuantity) {
					throw new Error("Insufficient stock");
				}

				// 4. Update or create cart item
				if (existingItem) {
					await tx.cartItem.update({
						where: { id: existingItem.id },
						data: { quantity: finalQuantity },
					});
				} else {
					await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: productId,
							variantId: variantId || null,
							quantity: finalQuantity,
						},
					});
				}

				return { success: true };
			},
			{
				timeout: 10000, // 10 seconds timeout
			}
		);

		if (!transactionResult?.success) {
			throw new Error("Failed to update cart");
		}

		// Fetch the final cart state *after* the transaction
		const finalCart = await prisma.cart.findUnique({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
								variants: true,
							},
						},
						variant: {
							include: {
								product: {
									include: {
										media: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});

		if (!finalCart) {
			return NextResponse.json({ cart: [], total: 0 });
		}

		const total = calculateTotal(finalCart.items);
		return NextResponse.json({ cart: finalCart.items, total });
	} catch (error: any) {
		console.error("Error adding to cart:", error);
		const errorMessage =
			error instanceof Prisma.PrismaClientKnownRequestError ||
			error.message.includes("Insufficient stock") ||
			error.message.includes("not found")
				? error.message
				: "Failed to add to cart";
		return NextResponse.json(
			{ error: errorMessage },
			{
				status:
					error.message.includes("Insufficient stock") ||
					error.message.includes("not found")
						? 400
						: 500,
			}
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Expect cartItemId in the body now
		const { cartItemId } = await request.json();
		const userId = session.user.id;

		if (!cartItemId) {
			return NextResponse.json(
				{ error: "Cart Item ID missing" },
				{ status: 400 }
			);
		}

		const transactionResult = await prisma.$transaction(
			async (tx) => {
				// Verify cart ownership and find item by ID
				const itemToDelete = await tx.cartItem.findFirst({
					where: {
						id: cartItemId,
						cart: { userId: userId },
					},
				});

				if (!itemToDelete) {
					return { itemDeleted: false };
				}

				// Delete the item by its unique ID
				await tx.cartItem.delete({
					where: { id: itemToDelete.id },
				});

				return { itemDeleted: true };
			},
			{
				timeout: 10000, // 10 seconds timeout
			}
		);

		if (!transactionResult?.itemDeleted) {
			// Item was not found to delete, or another transaction error occurred
			// Fetch current cart state to return
			const currentCart = await prisma.cart.findUnique({
				where: { userId },
				include: {
					items: {
						include: {
							product: {
								include: {
									media: true,
									variants: true,
								},
							},
							variant: {
								include: {
									product: {
										include: {
											media: true,
										},
									},
								},
							},
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
			});
			const total = calculateTotal(currentCart?.items || []);
			return NextResponse.json({ cart: currentCart?.items || [], total });
		}

		// Deletion was successful, fetch the final cart state *after* the transaction
		const finalCart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
								variants: true,
							},
						},
						variant: {
							include: {
								product: {
									include: {
										media: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});

		const total = calculateTotal(finalCart?.items || []);
		return NextResponse.json({ cart: finalCart?.items || [], total });
	} catch (error: any) {
		console.error("Error removing from cart:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to remove from cart" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { cartItemId, quantity, shippingAddress } = body;
		const userId = session.user.id;

		if (shippingAddress) {
			// Update shipping address in user model
			await prisma.user.update({
				where: { id: userId },
				data: { shippingAddress },
			});

			return NextResponse.json({ success: true });
		}

		if (typeof quantity !== "number" || quantity < 1 || !cartItemId) {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}

		const transactionResult = await prisma.$transaction(async (tx) => {
			// Find the cart item by ID, ensuring it belongs to the user
			const cartItem = await tx.cartItem.findFirst({
				where: {
					id: cartItemId,
					cart: { userId: userId },
				},
				include: { product: true, variant: true }, // Include related data for stock check
			});

			if (!cartItem) throw new Error("Item not found in cart");

			const quantityDifference = quantity - cartItem.quantity;

			// Check stock IF increasing quantity
			if (quantityDifference > 0) {
				const stockToCheck = cartItem.variant
					? cartItem.variant.stock
					: cartItem.product?.stock;
				if (
					stockToCheck === null ||
					stockToCheck === undefined ||
					stockToCheck < quantityDifference
				) {
					throw new Error("Insufficient stock");
				}
			}

			// Update item quantity by its unique ID
			await tx.cartItem.update({
				where: { id: cartItem.id },
				data: { quantity: quantity },
			});

			// Stock adjustment removed as per previous requirement

			return { success: true };
		});

		if (!transactionResult?.success) throw new Error("Failed to update cart");

		// Fetch the final cart state *after* the transaction
		const finalCart = await prisma.cart.findUnique({
			where: { userId: session.user.id }, // Use userId from session
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
								variants: true,
							},
						},
						variant: {
							include: {
								product: {
									include: {
										media: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});

		if (!finalCart) {
			// This case might occur if the cart was somehow deleted between transaction and fetch
			return NextResponse.json({ cart: [], total: 0 });
		}

		const total = calculateTotal(finalCart.items);
		return NextResponse.json({ cart: finalCart.items, total });
	} catch (error: any) {
		console.error("Error updating cart:", error);
		const errorMessage =
			error instanceof Prisma.PrismaClientKnownRequestError ||
			error.message.includes("Insufficient stock") ||
			error.message.includes("not found")
				? error.message
				: "Failed to update cart";
		return NextResponse.json(
			{ error: errorMessage },
			{
				status:
					error.message.includes("Insufficient stock") ||
					error.message.includes("not found")
						? 400
						: 500,
			}
		);
	}
}
