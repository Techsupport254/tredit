import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(
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

		// Fetch cart with all necessary relations
		const cart = await prisma.cart.findUnique({
			where: { id: cartId },
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
				chatSession: {
					select: {
						businessId: true,
					},
				},
				user: {
					select: {
						shippingAddress: true,
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

		// Calculate totals
		const subtotal = cart.items.reduce((sum, item) => {
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

		const shippingFee = (cart as any).shippingFee ?? 0; // Use the value from the DB
		const total = subtotal + shippingFee;

		// Format the response
		const formattedCart = {
			id: cart.id,
			items: cart.items.map((item) => ({
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
			shippingAddress: cart.user?.shippingAddress || cart.shippingAddress,
		};

		return NextResponse.json(formattedCart);
	} catch (error) {
		console.error("[CART_GET]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
