"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Button,
	Input,
	List,
	Avatar,
	Badge,
	Card,
	Typography,
	Divider,
	Tag,
} from "antd";
import {
	MessageOutlined,
	SendOutlined,
	UserOutlined,
	ShoppingCartOutlined,
	ShoppingOutlined,
	RocketOutlined,
	QuestionCircleOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const { Search } = Input;
const { Title, Text } = Typography;

// IPFS Gateway URL
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

// Sample conversation data
const mockConversations = [
	{
		id: "1",
		name: "Order #12345",
		avatar: null,
		lastMessage: "Your order has been shipped and is on the way.",
		time: "2 hours ago",
		unread: 2,
		isSupport: true,
		status: "shipped",
		orderDate: "2023-06-15",
		items: [
			{
				id: "item1",
				name: "Wireless Headphones",
				price: 79.99,
				quantity: 1,
			},
			{
				id: "item2",
				name: "Smart Watch",
				price: 199.99,
				quantity: 1,
			},
		],
		total: 279.98,
	},
	{
		id: "2",
		name: "Cart Support",
		avatar: null,
		lastMessage: "Do you need help completing your purchase?",
		time: "Yesterday",
		unread: 1,
		isSupport: true,
		status: "cart",
		items: [
			{
				id: "item3",
				name: "Bluetooth Speaker",
				price: 59.99,
				quantity: 2,
			},
		],
		total: 119.98,
	},
	{
		id: "3",
		name: "Order #10987",
		avatar: null,
		lastMessage: "Thank you for your order! It has been delivered.",
		time: "3 days ago",
		unread: 0,
		isSupport: true,
		status: "delivered",
		orderDate: "2023-06-10",
		items: [
			{
				id: "item4",
				name: "Smartphone Case",
				price: 24.99,
				quantity: 1,
			},
		],
		total: 24.99,
	},
];

// Sample messages for selected conversation
const mockMessages = {
	"1": [
		{
			id: "m1",
			sender: "user",
			content: "Hello, when will my order be delivered?",
			time: "2023-06-15T14:30:00",
		},
		{
			id: "m2",
			sender: "support",
			content:
				"Hi there! Your order #12345 has been processed and is being prepared for shipping.",
			time: "2023-06-15T14:32:00",
		},
		{
			id: "m3",
			sender: "user",
			content: "Great, thanks for the update!",
			time: "2023-06-15T14:33:00",
		},
		{
			id: "m4",
			sender: "support",
			content:
				"Your order has been shipped and is on the way. You should receive it within 3-5 business days.",
			time: "2023-06-15T14:35:00",
		},
	],
	"2": [
		{
			id: "m1",
			sender: "support",
			content:
				"Hi there! I notice you have items in your cart. Would you like any help completing your purchase?",
			time: "2023-06-14T10:15:00",
		},
		{
			id: "m2",
			sender: "user",
			content:
				"I was wondering about the compatibility of the Bluetooth Speaker with my phone.",
			time: "2023-06-14T10:20:00",
		},
		{
			id: "m3",
			sender: "support",
			content:
				"The Bluetooth Speaker is compatible with all modern smartphones that support Bluetooth 5.0 or newer. Your phone should work perfectly with it!",
			time: "2023-06-14T11:05:00",
		},
		{
			id: "m4",
			sender: "support",
			content: "Do you need help completing your purchase?",
			time: "2023-06-15T09:30:00",
		},
	],
	"3": [
		{
			id: "m1",
			sender: "support",
			content: "Thank you for your order #10987!",
			time: "2023-06-12T09:10:00",
		},
		{
			id: "m2",
			sender: "user",
			content: "When can I expect delivery?",
			time: "2023-06-12T09:15:00",
		},
		{
			id: "m3",
			sender: "support",
			content: "Your order has been shipped and should arrive by June 14th.",
			time: "2023-06-12T09:20:00",
		},
		{
			id: "m4",
			sender: "support",
			content:
				"Your order has been delivered! Please let us know if you have any questions.",
			time: "2023-06-14T15:45:00",
		},
		{
			id: "m5",
			sender: "user",
			content: "Received it, thank you!",
			time: "2023-06-14T16:30:00",
		},
		{
			id: "m6",
			sender: "support",
			content: "Thank you for your order! It has been delivered.",
			time: "2023-06-14T16:35:00",
		},
	],
};

// Get status icon
const getStatusIcon = (status: string) => {
	switch (status) {
		case "cart":
			return <ShoppingCartOutlined className="text-blue-600" />;
		case "processing":
			return <ShoppingOutlined className="text-orange-500" />;
		case "shipped":
			return <RocketOutlined className="text-purple-500" />;
		case "delivered":
			return <CheckCircleOutlined className="text-green-600" />;
		default:
			return <QuestionCircleOutlined className="text-gray-500" />;
	}
};

// Get status tag
const getStatusTag = (status: string) => {
	switch (status) {
		case "cart":
			return <Tag color="blue">Cart</Tag>;
		case "processing":
			return <Tag color="orange">Processing</Tag>;
		case "shipped":
			return <Tag color="purple">Shipped</Tag>;
		case "delivered":
			return <Tag color="green">Delivered</Tag>;
		default:
			return <Tag color="default">Unknown</Tag>;
	}
};

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface MessagesClientProps {
	business: Business;
}

export default function MessagesClient({ business }: MessagesClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [messageInput, setMessageInput] = useState("");
	const [conversations, setConversations] = useState(mockConversations);
	const [messages, setMessages] = useState(mockMessages);

	// Filter conversations based on search query
	const filteredConversations = conversations.filter((conversation) =>
		conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Handle sending a new message
	const handleSendMessage = () => {
		if (!messageInput.trim() || !selectedConversation) return;

		const newMessage = {
			id: `m${Math.random().toString(36).substring(2, 9)}`,
			sender: "user",
			content: messageInput,
			time: new Date().toISOString(),
		};

		// Update messages
		setMessages({
			...messages,
			[selectedConversation]: [...messages[selectedConversation], newMessage],
		});

		// Update the last message in conversations
		setConversations(
			conversations.map((conv) => {
				if (conv.id === selectedConversation) {
					return {
						...conv,
						lastMessage: messageInput,
						time: "Just now",
						unread: 0,
					};
				}
				return conv;
			})
		);

		// Clear the input
		setMessageInput("");
	};

	// Format date for display
	const formatMessageTime = (isoTime: string) => {
		const date = new Date(isoTime);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full w-full flex flex-col">
			<div className="py-4 px-6 border-b border-gray-100">
				<Title level={4} className="m-0">
					Messages
				</Title>
				<Text type="secondary">
					Track and communicate about your cart and orders
				</Text>
			</div>

			<div className="flex flex-1 min-h-0 h-full">
				{/* Conversations sidebar */}
				<div className="w-64 border-r border-gray-100 flex flex-col min-h-0">
					<div className="p-4 border-b border-gray-100">
						<Search
							placeholder="Search orders"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="mb-2"
						/>
					</div>
					<div className="overflow-y-auto flex-1">
						<List
							itemLayout="horizontal"
							dataSource={filteredConversations}
							renderItem={(item) => (
								<List.Item
									className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors ${
										selectedConversation === item.id ? "bg-blue-50" : ""
									}`}
									onClick={() => {
										setSelectedConversation(item.id);
										// Clear unread count
										setConversations(
											conversations.map((conv) => {
												if (conv.id === item.id) {
													return {
														...conv,
														unread: 0,
													};
												}
												return conv;
											})
										);
									}}
								>
									<List.Item.Meta
										avatar={
											<Badge count={item.unread} size="small" offset={[-2, 2]}>
												<Avatar
													size={48}
													icon={getStatusIcon(item.status)}
													style={{
														backgroundColor: "#f0f2f5",
														color:
															item.status === "cart"
																? "#2563eb"
																: item.status === "shipped"
																? "#9333ea"
																: item.status === "delivered"
																? "#16a34a"
																: "#6b7280",
													}}
												/>
											</Badge>
										}
										title={
											<div className="flex items-center justify-between">
												<Text strong className="text-base">
													{item.name}
												</Text>
												{getStatusTag(item.status)}
											</div>
										}
										description={
											<div>
												<Text
													ellipsis={{ tooltip: item.lastMessage }}
													className="block text-sm text-gray-500"
												>
													{item.lastMessage}
												</Text>
												<Text className="text-xs text-gray-400 mt-1">
													{item.time}
												</Text>
											</div>
										}
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>

				{/* Message area */}
				<div className="flex-1 flex flex-col min-h-0">
					{selectedConversation ? (
						<>
							{/* Conversation header */}
							<div className="p-4 border-b border-gray-100 bg-gray-50">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar
											size={40}
											icon={getStatusIcon(
												conversations.find((c) => c.id === selectedConversation)
													?.status || ""
											)}
											style={{
												backgroundColor: "#f0f2f5",
												color:
													conversations.find(
														(c) => c.id === selectedConversation
													)?.status === "cart"
														? "#2563eb"
														: conversations.find(
																(c) => c.id === selectedConversation
														  )?.status === "shipped"
														? "#9333ea"
														: conversations.find(
																(c) => c.id === selectedConversation
														  )?.status === "delivered"
														? "#16a34a"
														: "#6b7280",
											}}
										/>
										<div>
											<Title level={5} className="mb-0">
												{
													conversations.find(
														(c) => c.id === selectedConversation
													)?.name
												}
											</Title>
											<div className="flex items-center gap-2">
												{getStatusTag(
													conversations.find(
														(c) => c.id === selectedConversation
													)?.status || ""
												)}
												{conversations.find(
													(c) => c.id === selectedConversation
												)?.orderDate && (
													<Text type="secondary" className="text-xs">
														Ordered on{" "}
														{new Date(
															conversations.find(
																(c) => c.id === selectedConversation
															)?.orderDate || ""
														).toLocaleDateString()}
													</Text>
												)}
											</div>
										</div>
									</div>

									{/* Show total for orders/cart */}
									<div className="text-right">
										<Text strong className="text-base">
											$
											{conversations
												.find((c) => c.id === selectedConversation)
												?.total.toFixed(2)}
										</Text>
										<Text className="block text-xs text-gray-500">
											{
												conversations.find((c) => c.id === selectedConversation)
													?.items.length
											}{" "}
											item(s)
										</Text>
									</div>
								</div>

								{/* Order items summary */}
								<div className="mt-3 pt-3 border-t border-gray-100">
									<div className="flex flex-wrap gap-2">
										{conversations
											.find((c) => c.id === selectedConversation)
											?.items.map((item) => (
												<Tag key={item.id} className="py-1 px-2">
													{item.quantity} × {item.name}
												</Tag>
											))}
									</div>
								</div>
							</div>

							{/* Messages */}
							<div className="flex-1 overflow-y-auto p-4 bg-gray-50">
								{messages[selectedConversation]?.map((message) => (
									<div
										key={message.id}
										className={`mb-4 flex ${
											message.sender === "user"
												? "justify-end"
												: "justify-start"
										}`}
									>
										<div
											className={`max-w-[70%] rounded-lg p-3 ${
												message.sender === "user"
													? "bg-blue-600 text-white"
													: "bg-white border border-gray-200"
											}`}
										>
											<div className="text-sm">{message.content}</div>
											<div
												className={`text-xs mt-1 text-right ${
													message.sender === "user"
														? "text-blue-200"
														: "text-gray-400"
												}`}
											>
												{formatMessageTime(message.time)}
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Message input */}
							<div className="p-4 border-t border-gray-100 bg-white">
								<div className="flex gap-2">
									<Input
										placeholder="Type your message..."
										value={messageInput}
										onChange={(e) => setMessageInput(e.target.value)}
										onPressEnter={handleSendMessage}
										className="flex-grow rounded-full border-gray-200"
										size="large"
									/>
									<Button
										type="primary"
										shape="circle"
										icon={<SendOutlined />}
										onClick={handleSendMessage}
										size="large"
										className="bg-blue-600 hover:bg-blue-700 border-0"
									/>
								</div>

								{/* Quick actions */}
								{conversations.find((c) => c.id === selectedConversation)
									?.status === "cart" && (
									<div className="mt-3">
										<Link href={`/${business.id}/cart`}>
											<Button
												type="primary"
												className="bg-blue-600 hover:bg-blue-700 border-0"
											>
												Complete Purchase
											</Button>
										</Link>
									</div>
								)}
							</div>
						</>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center p-6">
							<MessageOutlined
								className="text-6xl text-gray-300 mb-6"
								style={{ fontSize: 96 }}
							/>
							<Title level={4} className="text-gray-600 mb-2">
								Select a conversation
							</Title>
							<Text type="secondary" className="text-center max-w-md">
								Choose a cart or order from the list to view messages and track
								status.
							</Text>

							<div className="mt-8 text-center">
								<Link href={`/${business.id}/cart`}>
									<Button
										type="primary"
										size="large"
										icon={<ShoppingCartOutlined />}
										className="bg-blue-600 hover:bg-blue-700 border-0"
									>
										Go to Cart
									</Button>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
