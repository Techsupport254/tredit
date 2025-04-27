import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: { businessId: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { businessId } = params;

		// Verify user has access to this business
		const business = await prisma.business.findFirst({
			where: {
				id: businessId,
				teamMembers: {
					some: {
						userId: session.user.id,
					},
				},
			},
		});

		if (!business) {
			return new NextResponse("Business not found", { status: 404 });
		}

		// Fetch chat sessions for the business
		const chatSessions = await prisma.chatSession.findMany({
			where: {
				businessId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						profileImage: true,
					},
				},
				messages: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
					include: {
						attachments: true,
						contentBlocks: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Format the response
		const formattedSessions = chatSessions.map((session) => {
			const lastMsg = session.messages[0];
			let lastMessageContent = null;

			if (lastMsg) {
				if (lastMsg.type === "FILE") {
					lastMessageContent = "[File Attachment]"; // Indicate file type
				} else {
					lastMessageContent = lastMsg.contentBlocks?.[0]?.content || null;
				}
			}

			return {
				id: session.id,
				userId: session.userId,
				userName: session.user.name,
				userImage: session.user.profileImage,
				lastMessageAt: lastMsg?.createdAt || session.updatedAt,
				lastMessage: lastMessageContent, // Use the determined content
				lastMessageAttachments: lastMsg?.attachments || [],
				status: session.status,
				createdAt: session.createdAt,
				updatedAt: session.updatedAt,
				cartId: session.cartId, // Include cartId for routing
			};
		});

		return NextResponse.json(formattedSessions);
	} catch (error) {
		console.error("[CHAT_SESSIONS_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
