"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, List, Badge, Tabs, Empty } from "antd";
import {
	BellOutlined,
	ShoppingOutlined,
	TagOutlined,
	InfoCircleOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BusinessHeader from "../components/BusinessHeader";

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

// Sample notification items for demonstration
const mockNotifications = {
	all: [
		{
			id: "1",
			title: "Order Confirmed",
			description:
				"Your order #12345 has been confirmed and is being processed.",
			type: "order",
			time: "2 hours ago",
			read: false,
		},
		{
			id: "2",
			title: "Special Offer",
			description: "Get 20% off on all electronics this weekend!",
			type: "promotion",
			time: "1 day ago",
			read: true,
		},
		{
			id: "3",
			title: "Payment Successful",
			description: "Your payment of $299.99 has been processed successfully.",
			type: "payment",
			time: "3 days ago",
			read: true,
		},
		{
			id: "4",
			title: "New Product Alert",
			description: "Check out our latest smartphone model now available!",
			type: "product",
			time: "5 days ago",
			read: false,
		},
		{
			id: "5",
			title: "Password Changed",
			description: "Your account password was recently changed.",
			type: "account",
			time: "1 week ago",
			read: true,
		},
	],
	unread: [],
	orders: [],
	promotions: [],
};

// Prepare filtered lists
mockNotifications.unread = mockNotifications.all.filter(
	(notification) => !notification.read
);
mockNotifications.orders = mockNotifications.all.filter(
	(notification) =>
		notification.type === "order" || notification.type === "payment"
);
mockNotifications.promotions = mockNotifications.all.filter(
	(notification) =>
		notification.type === "promotion" || notification.type === "product"
);

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
}

interface NotificationsClientProps {
	business: Business;
}

export default function NotificationsClient({
	business,
}: NotificationsClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [notifications, setNotifications] = useState(mockNotifications);

	// Handle marking notification as read
	const handleMarkAsRead = (id: string) => {
		const updatedAll = notifications.all.map((notification) => {
			if (notification.id === id) {
				return { ...notification, read: true };
			}
			return notification;
		});

		setNotifications({
			all: updatedAll,
			unread: updatedAll.filter((notification) => !notification.read),
			orders: updatedAll.filter(
				(notification) =>
					notification.type === "order" || notification.type === "payment"
			),
			promotions: updatedAll.filter(
				(notification) =>
					notification.type === "promotion" || notification.type === "product"
			),
		});
	};

	// Get notification icon based on type
	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "order":
				return <ShoppingOutlined className="text-blue-500 text-xl" />;
			case "promotion":
				return <TagOutlined className="text-green-500 text-xl" />;
			case "payment":
				return <CheckCircleOutlined className="text-purple-500 text-xl" />;
			case "product":
				return <ShoppingOutlined className="text-orange-500 text-xl" />;
			default:
				return <InfoCircleOutlined className="text-gray-500 text-xl" />;
		}
	};

	const tabItems = [
		{
			key: "all",
			label: (
				<span className="text-base px-2">
					All{" "}
					<Badge
						count={notifications.all.length}
						showZero
						style={{ backgroundColor: "#e5e7eb" }}
						className="ml-1"
					/>
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={notifications.all}
					renderItem={(item) => (
						<List.Item
							actions={[
								!item.read ? (
									<Button type="link" onClick={() => handleMarkAsRead(item.id)}>
										Mark as read
									</Button>
								) : null,
							]}
							className={`border-b border-gray-100 ${
								!item.read ? "bg-blue-50" : ""
							}`}
						>
							<List.Item.Meta
								avatar={
									<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
										{getNotificationIcon(item.type)}
									</div>
								}
								title={
									<div className="flex justify-between">
										<span className="font-medium">{item.title}</span>
										<span className="text-sm text-gray-500">{item.time}</span>
									</div>
								}
								description={<div className="mt-1">{item.description}</div>}
							/>
						</List.Item>
					)}
					locale={{
						emptyText: (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="No notifications"
							/>
						),
					}}
				/>
			),
		},
		{
			key: "unread",
			label: (
				<span className="text-base px-2">
					Unread{" "}
					<Badge
						count={notifications.unread.length}
						showZero
						style={{ backgroundColor: "#e5e7eb" }}
						className="ml-1"
					/>
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={notifications.unread}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Button type="link" onClick={() => handleMarkAsRead(item.id)}>
									Mark as read
								</Button>,
							]}
							className="border-b border-gray-100 bg-blue-50"
						>
							<List.Item.Meta
								avatar={
									<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
										{getNotificationIcon(item.type)}
									</div>
								}
								title={
									<div className="flex justify-between">
										<span className="font-medium">{item.title}</span>
										<span className="text-sm text-gray-500">{item.time}</span>
									</div>
								}
								description={<div className="mt-1">{item.description}</div>}
							/>
						</List.Item>
					)}
					locale={{
						emptyText: (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="No unread notifications"
							/>
						),
					}}
				/>
			),
		},
		{
			key: "orders",
			label: (
				<span className="text-base px-2">
					Orders{" "}
					<Badge
						count={notifications.orders.length}
						showZero
						style={{ backgroundColor: "#e5e7eb" }}
						className="ml-1"
					/>
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={notifications.orders}
					renderItem={(item) => (
						<List.Item
							actions={[
								!item.read ? (
									<Button type="link" onClick={() => handleMarkAsRead(item.id)}>
										Mark as read
									</Button>
								) : null,
							]}
							className={`border-b border-gray-100 ${
								!item.read ? "bg-blue-50" : ""
							}`}
						>
							<List.Item.Meta
								avatar={
									<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
										{getNotificationIcon(item.type)}
									</div>
								}
								title={
									<div className="flex justify-between">
										<span className="font-medium">{item.title}</span>
										<span className="text-sm text-gray-500">{item.time}</span>
									</div>
								}
								description={<div className="mt-1">{item.description}</div>}
							/>
						</List.Item>
					)}
					locale={{
						emptyText: (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="No order notifications"
							/>
						),
					}}
				/>
			),
		},
		{
			key: "promotions",
			label: (
				<span className="text-base px-2">
					Promotions{" "}
					<Badge
						count={notifications.promotions.length}
						showZero
						style={{ backgroundColor: "#e5e7eb" }}
						className="ml-1"
					/>
				</span>
			),
			children: (
				<List
					itemLayout="horizontal"
					dataSource={notifications.promotions}
					renderItem={(item) => (
						<List.Item
							actions={[
								!item.read ? (
									<Button type="link" onClick={() => handleMarkAsRead(item.id)}>
										Mark as read
									</Button>
								) : null,
							]}
							className={`border-b border-gray-100 ${
								!item.read ? "bg-blue-50" : ""
							}`}
						>
							<List.Item.Meta
								avatar={
									<div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50">
										{getNotificationIcon(item.type)}
									</div>
								}
								title={
									<div className="flex justify-between">
										<span className="font-medium">{item.title}</span>
										<span className="text-sm text-gray-500">{item.time}</span>
									</div>
								}
								description={<div className="mt-1">{item.description}</div>}
							/>
						</List.Item>
					)}
					locale={{
						emptyText: (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description="No promotion notifications"
							/>
						),
					}}
				/>
			),
		},
	];

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Navbar Component */}
			<Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

			{/* Main Content */}
			<main className="flex-grow flex flex-col min-h-[calc(100vh-64px)]">
				{/* Business Header Component */}
				<BusinessHeader
					name={business.name}
					description={business.description}
					logoUrl={logoUrl}
				/>

				<div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
						<p className="text-lg text-gray-600 mt-2">
							Stay updated with the latest news and activity
						</p>
					</div>

					{/* Notifications Content */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center">
								<BellOutlined className="text-2xl text-blue-600 mr-3" />
								<h2 className="text-xl font-semibold text-gray-900">
									Your Notifications
								</h2>
							</div>
							{notifications.unread.length > 0 && (
								<Button
									type="link"
									onClick={() => {
										const updatedAll = notifications.all.map(
											(notification) => ({
												...notification,
												read: true,
											})
										);
										setNotifications({
											all: updatedAll,
											unread: [],
											orders: updatedAll.filter(
												(notification) =>
													notification.type === "order" ||
													notification.type === "payment"
											),
											promotions: updatedAll.filter(
												(notification) =>
													notification.type === "promotion" ||
													notification.type === "product"
											),
										});
									}}
								>
									Mark all as read
								</Button>
							)}
						</div>

						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							items={tabItems}
							className="notification-tabs"
							size="large"
						/>
					</div>
				</div>
			</main>

			{/* Footer Component */}
			<Footer business={business} logoUrl={logoUrl} />
		</div>
	);
}
