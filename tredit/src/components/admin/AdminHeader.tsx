"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
	Bars3Icon,
	BellIcon,
	MagnifyingGlassIcon,
	ChevronDownIcon,
	Cog6ToothIcon,
	UserCircleIcon,
	ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function AdminHeader() {
	const { user, logout } = useAuth();
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [notifications] = useState([
		{
			id: 1,
			type: "dispute",
			message: "New dispute needs attention",
			time: "5 minutes ago",
			status: "urgent",
		},
		{
			id: 2,
			type: "transaction",
			message: "High-value transaction completed",
			time: "1 hour ago",
			status: "info",
		},
		{
			id: 3,
			type: "user",
			message: "New user registration",
			time: "2 hours ago",
			status: "success",
		},
	]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "urgent":
				return "bg-red-50 text-red-700 border-red-100";
			case "info":
				return "bg-blue-50 text-blue-700 border-blue-100";
			case "success":
				return "bg-green-50 text-green-700 border-green-100";
			default:
				return "bg-gray-50 text-gray-700 border-gray-100";
		}
	};

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<Container>
				<div className="flex items-center justify-between h-16">
					{/* Left side */}
					<div className="flex items-center flex-1">
						<button
							type="button"
							className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						>
							<span className="sr-only">Open sidebar</span>
							<Bars3Icon className="h-6 w-6" aria-hidden="true" />
						</button>
						<div className="max-w-lg w-full lg:max-w-xs ml-4">
							<label htmlFor="search" className="sr-only">
								Search
							</label>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
									<MagnifyingGlassIcon
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								</div>
								<input
									id="search"
									name="search"
									className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
									placeholder="Search transactions, users..."
									type="search"
								/>
							</div>
						</div>
					</div>

					{/* Right side */}
					<div className="flex items-center space-x-4">
						{/* Notifications */}
						<div className="relative">
							<button
								type="button"
								className="relative p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
								onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
							>
								<span className="sr-only">View notifications</span>
								<BellIcon className="h-6 w-6" aria-hidden="true" />
								{notifications.length > 0 && (
									<span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white animate-pulse" />
								)}
							</button>

							{/* Notifications dropdown */}
							{isNotificationsOpen && (
								<div className="origin-top-right absolute right-0 mt-2 w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="py-2" role="menu">
										<div className="px-4 py-2 border-b border-gray-100">
											<div className="flex justify-between items-center">
												<h3 className="text-sm font-semibold text-gray-900">
													Notifications
												</h3>
												<span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
													{notifications.length} new
												</span>
											</div>
										</div>
										<div className="max-h-96 overflow-y-auto">
											{notifications.map((notification) => (
												<div
													key={notification.id}
													className={`px-4 py-3 border-l-4 hover:bg-gray-50 transition-colors duration-150 ${getStatusColor(
														notification.status
													)}`}
												>
													<p className="text-sm font-medium text-gray-900">
														{notification.message}
													</p>
													<p className="mt-1 text-xs text-gray-500">
														{notification.time}
													</p>
												</div>
											))}
										</div>
										<div className="border-t border-gray-100 px-4 py-2">
											<Link
												href="/admin/notifications"
												className="text-sm font-medium text-blue-600 hover:text-blue-500"
											>
												View all notifications
											</Link>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Profile dropdown */}
						<div className="relative">
							<button
								className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
								onClick={() => setIsProfileOpen(!isProfileOpen)}
							>
								<div className="flex-shrink-0">
									<div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-medium">
										{user?.name?.charAt(0) || "A"}
									</div>
								</div>
								<div className="hidden md:block text-left">
									<p className="text-sm font-medium text-gray-900">
										{user?.name || "Admin"}
									</p>
									<p className="text-xs text-gray-500">Super Admin</p>
								</div>
								<ChevronDownIcon className="h-5 w-5 text-gray-400" />
							</button>

							{isProfileOpen && (
								<div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
									<div className="py-1" role="menu">
										<Link
											href="/admin/profile"
											className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											role="menuitem"
										>
											<UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
											Your Profile
										</Link>
										<Link
											href="/admin/settings"
											className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											role="menuitem"
										>
											<Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
											Settings
										</Link>
										<button
											onClick={logout}
											className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
											role="menuitem"
										>
											<ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400" />
											Sign out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</Container>
		</header>
	);
}
