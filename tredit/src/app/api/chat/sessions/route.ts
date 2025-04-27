import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const prismaClient = new PrismaClient();

const createSessionSchema = z.object({
	userId: z.string().uuid("Invalid User ID"),
	businessId: z.string().uuid("Invalid Business ID"),
	cartId: z.string().uuid("Invalid Cart ID"),
});

export async function POST(request: Request) {
	let data;
	try {
		const body = await request.json();
		data = createSessionSchema.parse(body);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid input data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 }
		);
	}

	const { userId, businessId, cartId } = data;

	try {
		// Check if user, business, and cart exist (optional but recommended)
		// const userExists = await prismaClient.user.findUnique({ where: { id: userId } });
		// const businessExists = await prismaClient.business.findUnique({ where: { id: businessId } });
		// const cartExists = await prismaClient.cart.findUnique({ where: { id: cartId, userId: userId } }); // Ensure cart belongs to user
		// if (!userExists || !businessExists || !cartExists) {
		//   return NextResponse.json({ error: 'Invalid user, business, or cart ID' }, { status: 404 });
		// }

		// Find existing session for this specific cart
		let chatSession = await prismaClient.chatSession.findUnique({
			where: { cartId: cartId },
		});

		if (!chatSession) {
			// Create a new session if one doesn't exist for this cart
			// Check if a session *without* a cartId exists between this user/business? Maybe not needed if cartId is the primary trigger.
			chatSession = await prismaClient.chatSession.create({
				data: {
					userId: userId,
					businessId: businessId,
					cartId: cartId,
					status: "OPEN", // Assuming default status
				},
			});
			console.log(
				`[API] Created new ChatSession: ${chatSession.id} for cart: ${cartId}`
			);
		} else {
			console.log(
				`[API] Found existing ChatSession: ${chatSession.id} for cart: ${cartId}`
			);
		}

		return NextResponse.json(
			{ chatSessionId: chatSession.id },
			{ status: 200 }
		);
	} catch (error) {
		console.error("[API] Error finding/creating chat session:", error);
		// Check for specific Prisma errors if needed
		return NextResponse.json(
			{ error: "Failed to get or create chat session" },
			{ status: 500 }
		);
	} finally {
		// Prisma client disconnect is generally handled automatically in serverless envs
		// await prismaClient.$disconnect();
	}
}

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Get user's businesses
		const userBusinesses = await prisma.businessTeamMember.findMany({
			where: {
				userId: session.user.id,
			},
			select: {
				businessId: true,
			},
		});

		const businessIds = userBusinesses.map((b) => b.businessId);

		// Fetch chat sessions for the user's businesses
		const chatSessions = await prisma.chatSession.findMany({
			where: {
				businessId: {
					in: businessIds,
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						profileImage: true,
					},
				},
				messages: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								profileImage: true,
							},
						},
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Format the response
		const formattedSessions = chatSessions.map((session) => ({
			id: session.id,
			userId: session.userId,
			userName: session.user.name,
			userEmail: session.user.email,
			userImage: session.user.profileImage,
			lastMessageAt: session.messages[0]?.createdAt || session.updatedAt,
			lastMessage: session.messages[0]?.contentBlocks?.[0]?.content || null,
			lastMessageUser: session.messages[0]?.sender
				? {
						id: session.messages[0].sender.id,
						name: session.messages[0].sender.name,
						email: session.messages[0].sender.email,
				  }
				: null,
			status: session.status,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		}));

		return NextResponse.json(formattedSessions);
	} catch (error) {
		console.error("[CHAT_SESSIONS_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
