"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
	HomeIcon,
	ShoppingBagIcon,
	UserIcon,
	CreditCardIcon,
	ChatBubbleLeftRightIcon,
	Cog6ToothIcon,
	ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
	{ name: "Dashboard", href: "/dashboard", icon: HomeIcon },
	{ name: "Products", href: "/dashboard/products", icon: ShoppingBagIcon },
	{ name: "Profile", href: "/dashboard/profile", icon: UserIcon },
	{
		name: "Transactions",
		href: "/dashboard/transactions",
		icon: CreditCardIcon,
	},
	{
		name: "Messages",
		href: "/dashboard/messages",
		icon: ChatBubbleLeftRightIcon,
	},
	{ name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function DashboardSidebar() {
	const pathname = usePathname();
	const { logout } = useAuth();

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(`${path}/`);
	};

	return (
		<div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
			<div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
				<div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
					<Link href="/" className="flex items-center space-x-2">
						<img className="h-8 w-auto" src="/favicon.svg" alt="Tredit Logo" />
						<span className="text-lg font-semibold text-gray-900">Tredit</span>
					</Link>
				</div>
				<div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
					<nav className="mt-5 flex-1 px-4 space-y-1">
						{menuItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
									isActive(item.href)
										? "bg-blue-50 text-blue-600"
										: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
								}`}
							>
								<item.icon
									className={`mr-3 flex-shrink-0 h-5 w-5 ${
										isActive(item.href)
											? "text-blue-500"
											: "text-gray-400 group-hover:text-gray-500"
									}`}
									aria-hidden="true"
								/>
								{item.name}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex-shrink-0 flex border-t border-gray-200 p-4">
					<button
						onClick={logout}
						className="flex-shrink-0 w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
					>
						<ArrowRightOnRectangleIcon
							className="mr-3 flex-shrink-0 h-5 w-5 text-red-500"
							aria-hidden="true"
						/>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
