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
	Tag,
	Card,
	Spin,
	Image as AntImage,
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
	FileOutlined,
	FileImageOutlined,
	WarningOutlined,
	InfoCircleOutlined,
	ShopOutlined,
	CloseOutlined,
} from "@ant-design/icons";
import {
	Message,
	MessageStatus,
	MessageType,
	MessageDirection,
	MessageEncryption,
	Prisma,
	ContentType,
} from "@prisma/client";
import { formatDistanceToNow, format, isBefore, subHours } from "date-fns";
import { useCart } from "@/lib/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadFile } from "antd/es/upload/interface";
import { getSocket } from "@/lib/socket";
import { Message as MessageComponent } from "@/components/Message";

const { Text, Title } = Typography;
const { Paragraph } = Typography;

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface TeamMember {
	id: string;
	name: string;
	email: string;
	role: string;
	profileImage?: string | null;
	status: string;
	isOnline?: boolean;
}

interface CartItem {
	id: string;
	product?: {
		id: string;
		name: string;
		price: number;
		media: { url: string }[];
	};
	variant?: {
		id: string;
		name: string;
		price: number;
	};
	service?: {
		id: string;
		name: string;
		price: number;
	};
	quantity: number;
}

export interface Cart {
	id: string;
	items: CartItem[];
	shippingAddress?: string;
}

export interface ChatClientProps {
	business: Business;
	initialChatSession: any;
	cartId?: string;
	orderId?: string;
	cartData: Cart | null;
}

type MessageWithContent = Message & {
	contentBlocks: {
		type: ContentType;
		content: string;
		order: number;
	}[];
};

export default function ChatClient({
	business,
	initialChatSession,
	cartId,
	orderId,
	cartData,
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
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const { items, shippingAddress, total, updateShippingAddress } = useCart();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoadingAddress, setIsLoadingAddress] = useState(true);
	const [connectionStatus, setConnectionStatus] = useState("connecting");
	const [tempMessageMap, setTempMessageMap] = useState<Map<string, string>>(
		new Map()
	);
	const [chatHistory, setChatHistory] = useState<any[]>([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [fileToSend, setFileToSend] = useState<File | null>(null);
	const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [selectedConversationId, setSelectedConversationId] = useState("");

	// Fetch team members
	useEffect(() => {
		const fetchTeamMembers = async () => {
			try {
				const response = await fetch(`/api/business/${business.id}/team`);
				if (response.ok) {
					const data = await response.json();
					console.log("[Chat Client] Fetched team members data:", data);
					setTeamMembers(data);
				} else {
					console.error(
						"[Chat Client] Failed to fetch team members:",
						response.status,
						response.statusText
					);
				}
			} catch (error) {
				console.error("[Chat Client] Error fetching team members:", error);
			}
		};

		fetchTeamMembers();
	}, [business.id]);

	// Fetch shipping address
	useEffect(() => {
		const fetchShippingAddress = async () => {
			try {
				const response = await fetch("/api/user/shipping-address");
				if (response.ok) {
					const data = await response.json();
					// Update shipping address through useCart
					if (data.shippingAddress) {
						updateShippingAddress(data.shippingAddress);
					}
				}
			} catch (error) {
				console.error("Error fetching shipping address:", error);
			} finally {
				setIsLoadingAddress(false);
			}
		};

		fetchShippingAddress();
	}, []);

	// Use a ref for the socket to ensure singleton and avoid re-attachment
	const socketRef = useRef<Socket | null>(null);

	// Attach listeners only once on mount
	useEffect(() => {
		const currentSocket = getSocket();
		socketRef.current = currentSocket;
		setSocket(currentSocket);

		if (!currentSocket) {
			console.error("Socket initialization failed!");
			setConnectionStatus("error");
			return;
		}

		function onConnect() {
			setConnectionStatus("connected");
			if (currentSocket) {
				console.log("[Socket Client] Connected to socket server:", {
					socketId: currentSocket.id,
					transport: currentSocket.io.engine.transport.name,
				});
				// Always join the chat room on connect
				currentSocket.emit("join_chat", {
					chatSessionId: initialChatSession.id,
					userId: session?.user?.id,
					businessId: business.id,
				});
			}
		}
		function onDisconnect(reason: string) {
			setConnectionStatus("disconnected");
			if (currentSocket) {
				console.log("[Socket Client] Disconnected from socket server:", {
					reason,
					socketId: currentSocket.id,
				});
			}
		}
		function onError(error: Error) {
			if (currentSocket) {
				console.error("[Socket Client] Socket error:", {
					error: error.message,
					socketId: currentSocket.id,
				});
			}
		}
		function onNewMessage(message: any) {
			console.log("[Socket Client] Received new message:", message);
			setMessages((prev) => {
				const tempId =
					message.metadata && typeof message.metadata === "object"
						? (message.metadata as any)?._tempId
						: undefined;
				const tempIndex = tempId
					? prev.findIndex(
							(m) =>
								m.metadata &&
								typeof m.metadata === "object" &&
								(m.metadata as any)?._tempId === tempId
					  )
					: -1;
				if (tempIndex !== -1) {
					const newMessages = [...prev];
					newMessages[tempIndex] = message;
					return newMessages;
				}
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});
		}
		function onMessageStatusUpdate(data: {
			messageId: string | { messageId: string };
			status: MessageStatus;
			tempId?: string;
		}) {
			console.log("[Socket Client] Message status update:", data);
			const messageId =
				typeof data.messageId === "object"
					? data.messageId.messageId
					: data.messageId;
			setMessages((prev) =>
				prev.map((msg) => {
					const tempId =
						msg.metadata && typeof msg.metadata === "object"
							? (msg.metadata as any)?._tempId
							: undefined;
					if (msg.id === messageId || (data.tempId && tempId === data.tempId)) {
						return {
							...msg,
							status: data.status,
							id: messageId,
							metadata: {
								...(typeof msg.metadata === "object" && msg.metadata !== null
									? msg.metadata
									: {}),
								_isLoading: false,
							},
						};
					}
					return msg;
				})
			);
		}

		if (currentSocket) {
			currentSocket.on("connect", onConnect);
			currentSocket.on("disconnect", onDisconnect);
			currentSocket.on("error", onError);
			currentSocket.on("new_message", onNewMessage);
			currentSocket.on("message_status_update", onMessageStatusUpdate);
		}

		return () => {
			console.log("[Socket Client] Cleaning up socket connection...");
			if (!currentSocket) return;
			currentSocket.off("connect", onConnect);
			currentSocket.off("disconnect", onDisconnect);
			currentSocket.off("error", onError);
			currentSocket.off("new_message", onNewMessage);
			currentSocket.off("message_status_update", onMessageStatusUpdate);
			currentSocket.emit("leave_chat", {
				chatSessionId: initialChatSession.id,
				userId: session?.user?.id,
				businessId: business.id,
			});
		};
	}, [session?.user?.id, initialChatSession.id, business.id]);

	// Real-time new_message and message_status_update listeners
	useEffect(() => {
		if (!socket) return;
		function onNewMessage(message: any) {
			setMessages((prev) => {
				// Replace temp message if _tempId matches
				const incomingTempId =
					typeof message.metadata === "object" &&
					message.metadata !== null &&
					"_tempId" in message.metadata
						? (message.metadata as any)._tempId
						: undefined;
				if (incomingTempId) {
					const idx = prev.findIndex(
						(m) =>
							typeof m.metadata === "object" &&
							m.metadata !== null &&
							"_tempId" in m.metadata &&
							(m.metadata as any)._tempId === incomingTempId
					);
					if (idx !== -1) {
						const newArr = [...prev];
						newArr[idx] = message;
						console.log("[Socket] Replaced temp message with real:", message);
						return newArr;
					}
				}
				// Only add if not already present
				if (prev.some((m) => m.id === message.id)) return prev;
				console.log("[Socket] Added new message:", message);
				return [...prev, message];
			});
		}
		function onMessageStatusUpdate(data: any) {
			setMessages((prev) =>
				prev.map((msg) => {
					const tempId =
						typeof msg.metadata === "object" &&
						msg.metadata !== null &&
						"_tempId" in msg.metadata
							? (msg.metadata as any)._tempId
							: undefined;
					if (
						msg.id === data.messageId ||
						(data.tempId && tempId === data.tempId)
					) {
						console.log("[Socket] Updated message status:", data);
						return {
							...msg,
							status: data.status,
							id: data.messageId,
							metadata: {
								...(typeof msg.metadata === "object" && msg.metadata !== null
									? msg.metadata
									: {}),
								_isLoading: false,
							},
						};
					}
					return msg;
				})
			);
		}
		socket.on("new_message", onNewMessage);
		socket.on("message_status_update", onMessageStatusUpdate);
		return () => {
			socket.off("new_message", onNewMessage);
			socket.off("message_status_update", onMessageStatusUpdate);
		};
	}, [socket]);

	useEffect(() => {
		if (messages.length === 0) return;
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Helper function to upload file and send message data
	const uploadFileAndSendMessage = async (
		file: File,
		textContent: string | null, // Added text content
		tempMessageId: string
	) => {
		if (!socket || !session?.user?.id) {
			console.error("[Upload Helper] Socket or session missing.");
			// Update temp message to failed
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempMessageId
						? {
								...msg,
								status: MessageStatus.FAILED,
								metadata: {
									...(typeof msg.metadata === "object" && msg.metadata !== null
										? msg.metadata
										: {}),
									_isLoading: false,
								},
						  }
						: msg
				)
			);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("file", file, file.name);

			const uploadResponse = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(
					errorData.error || `Upload failed: ${uploadResponse.statusText}`
				);
			}

			const attachmentData = await uploadResponse.json();
			console.log(
				"[Upload Helper] File uploaded, received data:",
				attachmentData
			);

			// Prepare socket message data (including text content if provided)
			const socketMessageData = {
				chatSessionId: initialChatSession.id,
				senderId: session.user.id,
				// IMPORTANT: Send text content if available. Backend needs to handle this.
				content: textContent || attachmentData.name, // Prioritize actual text message
				type: MessageType.FILE,
				attachment: {
					type: attachmentData.type,
					url: attachmentData.url,
					filename: attachmentData.name,
					size: attachmentData.size,
					ipfsHash: attachmentData.ipfsHash,
				},
				_tempId: tempMessageId,
			};

			// Send the combined message via socket
			socket.emit("send_message", socketMessageData, (ack: any) => {
				console.log("[Upload Helper] Message send acknowledgment:", ack);

				if (ack && ack.error) {
					message.error("Failed to send file message: " + ack.error);
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === tempMessageId
								? {
										...msg,
										status: MessageStatus.FAILED,
										metadata: {
											...(typeof msg.metadata === "object" &&
											msg.metadata !== null
												? msg.metadata
												: {}),
											_isLoading: false,
										},
										contentBlocks: [
											{
												type: ContentType.TEXT,
												content: `Failed to send ${file.name}`,
												order: 0,
											},
										],
								  }
								: msg
						)
					);
				} else if (ack && ack.messageId && ack.messageData) {
					const finalMessage = {
						...ack.messageData,
						id: ack.messageId,
						direction: MessageDirection.OUTGOING,
						metadata: {
							...(typeof ack.messageData.metadata === "object" &&
							ack.messageData.metadata !== null
								? ack.messageData.metadata
								: {}),
							_isLoading: false,
						},
					};
					setMessages((prev) =>
						prev.map((msg) => (msg.id === tempMessageId ? finalMessage : msg))
					);
				} else {
					console.warn("[Upload Helper] Received unexpected ack format:", ack);
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === tempMessageId
								? {
										...msg,
										status: MessageStatus.FAILED,
										metadata: {
											...(typeof msg.metadata === "object" &&
											msg.metadata !== null
												? msg.metadata
												: {}),
											_isLoading: false,
										},
								  }
								: msg
						)
					);
					message.error("Upload ok, but failed to confirm message delivery.");
				}
			});
		} catch (error: any) {
			console.error(
				"[Upload Helper] Error during file upload or message sending:",
				error
			);
			message.error(
				`Failed to upload file: ${error.message || "Unknown error"}`
			);
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempMessageId
						? {
								...msg,
								status: MessageStatus.FAILED,
								metadata: {
									...(typeof msg.metadata === "object" && msg.metadata !== null
										? msg.metadata
										: {}),
									_isLoading: false,
								},
						  }
						: msg
				)
			);
		}
	};

	const handleSendMessage = async () => {
		const textContent = newMessage.trim();
		const file = fileToSend; // Grab the file from state

		if (!textContent && !file) {
			console.log(
				"[Chat Client] Cannot send empty message and no file selected."
			);
			return;
		}

		if (!socket || !initialChatSession || !session?.user?.id) {
			console.error(
				"[Chat Client] Cannot send message: Socket or session missing."
			);
			message.error("Connection error, cannot send message.");
			return;
		}

		const tempMessageId = `temp-${Date.now()}`;
		const messageType = file ? MessageType.FILE : MessageType.TEXT;
		const content = textContent || (file ? file.name : ""); // Use text or filename

		// --- Create Temporary Message ---
		const tempMessage: MessageWithContent & { attachments?: any[] } = {
			id: tempMessageId,
			chatSessionId: initialChatSession.id,
			senderId: session.user.id,
			receiverId: null,
			type: messageType,
			status: MessageStatus.SENT, // Initial status before sending/uploading
			createdAt: new Date(),
			updatedAt: new Date(),
			direction: MessageDirection.OUTGOING,
			contentBlocks: [
				{
					type: ContentType.TEXT, // Always TEXT for the main content block? Backend might change this.
					content: content,
					order: 0,
				},
			],
			// Add attachment placeholder if file exists
			attachments: file
				? [
						{
							type: file.type,
							url: filePreviewUrl || "", // Use preview for initial display
							filename: file.name,
							size: file.size,
							metadata: { ipfsHash: null }, // Placeholder
						},
				  ]
				: [],
			// Add metadata for loading state
			metadata: {
				_isLoading: !!file, // Set loading true only if there is a file
				_tempId: tempMessageId,
				_attachmentPreviewUrl: filePreviewUrl, // Store preview URL for skeleton
			},
			conversationId: initialChatSession.conversationId,
			deletedAt: null,
			editedAt: null,
			encryption: MessageEncryption.NONE,
			forwardedFrom: null,
			replyTo: null,
		};
		// --- End Temporary Message ---

		// Add temporary message to UI immediately
		setMessages((prev) => [...prev, tempMessage]);

		// Reset input fields
		setNewMessage("");
		setFileToSend(null);
		if (filePreviewUrl) {
			URL.revokeObjectURL(filePreviewUrl);
			setFilePreviewUrl(null);
		}

		// Send the message
		try {
			if (file) {
				// Upload file and send message (passes text content too)
				await uploadFileAndSendMessage(
					file,
					textContent || null,
					tempMessageId
				);
			} else {
				// Send text-only message
				const textMessageData = {
					chatSessionId: initialChatSession.id,
					senderId: session.user.id,
					content: textContent,
					type: MessageType.TEXT,
					_tempId: tempMessageId, // Include tempId for ack mapping
				};
				socket.emit("send_message", textMessageData, (ack: any) => {
					console.log("[Chat Client] Text message send ack:", ack);
					if (ack && ack.error) {
						message.error("Failed to send message: " + ack.error);
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessageId
									? {
											...msg,
											status: MessageStatus.FAILED,
											metadata: {
												...(typeof msg.metadata === "object" &&
												msg.metadata !== null
													? msg.metadata
													: {}),
												_isLoading: false,
											},
									  }
									: msg
							)
						);
					} else if (ack && ack.messageId && ack.messageData) {
						const finalMessage = {
							...ack.messageData,
							id: ack.messageId,
							direction: MessageDirection.OUTGOING,
							metadata: {
								...(typeof ack.messageData.metadata === "object" &&
								ack.messageData.metadata !== null
									? ack.messageData.metadata
									: {}),
								_isLoading: false,
							},
						};
						setMessages((prev) =>
							prev.map((msg) => (msg.id === tempMessageId ? finalMessage : msg))
						);
					} else {
						console.warn("[Chat Client] Unexpected ack for text message:", ack);
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessageId
									? {
											...msg,
											status: MessageStatus.FAILED,
											metadata: {
												...(typeof msg.metadata === "object" &&
												msg.metadata !== null
													? msg.metadata
													: {}),
												_isLoading: false,
											},
									  }
									: msg
							)
						);
					}
				});
			}

			// Clear typing indicator if message was sent
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
			socket.emit("typing", {
				chatSessionId: initialChatSession.id,
				userId: session?.user?.id,
				isTyping: false,
			});
		} catch (error) {
			console.error("[Chat Client] Error sending message or file:", error);
			message.error("Failed to send. Please try again.");
			// Ensure loading state is cleared on error if temp message exists
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempMessageId
						? {
								...msg,
								status: MessageStatus.FAILED,
								metadata: {
									...(typeof msg.metadata === "object" && msg.metadata !== null
										? msg.metadata
										: {}),
									_isLoading: false,
								},
						  }
						: msg
				)
			);
		}
	};

	// Update the message status handler
	useEffect(() => {
		if (!socket) return;

		const onMessageStatus = (data: {
			messageId: string | { messageId: string };
			status: MessageStatus;
		}) => {
			console.log("[Socket Client] Message status update:", data);
			const messageId =
				typeof data.messageId === "object"
					? data.messageId.messageId
					: data.messageId;

			// Update both temporary and permanent messages
			setMessages((prev) =>
				prev.map((msg) => {
					// Check if this is a temporary message that has been mapped to a permanent ID
					const permanentId = tempMessageMap.get(msg.id);
					if (msg.id === messageId || permanentId === messageId) {
						console.log("[Socket Client] Updating message status:", {
							messageId: msg.id,
							permanentId,
							oldStatus: msg.status,
							newStatus: data.status,
						});
						return { ...msg, status: data.status };
					}
					return msg;
				})
			);
		};

		socket.on("message_status_update", onMessageStatus);

		return () => {
			socket.off("message_status_update", onMessageStatus);
		};
	}, [socket, tempMessageMap]);

	// Update the getStatusIcon function
	const getStatusIcon = (status: MessageStatus) => {
		switch (status) {
			case "SENT":
				return <CheckCircleOutlined className="text-gray-400" />;
			case "DELIVERED":
				return <CheckCircleOutlined className="text-blue-400" />;
			case "READ":
				return <CheckCircleOutlined className="text-green-400" />;
			case "FAILED":
				return <WarningOutlined className="text-red-400" />;
			default:
				return null;
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

	const handleReaction = (messageId: string, emoji: string) => {
		if (!socket) return;
		socket.emit("add-reaction", { messageId, emoji });
	};

	const handleSearch = (value: string) => {
		setSearchQuery(value);
		// Here you would typically make an API call to search messages
		// For now, we'll just filter the existing messages
		const filtered = messages.filter((message) => {
			const content = (message as any).contentBlocks?.[0]?.content;
			return content
				? content.toLowerCase().includes(value.toLowerCase())
				: false;
		});
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
					onClick={() => router.push(`/${business.id}/checkout`)}
					className="w-full bg-blue-600 hover:bg-blue-700 border-0"
				>
					Proceed to Checkout
				</Button>
			);
		}
		if (orderId) {
			return (
				<Button
					type="primary"
					onClick={() => router.push(`/${business.id}/orders/${orderId}`)}
					className="w-full bg-blue-600 hover:bg-blue-700 border-0"
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

	const calculateCartTotal = () => {
		if (!cartData?.items) return 0;
		return cartData.items.reduce((total, item) => {
			const price =
				item.variant?.price || item.product?.price || item.service?.price || 0;
			return total + price * item.quantity;
		}, 0);
	};

	const filteredMessages = messages.filter(
		(msg) =>
			msg.type !== MessageType.SYSTEM &&
			msg.type !== MessageType.NOTIFICATION &&
			(msg as MessageWithContent).contentBlocks?.[0]?.content !==
				"Chat session updated with new context"
	);

	const fetchChatHistory = async () => {
		try {
			const response = await fetch(
				`/api/businesses/${business.id}/chat-sessions`
			);
			if (response.ok) {
				const data = await response.json();
				console.log("[Chat Client] Fetched chat history:", data);
				setChatHistory(data);
			}
		} catch (error) {
			console.error("[Chat Client] Error fetching chat history:", error);
		}
	};

	useEffect(() => {
		fetchChatHistory();
	}, [business.id]);

	const renderContent = () => {
		return (
			<div className="h-[100vh] bg-[#f6f8fa] max-w-7xl mx-auto">
				<div className="flex w-full h-full">
					{/* Left Panel: Business Info + Chat History */}
					<div className="w-1/4 min-w-[260px] bg-white flex flex-col border-r h-full shadow-sm">
						{/* Business Profile section */}
						<div className="flex flex-col items-center py-6 border-b">
							<Tooltip
								title={
									<div className="text-center">
										<div className="font-semibold text-base">
											{business.name}
										</div>
										<div className="text-xs text-gray-500">
											{business.status}
										</div>
										{business.description && (
											<div className="text-xs text-gray-400 mt-1">
												{business.description}
											</div>
										)}
									</div>
								}
								placement="right"
							>
								<Avatar
									size={64}
									src={business.logo || undefined}
									icon={!business.logo && <ShopOutlined />}
									className="bg-gray-200"
									style={{ border: "2px solid #f0f0f0" }}
								/>
							</Tooltip>
							<Text className="mt-2 font-semibold">{business.name}</Text>
							<Tag color="#e6f4ea" className="mt-1 text-xs">
								{business.status}
							</Tag>
						</div>

						{/* Team Members */}
						<div className="px-4 py-3 border-b">
							<Text className="text-sm font-medium text-gray-500 mb-2 block">
								Team Members
							</Text>
							<div className="flex items-center">
								{teamMembers && teamMembers.length > 0 ? (
									<Avatar.Group
										max={{
											count: 5,
											style: { color: "#f56a00", backgroundColor: "#fde3cf" },
										}}
									>
										{teamMembers.map((member, idx) => {
											let avatarSrc = undefined;
											if (member.profileImage) {
												avatarSrc = member.profileImage.startsWith("ipfs://")
													? member.profileImage.replace(
															"ipfs://",
															"https://gateway.pinata.cloud/ipfs/"
													  )
													: member.profileImage;
											}
											return (
												<Tooltip
													key={member.id + member.role}
													title={
														<div className="min-w-[120px]">
															<div className="font-semibold">{member.name}</div>
															<div className="text-xs text-gray-500 mb-1">
																{member.role}
															</div>
															<div className="flex items-center gap-1 text-xs">
																<span
																	className={
																		member.isOnline
																			? "inline-block w-2 h-2 bg-green-500 rounded-full"
																			: "inline-block w-2 h-2 bg-gray-400 rounded-full"
																	}
																></span>
																{member.isOnline ? "Online" : "Offline"}
															</div>
														</div>
													}
													placement="right"
												>
													<Avatar
														size={40}
														src={avatarSrc}
														icon={!avatarSrc && <UserOutlined />}
													/>
												</Tooltip>
											);
										})}
									</Avatar.Group>
								) : (
									<span className="text-xs text-gray-400">No team members</span>
								)}
							</div>
						</div>

						{/* Search */}
						<div className="px-4 py-3 border-b">
							<Input
								placeholder="Search messages"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="rounded-lg border border-gray-200 bg-[#f6f8fa]"
								allowClear
								prefix={<SearchOutlined className="text-gray-400" />}
							/>
						</div>

						{/* Chat History */}
						<div className="flex-1 overflow-y-auto px-2 py-2">
							<List
								dataSource={chatHistory}
								renderItem={(chat) => {
									// Use chat.lastMessage directly as provided by the API
									const lastMessage = chat.lastMessage;

									// Handle IPFS URLs for user images in chat history
									let chatUserImage = undefined;
									if (chat.userImage) {
										chatUserImage = chat.userImage.startsWith("ipfs://")
											? chat.userImage.replace(
													"ipfs://",
													"https://gateway.pinata.cloud/ipfs/"
											  )
											: chat.userImage;
									}

									return (
										<List.Item
											className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors ${
												chat.id === initialChatSession.id ? "bg-blue-50" : ""
											}`}
											onClick={() => {
												// Handle chat selection
												router.push(
													`/${business.id}/chat?cartId=${chat.cartId}`
												);
											}}
										>
											<List.Item.Meta
												avatar={
													<Avatar
														size={48}
														src={chatUserImage}
														icon={<MessageOutlined />}
														style={{
															backgroundColor: "#f0f2f5",
															color: "#6b7280",
														}}
													/>
												}
												title={
													<div className="flex items-center justify-between">
														<Text strong className="text-base">
															{chat.userName ||
																(chat.cartId
																	? "Cart Support"
																	: "Customer Support")}
														</Text>
														{chat.unread > 0 && (
															<Badge count={chat.unread} size="small" />
														)}
													</div>
												}
												description={
													<div>
														<Text
															ellipsis={{ tooltip: lastMessage }}
															className="block text-sm text-gray-500"
														>
															{lastMessage || "No messages yet"}
														</Text>
														<Text className="text-xs text-gray-400 mt-1">
															{(() => {
																const messageDate = new Date(
																	chat.lastMessageAt || chat.updatedAt
																);
																const oneHourAgo = subHours(new Date(), 1);
																if (isBefore(messageDate, oneHourAgo)) {
																	// Older than 1 hour: show time like "10:30 AM"
																	return format(messageDate, "p");
																} else {
																	// Newer than 1 hour: show relative time like "5 minutes ago"
																	return formatDistanceToNow(messageDate, {
																		addSuffix: true,
																	});
																}
															})()}
														</Text>
													</div>
												}
											/>
										</List.Item>
									);
								}}
							/>
						</div>
					</div>

					{/* Center Panel: Messages */}
					<div className="flex-1 flex flex-col bg-[#f6f8fa] min-w-0 h-full min-h-0">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b bg-white">
							<div>
								<Title level={5} className="!mb-0">
									Chat with {business.name}
								</Title>
								<Text type="secondary">
									{isTyping ? "Typing..." : "Online"}
								</Text>
							</div>
							<div className="flex items-center gap-2">
								<Tag
									color={connectionStatus === "connected" ? "green" : "orange"}
								>
									Socket: {connectionStatus}
								</Tag>
								<Tag color="blue">Room: {initialChatSession.id}</Tag>
							</div>
						</div>

						{/* Messages + Input */}
						<div className="flex flex-col flex-1 min-h-0">
							{/* Message List Area: Style for grow, scroll */}
							<div
								ref={messagesContainerRef}
								style={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}
								className="p-4 space-y-3 bg-gray-50"
							>
								{filteredMessages.length === 0 ? (
									<div className="flex-grow flex flex-col justify-center items-center text-gray-400 p-10">
										<MessageOutlined
											style={{ fontSize: "48px", marginBottom: "16px" }}
										/>
										<Text>No messages in this conversation yet.</Text>
									</div>
								) : (
									filteredMessages.map((msg) => {
										const agentUserId = session?.user?.id;
										const isOutgoing = msg.senderId === agentUserId;
										const metadata = msg.metadata as any;
										const isLoadingPlaceholder = metadata?._isLoading;
										const isFile = msg.type === MessageType.FILE;
										const attachment = (
											msg as MessageWithContent & { attachments?: any[] }
										)?.attachments?.[0];
										const isImage = attachment?.type?.startsWith("image/");
										const textContent = (msg as MessageWithContent)
											.contentBlocks?.[0]?.content;

										if (isLoadingPlaceholder) {
											return (
												<div key={msg.id} className="flex my-1 justify-end">
													<div className="rounded-lg px-3 py-2 max-w-md shadow-sm bg-blue-100 text-gray-600">
														{metadata?._attachmentPreviewUrl ? (
															<div className="w-[150px] h-[100px] bg-gray-200 rounded animate-pulse mb-1"></div>
														) : (
															<div className="flex items-center gap-2 text-sm mb-1">
																<Spin size="small" />
																<span>Uploading file...</span>
															</div>
														)}
														{textContent &&
															textContent !== attachment?.filename && (
																<Text className="text-gray-700 block mt-1">
																	{textContent}
																</Text>
															)}
														<div className="flex items-center justify-end gap-1.5 text-xs mt-1 text-gray-400">
															<span>Sending...</span>
														</div>
													</div>
												</div>
											);
										}

										return (
											<div
												key={msg.id}
												className={`flex my-1 ${
													isOutgoing ? "justify-end" : "justify-start"
												}`}
											>
												{!isOutgoing && (
													<Avatar
														size="small"
														src={
															"sender" in msg &&
															msg.sender &&
															typeof msg.sender === "object" &&
															"profileImage" in msg.sender
																? (msg.sender as { profileImage?: string })
																		.profileImage
																: undefined
														}
														icon={<UserOutlined />}
														className="mr-2 mt-1"
													/>
												)}
												<div
													className={`rounded-lg px-3 py-2 max-w-lg shadow-sm flex flex-col ${
														isOutgoing
															? "bg-blue-600 text-white"
															: "bg-white text-gray-800"
													}`}
												>
													{isFile && attachment && isImage && (
														<div className="mb-1.5">
															<AntImage
																src={attachment.url}
																alt={attachment.filename || "Image"}
																style={{
																	maxWidth: "250px",
																	height: "auto",
																	borderRadius: "4px",
																}}
																preview={{ mask: "Preview" }}
																className="block"
															/>
														</div>
													)}
													{textContent &&
														(!isFile ||
															!attachment ||
															textContent !== attachment.filename ||
															!isImage) && (
															<Paragraph
																className={`whitespace-pre-wrap break-words !mb-0 ${
																	isOutgoing ? "text-white" : "text-gray-800"
																}`}
															>
																{textContent}
															</Paragraph>
														)}
													{isFile && attachment && !isImage && (
														<div className="mt-1.5">
															<div
																className={`flex items-center gap-2 p-2 border rounded max-w-[250px] ${
																	isOutgoing
																		? "bg-blue-500 border-blue-400"
																		: "bg-gray-100 border-gray-200"
																}`}
															>
																<FileOutlined
																	className={`text-xl flex-shrink-0 ${
																		isOutgoing
																			? "text-blue-100"
																			: "text-gray-500"
																	}`}
																/>
																<span
																	className={`text-sm truncate ${
																		isOutgoing ? "text-white" : "text-gray-700"
																	}`}
																>
																	{attachment.filename || "File"}
																</span>
															</div>
															<a
																href={attachment.url}
																target="_blank"
																rel="noopener noreferrer"
																className={`text-xs hover:underline block mt-1 ${
																	isOutgoing ? "text-blue-100" : "text-blue-600"
																}`}
															>
																Download File (
																{attachment.size
																	? `${(attachment.size / 1024).toFixed(1)} KB`
																	: "N/A"}
																)
															</a>
														</div>
													)}
													<div
														className={`flex items-center self-end justify-end gap-1 text-xs mt-1 ${
															isOutgoing ? "text-blue-200" : "text-gray-400"
														}`}
													>
														<span>{format(new Date(msg.createdAt), "p")}</span>
														{isOutgoing && getStatusIcon(msg.status)}
													</div>
												</div>
											</div>
										);
									})
								)}
							</div>
							{/* Message Input Area: Style for shrink */}
							<div
								style={{ flexShrink: 0 }}
								className="bg-white border-t p-3 shadow-inner"
							>
								{fileToSend && (
									<div className="mb-2 p-2 border rounded-md flex items-center justify-between bg-gray-50 max-w-xs">
										<div className="flex items-center gap-2 overflow-hidden">
											{filePreviewUrl ? (
												<Avatar
													shape="square"
													size={40}
													src={filePreviewUrl}
													icon={<FileImageOutlined />}
												/>
											) : (
												<FileOutlined className="text-2xl text-gray-400 flex-shrink-0" />
											)}
											<span className="text-sm text-gray-700 truncate">
												{fileToSend.name}
											</span>
										</div>
										<Button
											type="text"
											size="small"
											icon={<CloseOutlined />}
											danger
											onClick={() => {
												setFileToSend(null);
												if (filePreviewUrl) {
													URL.revokeObjectURL(filePreviewUrl);
													setFilePreviewUrl(null);
												}
											}}
										/>
									</div>
								)}
								<div className="flex items-center gap-2">
									<Upload
										showUploadList={false}
										beforeUpload={(file) => {
											setFileToSend(file);
											if (filePreviewUrl) {
												URL.revokeObjectURL(filePreviewUrl);
											}
											if (file.type.startsWith("image/")) {
												setFilePreviewUrl(URL.createObjectURL(file));
											} else {
												setFilePreviewUrl(null);
											}
											return false;
										}}
										disabled={!!fileToSend}
									>
										<Button
											icon={<PaperClipOutlined />}
											disabled={!!fileToSend}
											className="bg-white hover:bg-gray-50"
										/>
									</Upload>
									<Input.TextArea
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										placeholder="Type your message... (Shift+Enter for newline)"
										autoSize={{ minRows: 1, maxRows: 4 }}
										onPressEnter={(e) => {
											if (!e.shiftKey) {
												e.preventDefault();
												handleSendMessage();
											}
										}}
										className="flex-grow"
									/>
									<Button
										type="primary"
										icon={<SendOutlined />}
										onClick={handleSendMessage}
										disabled={!newMessage.trim() && !fileToSend}
										className="bg-blue-600 hover:bg-blue-700 text-white"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Right Panel: Cart/Order Summary */}
					<div className="w-1/4 min-w-[280px] border-l p-6 bg-white flex flex-col shadow-sm h-full">
						<Card
							title={cartId ? "Cart Summary" : "Order Summary"}
							bordered={false}
						>
							{cartId ? (
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-gray-600">
										<ShoppingCartOutlined className="text-xl" />
										<span className="font-medium">
											{cartData?.items.length || 0} items in cart
										</span>
									</div>
									<Divider />
									<div className="space-y-2">
										<div className="flex justify-between">
											<Text>Subtotal</Text>
											<Text>{formatCurrency(calculateCartTotal())}</Text>
										</div>
										<div className="flex justify-between">
											<Text>Shipping</Text>
											<Text>{formatCurrency(0)}</Text>
										</div>
										<Divider />
										<div className="flex justify-between font-semibold">
											<Text>Total</Text>
											<Text>{formatCurrency(calculateCartTotal())}</Text>
										</div>
									</div>
									{isLoadingAddress ? (
										<div className="flex justify-center py-4">
											<Spin size="small" />
										</div>
									) : shippingAddress ? (
										<>
											<Divider />
											<div className="space-y-2">
												<Text strong>Shipping Address</Text>
												<Text>{shippingAddress}</Text>
											</div>
										</>
									) : (
										<>
											<Divider />
											<div className="space-y-2">
												<Text type="secondary">No shipping address set</Text>
											</div>
										</>
									)}
									<Divider />
									<div className="space-y-3">
										<Button
											type="primary"
											block
											icon={<ShoppingOutlined />}
											onClick={() => router.push(`/${business.id}/checkout`)}
											className="bg-blue-600 hover:bg-blue-700 border-0"
										>
											Proceed to Checkout
										</Button>
									</div>
								</div>
							) : orderId ? (
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-gray-600">
										<ShoppingOutlined className="text-xl" />
										<span className="font-medium">Order Details</span>
									</div>
									<Divider />
									<div className="space-y-2">
										<div className="flex justify-between">
											<Text>Order ID</Text>
											<Text>{orderId}</Text>
										</div>
										{isLoadingAddress ? (
											<div className="flex justify-center py-4">
												<Spin size="small" />
											</div>
										) : shippingAddress ? (
											<>
												<Divider />
												<div className="space-y-2">
													<Text strong>Shipping Address</Text>
													<Text>{shippingAddress}</Text>
												</div>
											</>
										) : (
											<>
												<Divider />
												<div className="space-y-2">
													<Text type="secondary">No shipping address set</Text>
												</div>
											</>
										)}
									</div>
									<Divider />
									<Button
										type="primary"
										danger
										block
										icon={<WarningOutlined />}
										onClick={() =>
											router.push(`/${business.id}/orders/${orderId}/dispute`)
										}
										className="bg-red-600 hover:bg-red-700 border-0"
									>
										Dispute Order
									</Button>
								</div>
							) : (
								<Text type="secondary">No order selected</Text>
							)}
						</Card>
					</div>
				</div>
			</div>
		);
	};

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Implement dashboard-style auto-scroll
	useEffect(() => {
		if (!loadingMessages && messagesContainerRef.current) {
			const container = messagesContainerRef.current;
			const timeoutId = setTimeout(() => {
				container.scrollTop = container.scrollHeight;
			}, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [loadingMessages, messages, selectedConversationId]);

	// Real-time read status implementation
	useEffect(() => {
		if (!socket || !messages.length || !session?.user?.id) return;
		// Find the latest message not sent by the current user and not already READ
		const lastMsg = [...messages]
			.reverse()
			.find((m) => m.senderId !== session.user.id && m.status !== "READ");
		if (lastMsg) {
			socket.emit("message_read", {
				messageId: lastMsg.id,
				chatSessionId: initialChatSession.id,
			});
		}
	}, [messages, session?.user?.id, initialChatSession.id, socket]);

	return (
		<div>
			<div style={{ position: "absolute", top: 0, right: 0, padding: 8 }}>
				<span
					style={{
						color:
							connectionStatus === "connected"
								? "green"
								: connectionStatus === "connecting"
								? "orange"
								: "red",
					}}
				>
					{connectionStatus}
				</span>
			</div>
			{renderContent()}
		</div>
	);
}
