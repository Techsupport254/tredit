"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
	List,
	Avatar,
	Card,
	Typography,
	Input,
	Button,
	Spin,
	Tag,
	Divider,
	Tabs,
	Upload,
	Tooltip,
	Badge,
	Select,
	Empty,
	Layout,
	Descriptions,
	Modal,
} from "antd";
import { useSession } from "next-auth/react";
import {
	PaperClipOutlined,
	SendOutlined,
	UserOutlined,
	ShopOutlined,
	BuildOutlined,
	CheckCircleFilled,
	CheckCircleOutlined,
	CloseOutlined,
	SearchOutlined,
	MessageOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
	FileOutlined,
	WarningOutlined,
	FileImageOutlined,
	InfoCircleOutlined,
	PlusOutlined,
	MoreOutlined,
	CheckCircleTwoTone,
} from "@ant-design/icons";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { ChatSession, Message, Business } from "../types";
import {
	Prisma,
	ContentType,
	MessageDirection,
	MessageStatus,
	MessageType,
	MessageEncryption,
} from "@prisma/client";
import { getSocket } from "@/lib/socket";
import { formatDistanceToNow, format, isBefore, subHours } from "date-fns";
import { UploadFile } from "antd/es/upload/interface";
import { Image as AntImage } from "antd";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Sider, Content } = Layout;

const LOCALSTORAGE_KEY = "selectedBusinessId";

// Define required attachment structure explicitly
interface AttachmentStructure {
	type: string;
	url: string;
	filename: string;
	size: number;
	ipfsHash?: string | null;
}

// Simplified MessageWithContent - only include fields used in this component
interface MessageWithContent {
	id: string;
	chatSessionId: string; // Needed for room logic
	senderId: string; // Needed for determining direction
	sender: {
		// Needed for displaying sender info (avatar/name)
		id: string;
		name?: string | null;
		profileImage?: string | null;
		role?: string;
	};
	contentBlocks: { type: ContentType; content: string; order: number }[]; // Needed for content
	attachments: (Prisma.JsonValue & AttachmentStructure)[]; // Needed for attachments
	createdAt: string | Date; // Needed for timestamp
	updatedAt: string | Date; // Needed for sorting?
	type: MessageType; // Needed for differentiating text/file
	status: MessageStatus; // Needed for status icon
	direction: MessageDirection; // Determined client-side
	metadata?: Prisma.JsonValue & {
		_isLoading?: boolean;
		_tempId?: string;
		_attachmentPreviewUrl?: string;
	}; // For UI state
}

interface FormattedChatSession {
	id: string;
	userId: string;
	userName: string;
	userImage?: string | null;
	lastMessage?: string | null;
	lastMessageAt?: Date | string | null;
	unreadCount?: number;
	status: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	cartId?: string | null;
	orderId?: string | null;
	businessId: string;
}

interface CartItemDetail {
	id: string;
	quantity: number;
	product?: { name: string; price: number; media?: { url: string }[] };
	variant?: { name: string; price: number };
	service?: { name: string; price: number };
}

interface CartDetails {
	id: string;
	items: CartItemDetail[];
	subtotal: number;
	shippingFee: number;
	total: number;
	shippingAddress?: string;
}

interface OrderDetails {
	id: string;
	status: string;
	items: any[];
	total: number;
	shippingAddress?: string;
	createdAt: string | Date;
}

// Interface for the result of fetching user's businesses
interface UserBusiness {
	id: string;
	name: string;
}

// IMPORTANT: Only use the 'message_status_update' event for all message status updates in the app. Do not use 'message_status'.

export default function DashboardMessagesClient() {
	const { data: session } = useSession();
	const [conversations, setConversations] = useState<FormattedChatSession[]>(
		[]
	);
	const [selectedConversationId, setSelectedConversationId] = useState<
		string | null
	>(null);
	const [messages, setMessages] = useState<MessageWithContent[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [fileToSend, setFileToSend] = useState<File | null>(null);
	const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
	const [newMessage, setNewMessage] = useState("");
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [currentRoom, setCurrentRoom] = useState<string | null>(null);
	const [connectionStatus, setConnectionStatus] = useState("connecting");
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
	const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
	// State to hold the businesses the user is a member of
	const [userBusinesses, setUserBusinesses] = useState<UserBusiness[]>([]);
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
	const [newShippingFee, setNewShippingFee] = useState(0);
	const [updatingShipping, setUpdatingShipping] = useState(false);

	// Use a ref for the socket to ensure singleton and avoid re-attachment
	const socketRef = useRef<Socket | null>(null);

	// Function to fetch businesses the current user is associated with
	async function fetchUserBusinesses() {
		console.log("Fetching user's businesses...");
		setLoading(true); // Use the main loading state for this initial fetch
		setUserBusinesses([]);
		try {
			// Assuming an endpoint exists that returns businesses for the logged-in user
			const response = await fetch("/api/user/team-businesses");
			if (!response.ok) throw new Error("Failed to fetch user's businesses");
			const data: UserBusiness[] = await response.json();
			console.log("User's businesses fetched:", data);
			setUserBusinesses(data);
			return data; // Return data for chaining
		} catch (error) {
			console.error("Error fetching user's businesses:", error);
			setUserBusinesses([]);
			return []; // Return empty array on error
		} finally {
			// Don't set loading false here, let fetchConversations handle it
		}
	}

	// Update fetchConversations to accept business IDs and fetch for each
	async function fetchConversations(businessesToFetch: UserBusiness[]) {
		console.log("Fetching conversations for businesses:", businessesToFetch);
		setLoading(true);
		setConversations([]); // Clear existing conversations
		setSelectedConversationId(null);
		setMessages([]);
		setCartDetails(null);
		setOrderDetails(null);

		let allConversations: FormattedChatSession[] = [];

		try {
			// Use Promise.all to fetch conversations concurrently for all businesses
			const conversationPromises = businessesToFetch.map(async (business) => {
				console.log(`Fetching conversations for business: ${business.id}`);
				try {
					const response = await fetch(
						`/api/businesses/${business.id}/chat-sessions`
					);
					if (!response.ok) {
						console.error(
							`Failed to fetch conversations for business ${business.id}: ${response.statusText}`
						);
						return []; // Return empty array for this business on error
					}
					const data: FormattedChatSession[] = await response.json();
					// Ensure businessId is added if not already present from the API
					return data.map((convo) => ({ ...convo, businessId: business.id }));
				} catch (err) {
					console.error(
						`Error fetching conversations for business ${business.id}:`,
						err
					);
					return []; // Return empty array on error
				}
			});

			// Wait for all promises to settle
			const results = await Promise.all(conversationPromises);

			// Flatten the array of arrays and filter out any potential duplicates (optional, based on API design)
			allConversations = results
				.flat()
				.filter(
					(convo, index, self) =>
						index === self.findIndex((c) => c.id === convo.id)
				);

			// Sort combined conversations by last message date
			allConversations.sort((a, b) => {
				const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
				const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
				return dateB - dateA;
			});

			console.log("All conversations combined and sorted:", allConversations);
			setConversations(allConversations);
		} catch (error) {
			console.error("Error fetching or processing conversations:", error);
			setConversations([]); // Clear conversations on overall error
		} finally {
			setLoading(false);
		}
	}

	async function fetchDetails(cartId?: string | null, orderId?: string | null) {
		setDetailsLoading(true);
		setCartDetails(null);
		setOrderDetails(null);
		try {
			if (cartId) {
				console.log("Fetching cart details for:", cartId);
				try {
					const response = await fetch(`/api/carts/${cartId}`);

					if (response.ok) {
						const cartData: CartDetails = await response.json();
						setCartDetails(cartData);
						console.log("Cart details fetched successfully:", cartData);
					} else {
						if (response.status === 404) {
							console.log(`Cart with ID ${cartId} not found (404).`);
						} else if (response.status === 403) {
							console.log(`Unauthorized to access cart ${cartId} (403).`);
						} else {
							console.error(
								`Error fetching cart ${cartId}. Status: ${response.status} ${response.statusText}`
							);
						}
						setCartDetails(null);
					}
				} catch (networkError) {
					console.error(`Network error fetching cart ${cartId}:`, networkError);
					setCartDetails(null);
				}
			} else if (orderId) {
				console.log("Fetching order details for:", orderId);
				try {
					const response = await fetch(`/api/orders/${orderId}`);
					if (!response.ok) {
						throw new Error(`Order ${orderId} not found or error fetching.`);
					}
					const orderData: OrderDetails = await response.json();
					setOrderDetails(orderData);
					console.log("Order details fetched:", orderData);
				} catch (error) {
					console.error("Error fetching order:", error);
					setOrderDetails(null);
				}
			} else {
				console.log("No cartId or orderId provided for fetching details.");
			}
		} catch (error) {
			console.error("Error in fetchDetails:", error);
			setCartDetails(null);
			setOrderDetails(null);
		} finally {
			setDetailsLoading(false);
		}
	}

	async function fetchMessages(sessionId: string | null) {
		if (!sessionId) {
			setMessages([]);
			setSelectedConversationId(null);
			setCartDetails(null);
			setOrderDetails(null);
			return;
		}
		setLoadingMessages(true);
		setMessages([]);
		setCartDetails(null);
		setOrderDetails(null);
		try {
			const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
			if (!response.ok) throw new Error("Failed to fetch messages");
			const data: MessageWithContent[] = await response.json();
			setMessages(data);
			setSelectedConversationId(sessionId);

			const selectedConvoInfo = conversations.find((c) => c.id === sessionId);
			if (selectedConvoInfo) {
				await fetchDetails(selectedConvoInfo.cartId, selectedConvoInfo.orderId);
			} else {
				console.warn("Could not find conversation info for ID:", sessionId);
				setDetailsLoading(false);
			}
		} catch (error) {
			console.error("Error fetching messages or details:", error);
			setMessages([]);
			setSelectedConversationId(null);
			setCartDetails(null);
			setOrderDetails(null);
			setDetailsLoading(false);
		} finally {
			setLoadingMessages(false);
			setConversations((prev) =>
				prev.map((convo) =>
					convo.id === sessionId ? { ...convo, unreadCount: 0 } : convo
				)
			);
		}
	}

	useEffect(() => {
		// Chain the fetches: first businesses, then conversations
		const initialFetch = async () => {
			const businesses = await fetchUserBusinesses();
			if (businesses.length > 0) {
				// Pass the fetched businesses to fetchConversations
				await fetchConversations(businesses);
			} else {
				setLoading(false); // No businesses, stop loading
				setConversations([]);
			}
		};
		initialFetch();
	}, []); // Run only once on mount

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
				console.log("[Socket] Connected:", currentSocket.id);
			}
		}

		function onDisconnect(reason: string) {
			setConnectionStatus("disconnected");
			console.log("[Socket] Disconnected:", reason);
			setCurrentRoom(null);
		}

		function onError(error: Error) {
			console.error("[Socket] Error:", error);
		}

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

		if (currentSocket) {
			currentSocket.on("connect", onConnect);
			currentSocket.on("disconnect", onDisconnect);
			currentSocket.on("error", onError);
			currentSocket.on("new_message", onNewMessage);
			currentSocket.on("message_status_update", onMessageStatusUpdate);
		}

		return () => {
			console.log("[Socket] Cleaning up connection for Dashboard");
			if (!currentSocket) return;
			currentSocket.off("connect", onConnect);
			currentSocket.off("disconnect", onDisconnect);
			currentSocket.off("error", onError);
			currentSocket.off("new_message", onNewMessage);
			currentSocket.off("message_status_update", onMessageStatusUpdate);
			if (currentRoom && session?.user?.id) {
				currentSocket.emit("leave_chat", {
					chatSessionId: currentRoom,
					userId: session.user.id,
				});
			}
		};
	}, [session?.user?.id]);

	// Join/leave chat rooms when conversation changes
	useEffect(() => {
		if (!socket || !session?.user?.id) return;

		const selectedConvoInfo = conversations.find(
			(c) => c.id === selectedConversationId
		);

		if (currentRoom && currentRoom !== selectedConversationId) {
			console.log(`[Socket] Leaving room: ${currentRoom}`);
			socket.emit("leave_chat", {
				chatSessionId: currentRoom,
				userId: session.user.id,
			});
			setCurrentRoom(null);
		}

		if (
			selectedConversationId &&
			selectedConversationId !== currentRoom &&
			selectedConvoInfo?.businessId
		) {
			console.log(
				`[Socket] Joining room: ${selectedConversationId} for business ${selectedConvoInfo.businessId}`
			);
			socket.emit("join_chat", {
				chatSessionId: selectedConversationId,
				userId: session.user.id,
				businessId: selectedConvoInfo.businessId,
			});
			setCurrentRoom(selectedConversationId);
		} else if (selectedConversationId && !selectedConvoInfo?.businessId) {
			console.error(
				`Cannot join room ${selectedConversationId}: businessId missing from conversation data.`
			);
		}
	}, [
		socket,
		selectedConversationId,
		conversations,
		currentRoom,
		session?.user?.id,
	]);

	useEffect(() => {
		messagesContainerRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Scroll to bottom when messages load for a selected conversation
	useEffect(() => {
		// Check if loading is finished and the container ref is available
		if (!loadingMessages && messagesContainerRef.current) {
			const container = messagesContainerRef.current;
			// Use setTimeout to ensure scroll happens after DOM update
			const timeoutId = setTimeout(() => {
				console.log(
					`[Scroll Effect] Scrolling container. ScrollHeight: ${container.scrollHeight}, ScrollTop: ${container.scrollTop}`
				);
				container.scrollTop = container.scrollHeight;
			}, 100); // Increased delay slightly to potentially help with layout calc

			// Cleanup the timeout if the effect re-runs before it fires
			return () => clearTimeout(timeoutId);
		}
		// Trigger when loading finishes for the selected conversation OR when new messages arrive
	}, [loadingMessages, messages, selectedConversationId]); // Added selectedConversationId

	// Real-time new_message socket listener for real-time sync
	useEffect(() => {
		if (!socket) return;

		function onNewMessage(message: MessageWithContent) {
			setMessages((prev) => {
				// Only add if not already present
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});
		}

		socket.on("new_message", onNewMessage);

		return () => {
			socket.off("new_message", onNewMessage);
		};
	}, [socket]);

	// Real-time read status implementation
	useEffect(() => {
		if (
			!socket ||
			!messages.length ||
			!session?.user?.id ||
			!selectedConversationId
		)
			return;
		// Find the latest message not sent by the current user and not already READ
		const lastMsg = [...messages]
			.reverse()
			.find((m) => m.senderId !== session.user.id && m.status !== "READ");
		if (lastMsg) {
			socket.emit("message_read", {
				messageId: lastMsg.id,
				chatSessionId: selectedConversationId,
			});
		}
	}, [messages, session?.user?.id, selectedConversationId, socket]);

	const handleSendMessage = async () => {
		const textContent = newMessage.trim();
		const file = fileToSend;

		if (!textContent && !file) return;
		if (!socket || !selectedConversationId || !session?.user?.id) {
			console.error(
				"Cannot send message: Missing socket, session or conversation selection."
			);
			return;
		}

		setNewMessage("");
		setFileToSend(null);
		if (filePreviewUrl) {
			URL.revokeObjectURL(filePreviewUrl);
			setFilePreviewUrl(null);
		}

		const tempMessageId = `temp-${Date.now()}`;
		const messageType = file ? MessageType.FILE : MessageType.TEXT;
		const tempContent = textContent || (file ? file.name : "");

		const tempMessage: MessageWithContent = {
			id: tempMessageId,
			chatSessionId: selectedConversationId!,
			senderId: session!.user!.id,
			sender: {
				id: session!.user!.id,
				name: session!.user!.name || "Agent",
				profileImage: session!.user!.image,
			},
			type: messageType,
			status: MessageStatus.SENT,
			createdAt: new Date(),
			updatedAt: new Date(),
			direction: MessageDirection.OUTGOING,
			contentBlocks: [
				{ type: ContentType.TEXT, content: tempContent, order: 0 },
			],
			attachments: file
				? [
						{
							type: file.type,
							url: filePreviewUrl || "",
							filename: file.name,
							size: file.size,
						} as Prisma.JsonValue & AttachmentStructure,
				  ]
				: [],
			metadata: {
				_isLoading: !!file,
				_tempId: tempMessageId,
				_attachmentPreviewUrl: filePreviewUrl ?? undefined,
			},
		};

		setMessages((prev) => [...prev, tempMessage]);

		try {
			if (file) {
				const formData = new FormData();
				formData.append("file", file, file.name);

				const uploadResponse = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					throw new Error(`Upload failed for ${file.name}`);
				}
				const attachmentData = await uploadResponse.json();

				const socketMessageData = {
					chatSessionId: selectedConversationId,
					senderId: session.user.id,
					content: textContent || attachmentData.name,
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

				socket.emit("send_message", socketMessageData, (ack: any) => {
					console.log("File message ack:", ack);
					if (ack && ack.error) {
						console.error("Failed to send file message:", ack.error);
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessageId
									? {
											...msg,
											status: MessageStatus.FAILED,
											metadata: {
												...((msg.metadata as object) ?? {}),
												_isLoading: false,
											},
									  }
									: msg
							)
						);
					} else if (ack && ack.messageId && ack.messageData) {
						const finalMessage: MessageWithContent = {
							...ack.messageData,
							id: ack.messageId,
							direction: MessageDirection.OUTGOING,
							metadata: {
								...((ack.messageData.metadata as object) ?? {}),
								_isLoading: false,
							},
							sender: ack.messageData.sender || tempMessage.sender,
							contentBlocks:
								ack.messageData.contentBlocks || tempMessage.contentBlocks,
							attachments: ack.messageData.attachments || [],
							content: ack.messageData.content,
							userId: ack.messageData.userId,
							userName: ack.messageData.userName,
							userEmail: ack.messageData.userEmail,
							businessId: ack.messageData.businessId,
							conversationId: ack.messageData.conversationId,
							deletedAt: ack.messageData.deletedAt,
							editedAt: ack.messageData.editedAt,
							encryption: ack.messageData.encryption,
							forwardedFrom: ack.messageData.forwardedFrom,
							replyTo: ack.messageData.replyTo,
							receiverId: ack.messageData.receiverId,
							agentId: ack.messageData.agentId,
							customerId: ack.messageData.customerId,
							readAt: ack.messageData.readAt,
						};
						setMessages((prev) =>
							prev.map((msg) => (msg.id === tempMessageId ? finalMessage : msg))
						);
					} else {
						console.warn("Received unexpected ack for file message:", ack);
						// Optionally update status to failed
					}
				});
			} else {
				const textMessageData = {
					chatSessionId: selectedConversationId,
					senderId: session.user.id,
					content: textContent,
					type: MessageType.TEXT,
					_tempId: tempMessageId,
				};

				socket.emit("send_message", textMessageData, (ack: any) => {
					console.log("Text message ack:", ack);
					if (ack && ack.error) {
						console.error("Failed to send text message:", ack.error);
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessageId
									? {
											...msg,
											status: MessageStatus.FAILED,
											metadata: {
												...((msg.metadata as object) ?? {}),
												_isLoading: false,
											},
									  }
									: msg
							)
						);
					} else if (ack && ack.messageId && ack.messageData) {
						const finalMessage: MessageWithContent = {
							...ack.messageData,
							id: ack.messageId,
							direction: MessageDirection.OUTGOING,
							metadata: {
								...((ack.messageData.metadata as object) ?? {}),
								_isLoading: false,
							},
							sender: ack.messageData.sender || tempMessage.sender,
							contentBlocks:
								ack.messageData.contentBlocks || tempMessage.contentBlocks,
							attachments: ack.messageData.attachments || [],
							content: ack.messageData.content,
							userId: ack.messageData.userId,
							userName: ack.messageData.userName,
							userEmail: ack.messageData.userEmail,
							businessId: ack.messageData.businessId,
							conversationId: ack.messageData.conversationId,
							deletedAt: ack.messageData.deletedAt,
							editedAt: ack.messageData.editedAt,
							encryption: ack.messageData.encryption,
							forwardedFrom: ack.messageData.forwardedFrom,
							replyTo: ack.messageData.replyTo,
							receiverId: ack.messageData.receiverId,
							agentId: ack.messageData.agentId,
							customerId: ack.messageData.customerId,
							readAt: ack.messageData.readAt,
						};
						setMessages((prev) =>
							prev.map((msg) => (msg.id === tempMessageId ? finalMessage : msg))
						);
					} else {
						console.warn("Received unexpected ack for text message:", ack);
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessageId
									? {
											...msg,
											status: MessageStatus.FAILED,
											metadata: {
												...((msg.metadata as object) ?? {}),
												_isLoading: false,
											},
									  }
									: msg
							)
						);
					}
				});
			}

			setConversations((prev) => {
				const convoIndex = prev.findIndex(
					(c) => c.id === selectedConversationId
				);
				if (convoIndex > -1) {
					const updatedConvo = {
						...prev[convoIndex],
						lastMessage: textContent || (file ? `[${file.name}]` : "..."),
						lastMessageAt: new Date(),
						businessId: prev[convoIndex].businessId,
					};
					return [
						updatedConvo,
						...prev.slice(0, convoIndex),
						...prev.slice(convoIndex + 1),
					];
				}
				return prev;
			});
		} catch (error) {
			console.error("Error sending message or file:", error);
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === tempMessageId
						? {
								...msg,
								status: MessageStatus.FAILED,
								metadata: {
									...((msg.metadata as object) ?? {}),
									_isLoading: false,
								},
						  }
						: msg
				)
			);
		}
	};

	const handleFileSelect = (file: File) => {
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
	};

	const removeAttachment = () => {
		setFileToSend(null);
		if (filePreviewUrl) {
			URL.revokeObjectURL(filePreviewUrl);
			setFilePreviewUrl(null);
		}
	};

	const filteredConversations = useMemo(() => {
		if (!search) return conversations;
		return conversations.filter(
			(convo) =>
				convo.userName.toLowerCase().includes(search.toLowerCase()) ||
				(convo.lastMessage &&
					convo.lastMessage.toLowerCase().includes(search.toLowerCase()))
		);
	}, [conversations, search]);

	const selectedConversationInfo = useMemo(() => {
		return conversations.find((c) => c.id === selectedConversationId);
	}, [conversations, selectedConversationId]);

	const getStatusIcon = (status: MessageStatus | undefined) => {
		switch (status) {
			case MessageStatus.SENT:
				return <CheckCircleOutlined className="text-gray-400 ml-1" />;
			case MessageStatus.DELIVERED:
				return <CheckCircleOutlined className="text-blue-400 ml-1" />;
			case MessageStatus.READ:
				return <CheckCircleOutlined className="text-green-400 ml-1" />;
			case MessageStatus.FAILED:
				return <WarningOutlined className="text-red-400 ml-1" />;
			default:
				return null;
		}
	};

	const formatCurrency = (amount: number | undefined) => {
		if (amount === undefined || amount === null) return "N/A";
		return new Intl.NumberFormat("en-KE", {
			style: "currency",
			currency: "KES",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const handleUpdateShippingFee = async () => {
		if (!cartDetails) return;
		setUpdatingShipping(true);
		try {
			const response = await fetch(`/api/carts/${cartDetails.id}/shipping`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ shippingFee: newShippingFee }),
			});

			if (!response.ok) {
				throw new Error("Failed to update shipping fee");
			}

			const updatedCart = await response.json();
			setCartDetails(updatedCart);
			setIsShippingModalOpen(false);
		} catch (error) {
			console.error("Error updating shipping fee:", error);
		} finally {
			setUpdatingShipping(false);
		}
	};

	return (
		<Layout className="h-full flex flex-col overflow-hidden">
			<div className="p-3 bg-white border-b flex items-center gap-3 shadow-sm z-10 shrink-0">
				<Title level={5} className="!mb-0 !text-base font-semibold">
					Messages
				</Title>
				<div className="ml-auto flex items-center gap-2">
					<Tag color={connectionStatus === "connected" ? "green" : "orange"}>
						Socket: {connectionStatus}
					</Tag>
					{currentRoom && <Tag color="blue">Room: {currentRoom}</Tag>}
				</div>
			</div>

			<Layout className="flex-grow flex flex-row overflow-hidden min-h-0">
				<Sider
					width={300}
					theme="light"
					className="border-r flex flex-col bg-white shrink-0"
				>
					<div className="p-4 flex justify-between items-center border-b shrink-0">
						<Title level={5} className="!mb-0 !text-base font-semibold">
							Last chats
						</Title>
						<div>
							<Button type="text" shape="circle" icon={<PlusOutlined />} />
							<Button
								type="text"
								shape="circle"
								icon={<MoreOutlined />}
								className="ml-1"
							/>
						</div>
					</div>
					<div className="p-3 border-b shrink-0">
						<Input
							placeholder="Search conversations..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							prefix={<SearchOutlined className="text-gray-400" />}
							allowClear
							className="rounded-md bg-gray-50 border-none focus:bg-white focus:ring-1 focus:ring-blue-500"
							style={{ padding: "8px 12px" }}
						/>
					</div>
					<div className="flex-grow overflow-y-auto min-h-0">
						{loading && conversations.length === 0 ? (
							<div className="flex justify-center items-center h-full p-4">
								<Spin />
							</div>
						) : filteredConversations.length === 0 ? (
							<div className="p-6 text-center">
								<Empty
									description={
										search
											? "No matching conversations"
											: "No conversations yet"
									}
								/>
							</div>
						) : (
							<List
								itemLayout="horizontal"
								dataSource={filteredConversations}
								className="p-0"
								renderItem={(convo: FormattedChatSession) => {
									let avatarSrc = convo.userImage;
									if (avatarSrc && avatarSrc.startsWith("ipfs://")) {
										avatarSrc = avatarSrc.replace(
											"ipfs://",
											"https://gateway.pinata.cloud/ipfs/"
										);
									}
									const isSelected = convo.id === selectedConversationId;

									return (
										<List.Item
											key={convo.id}
											onClick={() => fetchMessages(convo.id)}
											className={`relative m-0 border-b-0 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer ${
												isSelected
													? "bg-gray-100 hover:bg-gray-100"
													: "bg-white"
											}`}
											style={{ borderLeft: "none" }}
										>
											{isSelected && (
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-sm"></div>
											)}
											<List.Item.Meta
												className="ml-1 items-center"
												avatar={
													<Avatar
														size={40}
														src={avatarSrc}
														icon={<UserOutlined />}
														className="mr-2"
													/>
												}
												title={
													<div className="flex justify-between items-center">
														<Text
															strong
															className={`truncate pr-2 text-sm font-semibold ${
																isSelected ? "text-gray-900" : "text-gray-800"
															}`}
														>
															{convo.userName || "Unknown User"}
														</Text>
														<Text
															type="secondary"
															className="text-xs whitespace-nowrap text-gray-400"
														>
															{convo.lastMessageAt
																? formatDistanceToNow(
																		new Date(convo.lastMessageAt),
																		{ addSuffix: true }
																  )
																: ""}
														</Text>
													</div>
												}
												description={
													<Paragraph
														ellipsis={{ rows: 1 }}
														className={`!mb-0 text-xs mt-0.5 ${
															convo.unreadCount && !isSelected
																? "font-medium text-gray-700"
																: "text-gray-500"
														}`}
													>
														{convo.lastMessage ? (
															convo.lastMessage
														) : (
															<span className="italic text-gray-400">
																No messages yet
															</span>
														)}
													</Paragraph>
												}
											/>
										</List.Item>
									);
								}}
							/>
						)}
					</div>
				</Sider>

				{/* Apply inline styles for flex behavior */}
				<Content
					style={{
						display: "flex",
						flexDirection: "column",
						flexGrow: 1,
						minHeight: 0,
						background: "#f7fafc",
					}}
				>
					{selectedConversationId ? (
						<>
							{/* Chat Header: Style for shrink */}
							<div
								style={{ flexShrink: 0 }}
								className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm"
							>
								<div>
									<Title level={5} className="!mb-0 truncate">
										{selectedConversationInfo?.userName || "Chat"}
									</Title>
								</div>
							</div>

							{/* Message List Area: Style for grow, scroll */}
							<div
								ref={messagesContainerRef}
								style={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}
								className="p-4 space-y-3 bg-gray-50"
							>
								{loadingMessages ? (
									<div className="flex justify-center items-center h-full">
										<Spin size="large" />
									</div>
								) : messages.length === 0 ? (
									<div className="flex-grow flex flex-col justify-center items-center text-gray-400 p-10">
										<MessageOutlined
											style={{ fontSize: "48px", marginBottom: "16px" }}
										/>
										<Text>No messages in this conversation yet.</Text>
									</div>
								) : (
									messages.map((msg) => {
										const agentUserId = session?.user?.id;
										const isOutgoing = msg.senderId === agentUserId;
										const metadata =
											msg.metadata as MessageWithContent["metadata"];
										const isLoadingPlaceholder = metadata?._isLoading;

										const isFile = msg.type === MessageType.FILE;
										const attachment = msg.attachments?.[0];
										const isImage = attachment?.type?.startsWith("image/");
										const textContent = msg.contentBlocks?.[0]?.content;

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
														src={msg.sender?.profileImage}
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
											onClick={removeAttachment}
										/>
									</div>
								)}
								<div className="flex items-center gap-2">
									<Upload
										showUploadList={false}
										beforeUpload={handleFileSelect}
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
						</>
					) : (
						<div
							style={{ flexGrow: 1 }}
							className="flex flex-col justify-center items-center text-gray-400 p-10 text-center bg-gray-50"
						>
							<MessageOutlined
								style={{ fontSize: "64px", marginBottom: "24px" }}
							/>
							<Title level={5}>Select a conversation</Title>
							<Text>
								Choose a conversation from the list on the left to view
								messages.
							</Text>
						</div>
					)}
				</Content>

				{/* Right Sidebar - Details */}
				<Sider
					width={300}
					theme="light"
					className="border-l bg-white flex flex-col shrink-0"
				>
					<div className="flex-grow overflow-y-auto p-4 h-full min-h-0">
						{/* Details content area - grow, overflow auto */}
						{detailsLoading ? (
							<div className="flex justify-center items-center h-full">
								<Spin tip="Loading details..." />
							</div>
						) : cartDetails ? (
							<Card title="Cart Summary" bordered={false} size="small">
								<Descriptions column={1} size="small">
									<Descriptions.Item label="Items">
										{cartDetails.items.length}
									</Descriptions.Item>
									<Descriptions.Item label="Subtotal">
										{formatCurrency(cartDetails.subtotal)}
									</Descriptions.Item>
									<Descriptions.Item label="Shipping">
										{formatCurrency(cartDetails.shippingFee)}
									</Descriptions.Item>
									<Descriptions.Item
										label="Total"
										contentStyle={{ fontWeight: "bold" }}
									>
										{formatCurrency(cartDetails.total)}
									</Descriptions.Item>
								</Descriptions>
								{cartDetails.shippingAddress && (
									<>
										<Divider dashed className="my-2" />
										<Text strong>Shipping Address</Text>
										<Paragraph className="text-xs mt-1 mb-0">
											{cartDetails.shippingAddress}
										</Paragraph>
									</>
								)}
								<Divider dashed className="my-2" />
								<Button
									type="primary"
									block
									size="small"
									icon={<BuildOutlined />}
									onClick={() => {
										setNewShippingFee(cartDetails.shippingFee);
										setIsShippingModalOpen(true);
									}}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									Update Shipping Fee
								</Button>
							</Card>
						) : orderDetails ? (
							<Card title="Order Summary" bordered={false} size="small">
								<Descriptions column={1} size="small">
									<Descriptions.Item label="Order ID">
										<Tag>{orderDetails.id}</Tag>
									</Descriptions.Item>
									<Descriptions.Item label="Status">
										<Tag color="blue">{orderDetails.status}</Tag>
									</Descriptions.Item>
									<Descriptions.Item label="Total">
										{formatCurrency(orderDetails.total)}
									</Descriptions.Item>
									<Descriptions.Item label="Date">
										{format(new Date(orderDetails.createdAt), "PPp")}
									</Descriptions.Item>
								</Descriptions>
								{orderDetails.shippingAddress && (
									<>
										<Divider dashed className="my-2" />
										<Text strong>Shipping Address</Text>
										<Paragraph className="text-xs mt-1 mb-0">
											{orderDetails.shippingAddress}
										</Paragraph>
									</>
								)}
								<Divider dashed className="my-2" />
								<Button
									type="primary"
									block
									size="small"
									icon={<ShoppingOutlined />}
								>
									View Order Details
								</Button>
							</Card>
						) : selectedConversationId ? (
							<div className="flex flex-col justify-center items-center h-full text-center text-gray-400 px-4">
								<InfoCircleOutlined
									style={{ fontSize: "32px", marginBottom: "12px" }}
								/>
								<Text>
									No associated cart or order found for this conversation.
								</Text>
							</div>
						) : (
							<div className="flex flex-col justify-center items-center h-full text-center text-gray-400 px-4">
								<InfoCircleOutlined
									style={{ fontSize: "32px", marginBottom: "12px" }}
								/>
								<Text>
									Select a conversation to view associated details here.
								</Text>
							</div>
						)}
					</div>
				</Sider>
			</Layout>

			{/* Add Shipping Fee Modal */}
			<Modal
				title="Update Shipping Fee"
				open={isShippingModalOpen}
				onOk={handleUpdateShippingFee}
				onCancel={() => setIsShippingModalOpen(false)}
				confirmLoading={updatingShipping}
			>
				<Input
					type="number"
					prefix="KES"
					value={newShippingFee}
					onChange={(e) => setNewShippingFee(Number(e.target.value))}
					placeholder="Enter new shipping fee"
				/>
			</Modal>
		</Layout>
	);
}
