import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const body = await req.json();
		const { businessId, content, receiverId, attachments = [] } = body;

		// Create message
		const message = await prisma.message.create({
			data: {
				senderId: session.user.id,
				receiverId,
				businessId,
				content,
				type: "TEXT",
				direction: "OUTGOING",
				status: "SENT",
				contentBlocks: [
					{
						type: "TEXT",
						content,
						order: 0,
					},
				],
				metadata: {
					isTeamMessage: true,
					teamMemberId: session.user.id,
				},
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						profileImage: true,
					},
				},
			},
		});

		return NextResponse.json(message);
	} catch (error) {
		console.error("[TEAM_MESSAGES_POST]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
