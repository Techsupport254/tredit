"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
	ChevronRightIcon,
	HomeIcon,
	BellIcon,
	ChatBubbleLeftIcon,
	UserIcon,
	Cog6ToothIcon,
	ArrowRightOnRectangleIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";

type Route = {
	label: string;
	path: string;
	icon?: React.ElementType;
};

// Helper function to format enum values
const formatEnumValue = (value: string) => {
	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

interface BreadcrumbProps {
	isLoading?: boolean;
}

export default function Breadcrumb({ isLoading }: BreadcrumbProps) {
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();

	// Handle click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsProfileOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSignOut = async () => {
		setIsProfileOpen(false);
		await signOut({ redirect: false });
		router.push("/");
	};

	const handleMenuItemClick = () => {
		setIsProfileOpen(false);
	};

	// Convert pathname to breadcrumb items
	const generateBreadcrumbs = (): Route[] => {
		const paths = pathname.split("/").filter(Boolean);
		let currentPath = "";

		const items: Route[] = [
			{
				label: "Home",
				path: "/",
				icon: HomeIcon,
			},
		];

		paths.forEach((path) => {
			currentPath += `/${path}`;
			items.push({
				label: formatPathLabel(path),
				path: currentPath,
			});
		});

		return items;
	};

	// Format path label (e.g., "user-profile" -> "User Profile")
	const formatPathLabel = (path: string): string => {
		return path
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const breadcrumbs = generateBreadcrumbs();

	return (
		<div className="w-full bg-white border-b border-gray-200">
			<div className="max-w-[2000px] mx-auto px-4 py-2">
				<div className="flex justify-between items-center">
					{/* Breadcrumb Navigation */}
					<nav className="flex items-center space-x-1 text-base">
						{breadcrumbs.map((item, index) => (
							<div key={item.path} className="flex items-center">
								{index > 0 && (
									<ChevronRightIcon className="h-5 w-5 mx-2 text-gray-400 flex-shrink-0" />
								)}
								<Link
									href={{
										pathname: item.path,
									}}
									className={`flex items-center hover:text-gray-900 transition-colors ${
										index === breadcrumbs.length - 1
											? "text-blue-600 font-medium"
											: "text-gray-500"
									}`}
								>
									{item.icon && (
										<item.icon className="h-5 w-5 mr-1.5 flex-shrink-0" />
									)}
									<span>{item.label}</span>
								</Link>
							</div>
						))}
					</nav>

					{/* Right Section: Notifications, Messages, and User */}
					<div className="flex items-center space-x-6">
						{/* Notifications */}
						<button className="relative p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
							<BellIcon className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
						</button>

						{/* Messages */}
						<button className="relative p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
							<ChatBubbleLeftIcon className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
						</button>

						{/* User Profile */}
						{session?.user ? (
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className="flex items-center space-x-2 focus:outline-none rounded-full pl-1 pr-2 py-1 bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-600/50 transition-colors"
								>
									<div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-500">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="Profile"
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-white text-lg font-medium">
												{session.user.name?.[0]?.toUpperCase() || "U"}
											</div>
										)}
									</div>
									<div className="flex items-center space-x-2">
										<div className="flex flex-col items-start">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-200">
												{session.user.name}
											</span>
											<span className="text-xs text-gray-500 dark:text-gray-400">
												{formatEnumValue(session.user.role || "USER")}
											</span>
										</div>
										<ChevronDownIcon
											className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
												isProfileOpen ? "rotate-180" : ""
											}`}
										/>
									</div>
								</button>

								{/* Profile Dropdown */}
								{isProfileOpen && (
									<div className="absolute right-0 mt-1 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10">
										{/* User Info */}
										<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{session.user.name}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
												{session.user.email}
											</p>
										</div>

										{/* Menu Items */}
										<div className="py-1">
											<Link
												href="/dashboard/profile"
												onClick={handleMenuItemClick}
												className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
											>
												<UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
												Profile
											</Link>
											<Link
												href="/dashboard/settings"
												onClick={handleMenuItemClick}
												className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
											>
												<Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
												Settings
											</Link>
										</div>

										{/* Sign Out */}
										<div className="py-1 border-t border-gray-100 dark:border-gray-700">
											<button
												onClick={handleSignOut}
												className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group"
											>
												<ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 group-hover:text-red-700 dark:group-hover:text-red-300" />
												Sign out
											</button>
										</div>
									</div>
								)}
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
