"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
	HomeIcon,
	UsersIcon,
	ShoppingBagIcon,
	ExclamationTriangleIcon,
	CogIcon,
	ChartBarIcon,
	ArrowRightOnRectangleIcon,
	WalletIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
	{
		name: "Dashboard",
		href: "/admin",
		icon: HomeIcon,
		description: "Overview and statistics",
	},
	{
		name: "Users",
		href: "/admin/users",
		icon: UsersIcon,
		description: "Manage platform users",
	},
	{
		name: "Transactions",
		href: "/admin/transactions",
		icon: ShoppingBagIcon,
		description: "Monitor escrow transactions",
	},
	{
		name: "Disputes",
		href: "/admin/disputes",
		icon: ExclamationTriangleIcon,
		description: "Handle user disputes",
	},
	{
		name: "Analytics",
		href: "/admin/analytics",
		icon: ChartBarIcon,
		description: "Platform performance metrics",
	},
	{
		name: "Wallet",
		href: "/admin/wallet",
		icon: WalletIcon,
		description: "Manage escrow wallet",
	},
	{
		name: "Settings",
		href: "/admin/settings",
		icon: CogIcon,
		description: "Platform configuration",
	},
];

export default function AdminSidebar() {
	const pathname = usePathname();
	const { logout } = useAuth();

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(`${path}/`);
	};

	return (
		<div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
			<div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-900 to-gray-800">
				<div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
					<Link
						href="/admin"
						className="flex items-center space-x-3 px-2 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
					>
						<div className="relative w-8 h-8">
							<Image
								src="/logo.svg"
								alt="Tredit Admin"
								fill
								sizes="32px"
								className="object-contain"
							/>
						</div>
						<span className="text-lg font-semibold text-white">
							Tredit Admin
						</span>
					</Link>
				</div>
				<div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
					<nav className="mt-5 flex-1 px-3 space-y-2">
						{menuItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
									isActive(item.href)
										? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<item.icon
									className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
										isActive(item.href)
											? "text-white"
											: "text-gray-400 group-hover:text-white"
									}`}
									aria-hidden="true"
								/>
								<div>
									<div className="flex items-center">
										{item.name}
										{item.name === "Disputes" && (
											<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
												2
											</span>
										)}
									</div>
									<p
										className={`mt-0.5 text-xs ${
											isActive(item.href) ? "text-blue-100" : "text-gray-500"
										}`}
									>
										{item.description}
									</p>
								</div>
							</Link>
						))}
					</nav>
				</div>
				<div className="flex-shrink-0 flex border-t border-gray-800 p-4">
					<button
						onClick={logout}
						className="flex-shrink-0 w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200"
					>
						<ArrowRightOnRectangleIcon
							className="mr-3 flex-shrink-0 h-5 w-5"
							aria-hidden="true"
						/>
						<div>
							<div>Sign Out</div>
							<p className="mt-0.5 text-xs text-gray-500">End admin session</p>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}
