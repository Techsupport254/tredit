import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function PATCH(
	request: Request,
	{ params }: { params: { cartId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const cartId = params.cartId;
		if (!cartId) {
			return new NextResponse("Cart ID is required", { status: 400 });
		}

		const { shippingFee } = await request.json();
		if (typeof shippingFee !== "number" || shippingFee < 0) {
			return new NextResponse("Invalid shipping fee", { status: 400 });
		}

		// Fetch cart to check permissions
		const cart = await prisma.cart.findUnique({
			where: { id: cartId },
			include: {
				chatSession: {
					select: {
						businessId: true,
					},
				},
			},
		});

		if (!cart) {
			return new NextResponse("Cart not found", { status: 404 });
		}

		// Check if the user has access to this cart's business
		const userBusinessMembership = await prisma.businessTeamMember.findFirst({
			where: {
				userId: session.user.id,
				businessId: cart.chatSession?.businessId,
			},
		});

		if (!userBusinessMembership) {
			return new NextResponse("Unauthorized to access this cart", {
				status: 403,
			});
		}

		// Update the shipping fee
		const updatedCart = await prisma.cart.update({
			where: { id: cartId },
			data: { shippingFee },
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
								variants: true,
							},
						},
						variant: true,
						service: true,
					},
				},
				user: {
					select: {
						shippingAddress: true,
					},
				},
			},
		});

		// Calculate totals
		const subtotal = updatedCart.items.reduce((sum, item) => {
			let price = 0;
			if (item.variant?.price) {
				price = Number(item.variant.price);
			} else if (item.product?.price) {
				price = Number(item.product.price);
			} else if (item.service?.price) {
				price = Number(item.service.price);
			}
			return sum + price * item.quantity;
		}, 0);

		const total = subtotal + shippingFee;

		// Format the response
		const formattedCart = {
			id: updatedCart.id,
			items: updatedCart.items.map((item) => ({
				id: item.id,
				quantity: item.quantity,
				product: item.product
					? {
							name: item.product.name,
							price: Number(item.product.price),
							media: item.product.media,
					  }
					: undefined,
				variant: item.variant
					? {
							name: item.variant.name,
							price: Number(item.variant.price),
					  }
					: undefined,
				service: item.service
					? {
							name: item.service.name,
							price: Number(item.service.price),
					  }
					: undefined,
			})),
			subtotal,
			shippingFee,
			total,
			shippingAddress:
				updatedCart.user?.shippingAddress || updatedCart.shippingAddress,
		};

		return NextResponse.json(formattedCart);
	} catch (error) {
		console.error("[CART_SHIPPING_PATCH]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
