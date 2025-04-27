"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	HomeIcon,
	ShoppingBagIcon,
	UserIcon,
	CreditCardIcon,
	Cog6ToothIcon,
	BuildingOfficeIcon,
	ChatBubbleLeftRightIcon,
	ExclamationTriangleIcon,
	DocumentTextIcon,
	ShieldCheckIcon,
	BanknotesIcon,
	ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type NavigationItem = {
	name: string;
	href: any;
	icon: React.ElementType;
	badge?: string;
};

export default function DashboardSidebar() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [pendingCount, setPendingCount] = useState<number | null>(null);

	useEffect(() => {
		async function fetchPendingOrders() {
			if (!session?.user) return;
			try {
				const res = await fetch("/api/dashboard/orders/pending-count");
				if (res.ok) {
					const data = await res.json();
					setPendingCount(data.count);
				}
			} catch (e) {
				setPendingCount(null);
			}
		}
		fetchPendingOrders();
	}, [session?.user]);

	const navigation: NavigationItem[] = [
		{ name: "Dashboard", href: "/dashboard", icon: HomeIcon },

		{
			name: "Businesses",
			href: "/dashboard/businesses",
			icon: BuildingOfficeIcon,
		},
		{
			name: "Products",
			href: "/dashboard/products",
			icon: ShoppingBagIcon,
		},
		{
			name: "Orders",
			href: "/dashboard/orders",
			icon: ShoppingBagIcon,
			badge:
				pendingCount !== null && pendingCount > 0
					? String(pendingCount)
					: undefined,
		},
		{
			name: "Profile",
			href: "/dashboard/profile",
			icon: UserIcon,
		},
		{
			name: "Transactions",
			href: "/dashboard/transactions",
			icon: CreditCardIcon,
			badge: "3",
		},
		{
			name: "Disputes",
			href: "/dashboard/disputes",
			icon: ExclamationTriangleIcon,
		},
		{
			name: "Messages",
			href: "/dashboard/messages",
			icon: ChatBubbleLeftRightIcon,
		},
		{
			name: "Documents",
			href: "/dashboard/documents",
			icon: DocumentTextIcon,
		},
		{
			name: "Escrow",
			href: "/dashboard/escrow",
			icon: ShieldCheckIcon,
		},
		{
			name: "Payments",
			href: "/dashboard/payments",
			icon: BanknotesIcon,
		},
		{
			name: "Settings",
			href: "/dashboard/settings",
			icon: Cog6ToothIcon,
		},
	];

	return (
		<div className="w-64 flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
			{/* Logo Section */}
			<div className="flex flex-col items-center justify-center p-6">
				<Link href="/dashboard" className="flex flex-col items-center">
					<img src="/logo.svg" alt="Tredit" className="h-12 w-auto" />
					<span className="mt-2 text-gray-500 dark:text-gray-400 text-lg font-bold">
						TredIT
					</span>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-4">
				<ul className="space-y-1 px-3">
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
										isActive
											? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
											: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
									)}
								>
									<item.icon
										className={cn(
											"h-5 w-5",
											isActive
												? "text-blue-600 dark:text-blue-400"
												: "text-gray-400 dark:text-gray-500"
										)}
									/>
									<div className="flex items-center justify-between flex-1">
										<span>{item.name}</span>
										{item.badge && (
											<span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
												{item.badge}
											</span>
										)}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Back to Home Link */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-800">
				<Link
					href="/"
					className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<ArrowLeftIcon className="h-5 w-5" />
					<span>Back to Home</span>
				</Link>
			</div>
		</div>
	);
}
