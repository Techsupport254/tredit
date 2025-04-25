import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChatClient from "./ChatClient";
import NotFound from "@/app/not-found";

interface ChatPageProps {
	params: {
		slug: string;
	};
	searchParams: {
		cartId?: string;
		orderId?: string;
	};
}

async function getBusinessFromSlug(slug: string) {
	// Split the slug into name and shortId
	const parts = slug.split("-");
	const shortId = parts.pop(); // Get the last part as shortId
	const nameSlug = parts.join("-"); // Join the rest as name slug

	if (!shortId) {
		return null;
	}

	// Find the business that matches the short ID
	const business = await prisma.business.findFirst({
		where: {
			id: {
				startsWith: shortId,
			},
		},
		select: {
			id: true,
			name: true,
			description: true,
			logo: true,
			type: true,
			status: true,
			userId: true,
		},
	});

	// Verify that the business name matches the slug
	if (business) {
		const businessNameSlug = business.name
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((word) => word.length > 0)
			.slice(0, 3)
			.join("-");

		if (businessNameSlug !== nameSlug) {
			return null;
		}
	}

	return business;
}

export default async function ChatPage({
	params,
	searchParams,
}: ChatPageProps) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		redirect("/login");
	}

	const business = await getBusinessFromSlug(params.slug);

	if (!business) {
		return <NotFound />;
	}

	// Get or create chat session
	let chatSession = await prisma.chatSession.findUnique({
		where: {
			userId_businessId: {
				userId: session.user.id,
				businessId: business.id,
			},
		},
		include: {
			messages: {
				orderBy: {
					createdAt: "asc",
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							profileImage: true,
						},
					},
					receiver: {
						select: {
							id: true,
							name: true,
							profileImage: true,
						},
					},
				},
			},
		},
	});

	// If no chat session exists, create one
	if (!chatSession) {
		// Create a conversation first
		const conversation = await prisma.conversation.create({
			data: {
				type: "DIRECT",
				title: `Chat with ${business.name}`,
				participants: {
					create: [
						{
							userId: session.user.id,
							role: "MEMBER",
						},
						{
							userId: business.userId,
							role: "MEMBER",
						},
					],
				},
			},
		});

		// Create chat session
		chatSession = await prisma.chatSession.create({
			data: {
				userId: session.user.id,
				businessId: business.id,
				status: "OPEN",
			},
			include: {
				messages: {
					orderBy: {
						createdAt: "asc",
					},
					include: {
						sender: {
							select: {
								id: true,
								name: true,
								profileImage: true,
							},
						},
						receiver: {
							select: {
								id: true,
								name: true,
								profileImage: true,
							},
						},
					},
				},
			},
		});

		// Create initial system message
		let initialMessage = "Hello! How can I help you today?";
		if (searchParams.cartId) {
			initialMessage = "Hello! I have some questions about my cart.";
		} else if (searchParams.orderId) {
			initialMessage = "Hello! I have some questions about my order.";
		}

		// Create the initial message
		await prisma.message.create({
			data: {
				senderId: session.user.id,
				receiverId: business.userId,
				type: "TEXT",
				direction: "OUTGOING",
				chatSessionId: chatSession.id,
				conversationId: conversation.id,
				content: initialMessage,
				metadata: {
					cartId: searchParams.cartId,
					orderId: searchParams.orderId,
				},
			},
		});
	} else {
		// Update cart/order reference if provided
		if (searchParams.cartId || searchParams.orderId) {
			// Get the conversation for this chat session
			const conversation = await prisma.conversation.findFirst({
				where: {
					participants: {
						some: {
							userId: session.user.id,
						},
					},
				},
			});

			if (conversation) {
				// Create a new message with the updated context
				await prisma.message.create({
					data: {
						senderId: session.user.id,
						receiverId: business.userId,
						type: "TEXT",
						direction: "OUTGOING",
						chatSessionId: chatSession.id,
						conversationId: conversation.id,
						content: "Chat session updated with new context",
						metadata: {
							cartId: searchParams.cartId,
							orderId: searchParams.orderId,
						},
					},
				});
			}
		}
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ChatClient
				business={business}
				initialChatSession={chatSession}
				cartId={searchParams.cartId}
				orderId={searchParams.orderId}
			/>
		</Suspense>
	);
}
