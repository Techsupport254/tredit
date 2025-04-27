import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChatClient, { Cart } from "./ChatClient";
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

	// Fetch cart data if cartId is provided
	let cartData = null;
	if (searchParams.cartId) {
		cartData = await prisma.cart.findUnique({
			where: {
				id: searchParams.cartId,
			},
			include: {
				items: {
					include: {
						product: {
							include: {
								media: true,
							},
						},
						variant: true,
						service: true,
					},
				},
			},
		});
	}

	let chatSession = null;
	if (searchParams.cartId) {
		// Use API to get or create chat session for cart
		const res = await fetch(
			`${
				process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
			}/api/chat/sessions`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: session.user.id,
					businessId: business.id,
					cartId: searchParams.cartId,
				}),
			}
		);
		const data = await res.json();
		if (data.chatSessionId) {
			chatSession = await prisma.chatSession.findUnique({
				where: { id: data.chatSessionId },
				include: {
					messages: {
						orderBy: { createdAt: "asc" },
						include: {
							sender: { select: { id: true, name: true, profileImage: true } },
							receiver: {
								select: { id: true, name: true, profileImage: true },
							},
							contentBlocks: true,
							attachments: true,
						},
					},
				},
			});
		}
	}

	if (!chatSession) {
		// Fallback to existing logic for orderId or general chat
		chatSession = await prisma.chatSession.findFirst({
			where: {
				userId: session.user.id,
				businessId: business.id,
			},
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
					include: {
						sender: { select: { id: true, name: true, profileImage: true } },
						receiver: { select: { id: true, name: true, profileImage: true } },
						contentBlocks: true,
						attachments: true,
					},
				},
			},
		});
	}

	if (!chatSession) {
		// Create a conversation first
		const conversation = await prisma.conversation.create({
			data: {
				type: "DIRECT",
				title: `Chat with ${business.name}`,
				participants: {
					create: [
						{ userId: session.user.id, role: "MEMBER" },
						{ userId: business.userId, role: "MEMBER" },
					],
				},
			},
		});
		chatSession = await prisma.chatSession.create({
			data: {
				userId: session.user.id,
				businessId: business.id,
				status: "OPEN",
			},
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
					include: {
						sender: { select: { id: true, name: true, profileImage: true } },
						receiver: { select: { id: true, name: true, profileImage: true } },
						contentBlocks: true,
						attachments: true,
					},
				},
			},
		});
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ChatClient
				business={business}
				initialChatSession={chatSession}
				cartId={searchParams.cartId}
				orderId={searchParams.orderId}
				cartData={cartData as Cart | null}
			/>
		</Suspense>
	);
}
