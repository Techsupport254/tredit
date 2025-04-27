import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: { sessionId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { sessionId } = params;

		// Verify user has access to this chat session
		const chatSession = await prisma.chatSession.findFirst({
			where: {
				id: sessionId,
				business: {
					teamMembers: {
						some: {
							userId: session.user.id,
						},
					},
				},
			},
		});

		if (!chatSession) {
			return new NextResponse("Chat session not found", { status: 404 });
		}

		// Fetch messages for the chat session
		const messages = await prisma.message.findMany({
			where: {
				chatSessionId: sessionId,
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						profileImage: true,
					},
				},
				contentBlocks: true,
				attachments: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return NextResponse.json(messages);
	} catch (error) {
		console.error("[MESSAGES_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
