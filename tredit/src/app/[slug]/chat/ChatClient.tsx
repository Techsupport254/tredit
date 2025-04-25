"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import {
	Input,
	Button,
	Avatar,
	Typography,
	Space,
	Divider,
	Upload,
	Tooltip,
	Badge,
	Popover,
	List,
	message,
} from "antd";
import {
	SendOutlined,
	ShoppingCartOutlined,
	PaperClipOutlined,
	SmileOutlined,
	SearchOutlined,
	LoadingOutlined,
	ArrowLeftOutlined,
	MessageOutlined,
	ShoppingOutlined,
	UserOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import { Message, MessageStatus, MessageType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useCart } from "@/lib/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadFile } from "antd/es/upload/interface";
import { getSocket } from "@/lib/socket";

const { Text, Title } = Typography;

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface ChatClientProps {
	business: Business;
	initialChatSession: any;
	cartId?: string;
	orderId?: string;
}

export default function ChatClient({
	business,
	initialChatSession,
	cartId,
	orderId,
}: ChatClientProps) {
	const { data: session } = useSession();
	const [messages, setMessages] = useState<Message[]>(
		initialChatSession?.messages || []
	);
	const [newMessage, setNewMessage] = useState("");
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(1);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const { items, shippingAddress, shippingFee, total } = useCart();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (!session?.user?.id) {
			console.log(
				"[Socket Client] No user session, skipping socket connection"
			);
			return;
		}

		console.log("[Socket Client] Initializing socket connection...");

		const socket = getSocket();
		if (!socket) {
			console.error("[Socket Client] Failed to initialize socket");
			return;
		}

		// Set up socket event handlers
		function onConnect() {
			console.log("[Socket Client] Connected to socket server:", {
				socketId: socket.id,
				transport: socket.io.engine.transport.name,
			});

			// Join the chat room
			socket.emit("join_chat", {
				chatSessionId: initialChatSession.id,
				userId: session.user.id,
				businessId: business.id,
			});
		}

		function onDisconnect(reason: string) {
			console.log("[Socket Client] Disconnected from socket server:", {
				reason,
				socketId: socket.id,
			});
		}

		function onError(error: Error) {
			console.error("[Socket Client] Socket error:", {
				error: error.message,
				socketId: socket.id,
			});
		}

		function onNewMessage(message: Message) {
			console.log("[Socket Client] Received new message:", message);
			setMessages((prev) => [...prev, message]);
		}

		function onMessageStatus(messageId: string, status: MessageStatus) {
			console.log("[Socket Client] Message status update:", {
				messageId,
				status,
			});
			setMessages((prev) =>
				prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
			);
		}

		function onTyping(data: { userId: string; isTyping: boolean }) {
			if (data.userId !== session.user.id) {
				setIsTyping(data.isTyping);
			}
		}

		try {
			// Set up socket event listeners
			socket.on("connect", onConnect);
			socket.on("disconnect", onDisconnect);
			socket.on("error", onError);
			socket.on("new_message", onNewMessage);
			socket.on("message_status", onMessageStatus);
			socket.on("typing", onTyping);

			// Handle reconnection events
			if (socket.io) {
				socket.io.on("reconnect_attempt", (attempt) => {
					console.log("[Socket Client] Reconnection attempt:", {
						attempt,
						transport: socket.io.engine.transport.name,
					});
				});

				socket.io.on("reconnect", (attempt) => {
					console.log("[Socket Client] Reconnected:", {
						attempt,
						transport: socket.io.engine.transport.name,
					});

					// Rejoin the chat room after reconnection
					socket.emit("join_chat", {
						chatSessionId: initialChatSession.id,
						userId: session.user.id,
						businessId: business.id,
					});
				});

				socket.io.on("reconnect_error", (error) => {
					console.error("[Socket Client] Reconnection error:", {
						error: error instanceof Error ? error.message : "Unknown error",
						transport: socket.io.engine.transport.name,
					});
				});

				socket.io.on("reconnect_failed", () => {
					console.error("[Socket Client] Reconnection failed");
				});
			}

			// Set socket instance
			setSocket(socket);

			// Connect if not already connected
			if (!socket.connected) {
				console.log("[Socket Client] Attempting to connect socket...");
				socket.connect();
			}
		} catch (error) {
			console.error("[Socket Client] Error initializing socket:", error);
		}

		// Cleanup
		return () => {
			console.log("[Socket Client] Cleaning up socket connection...");
			try {
				socket.off("connect", onConnect);
				socket.off("disconnect", onDisconnect);
				socket.off("error", onError);
				socket.off("new_message", onNewMessage);
				socket.off("message_status", onMessageStatus);
				socket.off("typing", onTyping);

				if (socket.io) {
					socket.io.off("reconnect_attempt");
					socket.io.off("reconnect");
					socket.io.off("reconnect_error");
					socket.io.off("reconnect_failed");
				}

				// Leave the chat room
				socket.emit("leave_chat", {
					chatSessionId: initialChatSession.id,
					userId: session.user.id,
					businessId: business.id,
				});
			} catch (error) {
				console.error("[Socket Client] Error cleaning up socket:", error);
			}
		};
	}, [session?.user?.id, initialChatSession.id, business.id]);

	useEffect(() => {
		// Scroll to bottom when messages change
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!newMessage.trim() || !socket || !initialChatSession) return;

		const messageData = {
			content: newMessage,
			senderId: session?.user?.id,
			receiverId: business.id,
			chatSessionId: initialChatSession.id,
			type: MessageType.TEXT,
			status: MessageStatus.SENT,
		};

		try {
			// Emit the message to the server
			socket.emit("send_message", messageData);

			// Optimistically add the message to the UI
			setMessages((prev) => [
				...prev,
				{
					...messageData,
					id: `temp-${Date.now()}`,
					createdAt: new Date(),
					updatedAt: new Date(),
				} as Message,
			]);

			// Clear the input
			setNewMessage("");

			// Clear typing indicator
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
			socket.emit("typing", {
				chatSessionId: initialChatSession.id,
				userId: session?.user?.id,
				isTyping: false,
			});
		} catch (error) {
			console.error("[Socket Client] Error sending message:", error);
			message.error("Failed to send message. Please try again.");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleTyping = () => {
		if (!socket || !initialChatSession) return;

		// Clear existing timeout
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		// Emit typing event
		socket.emit("typing", {
			chatSessionId: initialChatSession.id,
			userId: session?.user?.id,
			isTyping: true,
		});

		// Set new timeout to clear typing status
		const timeout = setTimeout(() => {
			socket.emit("typing", {
				chatSessionId: initialChatSession.id,
				userId: session?.user?.id,
				isTyping: false,
			});
		}, 2000);

		setTypingTimeout(timeout);
	};

	const handleFileUpload = async (file: UploadFile) => {
		if (!socket || !initialChatSession) return;

		try {
			// Create a temporary URL for the file
			const fileUrl = file.originFileObj
				? URL.createObjectURL(file.originFileObj)
				: null;

			if (!fileUrl) {
				console.error(
					"[Chat Client] Failed to create object URL for file:",
					file
				);
				message.error("Failed to upload file. Please try again.");
				return;
			}

			const messageData = {
				content: file.name,
				senderId: session?.user?.id,
				receiverId: business.id,
				chatSessionId: initialChatSession.id,
				conversationId: initialChatSession.id,
				type: "FILE",
				direction: "OUTGOING",
				attachments: [
					{
						type: file.type || "application/octet-stream",
						url: fileUrl,
						filename: file.name,
						size: file.size,
					},
				],
			};

			socket.emit("send-message", messageData);

			// Clean up the temporary URL after a delay
			setTimeout(() => {
				URL.revokeObjectURL(fileUrl);
			}, 1000);
		} catch (error) {
			console.error("[Chat Client] Error uploading file:", error);
			message.error("Failed to upload file. Please try again.");
		}
	};

	const handleReaction = (messageId: string, emoji: string) => {
		if (!socket) return;
		socket.emit("add-reaction", { messageId, emoji });
	};

	const handleSearch = (value: string) => {
		setSearchQuery(value);
		// Here you would typically make an API call to search messages
		// For now, we'll just filter the existing messages
		const filtered = messages.filter((msg) =>
			msg.content.toLowerCase().includes(value.toLowerCase())
		);
		setMessages(filtered);
	};

	const loadMoreMessages = async () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		// Here you would typically make an API call to load more messages
		// For now, we'll just simulate loading more
		setTimeout(() => {
			setIsLoadingMore(false);
			setHasMore(false);
		}, 1000);
	};

	const getStatusIcon = (status: MessageStatus) => {
		switch (status) {
			case "SENT":
				return <CheckCircleOutlined className="text-gray-400" />;
			case "DELIVERED":
				return <CheckCircleOutlined className="text-blue-400" />;
			case "READ":
				return <CheckCircleOutlined className="text-green-400" />;
			default:
				return null;
		}
	};

	const getContextLabel = () => {
		if (cartId) return "Cart Support";
		if (orderId) return "Order Support";
		return "Customer Support";
	};

	const getContextButton = () => {
		if (cartId) {
			return (
				<Button
					type="primary"
					onClick={() => router.push(`/${business.id}/cart`)}
				>
					View Cart
				</Button>
			);
		}
		if (orderId) {
			return (
				<Button
					type="primary"
					onClick={() => router.push(`/${business.id}/orders/${orderId}`)}
				>
					View Order
				</Button>
			);
		}
		return null;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-KE", {
			style: "currency",
			currency: "KES",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto">
				<div className="flex gap-4 p-4">
					{/* Sidebar */}
					<div className="w-80 flex-shrink-0">
						<div className="bg-white rounded-lg shadow-sm overflow-hidden">
							{/* Navigation */}
							<div className="p-4 border-b border-gray-200">
								<nav className="space-y-2">
									<Button
										block
										icon={<MessageOutlined />}
										className="text-left hover:bg-blue-50"
										onClick={() => router.push(`/${business.id}/messages`)}
									>
										Messages
									</Button>
									<Button
										block
										icon={<ShoppingOutlined />}
										className="text-left hover:bg-blue-50"
										onClick={() => router.push(`/${business.id}/orders`)}
									>
										Orders
									</Button>
									<Button
										block
										icon={<UserOutlined />}
										className="text-left hover:bg-blue-50"
										onClick={() => router.push(`/${business.id}/profile`)}
									>
										Profile
									</Button>
								</nav>
							</div>

							{/* Order/Cart Summary */}
							<div className="p-4">
								<Text strong className="text-lg mb-4 block">
									{getContextLabel()}
								</Text>
								{cartId && (
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<Text type="secondary">Items in Cart</Text>
											<Text strong>{items.length}</Text>
										</div>
										<div className="flex justify-between items-center">
											<Text type="secondary">Subtotal</Text>
											<Text strong>{formatCurrency(total)}</Text>
										</div>
										<div className="flex justify-between items-center">
											<Text type="secondary">Shipping Fee</Text>
											<Text strong>
												{shippingFee
													? formatCurrency(shippingFee)
													: "To be determined"}
											</Text>
										</div>
										<Divider className="my-2" />
										<div className="flex justify-between items-center">
											<Text strong>Total</Text>
											<Text strong className="text-lg text-blue-600">
												{formatCurrency((total || 0) + (shippingFee || 0))}
											</Text>
										</div>
										<div className="space-y-2">
											<Text type="secondary" className="block">
												Shipping Address
											</Text>
											<Text className="text-sm">
												{shippingAddress || "No address provided"}
											</Text>
										</div>
										<Button
											type="primary"
											block
											className="bg-blue-600 hover:bg-blue-700"
											onClick={() => router.push(`/${business.id}/cart`)}
										>
											View Cart
										</Button>
									</div>
								)}
								{orderId && (
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<Text type="secondary">Order ID</Text>
											<Text strong>{orderId}</Text>
										</div>
										<div className="flex justify-between items-center">
											<Text type="secondary">Status</Text>
											<Text strong>Processing</Text>
										</div>
										<div className="flex justify-between items-center">
											<Text type="secondary">Shipping Fee</Text>
											<Text strong>
												{shippingFee
													? formatCurrency(shippingFee)
													: "To be determined"}
											</Text>
										</div>
										<Divider className="my-2" />
										<div className="flex justify-between items-center">
											<Text strong>Total</Text>
											<Text strong className="text-lg text-blue-600">
												{formatCurrency((total || 0) + (shippingFee || 0))}
											</Text>
										</div>
										<div className="space-y-2">
											<Text type="secondary" className="block">
												Shipping Address
											</Text>
											<Text className="text-sm">
												{shippingAddress || "No address provided"}
											</Text>
										</div>
										<Button
											type="primary"
											block
											className="bg-blue-600 hover:bg-blue-700"
											onClick={() =>
												router.push(`/${business.id}/orders/${orderId}`)
											}
										>
											View Order
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Chat Area */}
					<div className="flex-1">
						<div className="bg-white rounded-lg shadow-sm overflow-hidden">
							{/* Search */}
							<div className="bg-white border-b border-gray-200 p-4">
								<Input
									prefix={<SearchOutlined />}
									placeholder="Search messages..."
									value={searchQuery}
									onChange={(e) => handleSearch(e.target.value)}
									allowClear
								/>
							</div>

							{/* Messages */}
							<div
								ref={messagesContainerRef}
								className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4"
								onScroll={(e) => {
									const target = e.target as HTMLDivElement;
									if (target.scrollTop === 0) {
										loadMoreMessages();
									}
								}}
							>
								{isLoadingMore && (
									<div className="flex justify-center py-2">
										<LoadingOutlined className="text-2xl text-gray-400" />
									</div>
								)}
								{messages.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full text-center p-8">
										<MessageOutlined className="text-6xl text-gray-300 mb-4" />
										<Title level={4} className="!mb-2">
											No messages yet
										</Title>
										<Text type="secondary" className="max-w-md">
											Start a conversation with {business.name}. They typically
											respond within 24 hours.
										</Text>
										<div className="mt-6 space-y-4">
											<div className="flex items-center gap-2 text-gray-500">
												<CheckCircleOutlined />
												<Text>Secure messaging</Text>
											</div>
											<div className="flex items-center gap-2 text-gray-500">
												<CheckCircleOutlined />
												<Text>Real-time updates</Text>
											</div>
											<div className="flex items-center gap-2 text-gray-500">
												<CheckCircleOutlined />
												<Text>File sharing support</Text>
											</div>
										</div>
									</div>
								) : (
									messages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.senderId === session?.user?.id
													? "justify-end"
													: "justify-start"
											}`}
										>
											<div
												className={`max-w-[70%] rounded-lg p-3 ${
													message.senderId === session?.user?.id
														? "bg-blue-600 text-white"
														: "bg-white border border-gray-200"
												}`}
											>
												{message.type === "FILE" &&
													message.attachments?.[0] && (
														<div className="mb-2">
															<a
																href={message.attachments[0].url}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
															>
																<PaperClipOutlined />
																<span>{message.attachments[0].filename}</span>
															</a>
														</div>
													)}
												<Text
													className={
														message.senderId === session?.user?.id
															? "text-white"
															: "text-gray-800"
													}
												>
													{message.content}
												</Text>
												<div className="flex items-center justify-between mt-1">
													<Text
														type="secondary"
														className={`text-xs ${
															message.senderId === session?.user?.id
																? "text-blue-200"
																: "text-gray-500"
														}`}
													>
														{formatDistanceToNow(new Date(message.createdAt), {
															addSuffix: true,
														})}
													</Text>
													{message.senderId === session?.user?.id && (
														<div className="flex items-center space-x-1">
															{getStatusIcon(message.status)}
															<Popover
																content={
																	<List
																		size="small"
																		dataSource={message.reactions || []}
																		renderItem={(reaction) => (
																			<List.Item>
																				<span>{reaction.emoji}</span>
																			</List.Item>
																		)}
																	/>
																}
																trigger="click"
															>
																<Button
																	type="text"
																	size="small"
																	icon={<SmileOutlined />}
																	onClick={() =>
																		handleReaction(message.id, "👍")
																	}
																/>
															</Popover>
														</div>
													)}
												</div>
											</div>
										</div>
									))
								)}
								{isTyping && (
									<div className="flex justify-start">
										<div className="bg-white border border-gray-200 rounded-lg p-3">
											<Text type="secondary" className="text-sm">
												{business.name} is typing...
											</Text>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							{/* Input */}
							<div className="bg-white border-t border-gray-200 p-4">
								<div className="flex items-center space-x-4">
									<Upload
										showUploadList={false}
										beforeUpload={(file) => {
											handleFileUpload(file);
											return false;
										}}
									>
										<Button
											type="text"
											icon={<PaperClipOutlined />}
											className="text-gray-500 hover:text-gray-700"
										/>
									</Upload>
									<Input.TextArea
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder="Type your message..."
										autoSize={{ minRows: 1, maxRows: 4 }}
										className="flex-1"
									/>
									<Button
										type="primary"
										icon={<SendOutlined />}
										onClick={handleSendMessage}
										disabled={!newMessage.trim()}
										className="bg-blue-600 hover:bg-blue-700"
									>
										Send
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
