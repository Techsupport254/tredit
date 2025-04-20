"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
	Bars3Icon,
	BellIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function DashboardHeader() {
	const { user } = useAuth();
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left side: Mobile menu button */}
					<div className="flex items-center md:hidden">
						<button
							type="button"
							className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
							aria-controls="mobile-menu"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
						</button>
					</div>

					{/* Middle: Search (hidden on mobile) */}
					<div className="hidden md:block md:flex-1 md:flex md:justify-center">
						<div className="max-w-xs w-full">
							<label htmlFor="search" className="sr-only">
								Search
							</label>
							<div className="relative text-gray-400 focus-within:text-gray-600">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg
										className="h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<input
									id="search"
									name="search"
									className="block w-full bg-gray-50 py-2 pl-10 pr-3 border border-gray-200 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:placeholder-gray-400 sm:text-sm"
									placeholder="Search"
									type="search"
								/>
							</div>
						</div>
					</div>

					{/* Right side: Notifications and profile */}
					<div className="flex items-center">
						<button
							type="button"
							className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<span className="sr-only">View notifications</span>
							<BellIcon className="h-6 w-6" aria-hidden="true" />
						</button>

						{/* Profile dropdown */}
						<div className="ml-3 relative">
							<div>
								<button
									type="button"
									className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									id="user-menu-button"
									onClick={() => setIsProfileOpen(!isProfileOpen)}
								>
									<span className="sr-only">Open user menu</span>
									<div className="flex items-center space-x-2">
										<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
											<span className="text-sm font-medium text-gray-700">
												{user?.name?.charAt(0) || "U"}
											</span>
										</div>
										<span className="hidden md:block text-sm font-medium text-gray-700">
											{user?.name || "User"}
										</span>
										<ChevronDownIcon
											className={`hidden md:block h-4 w-4 text-gray-400 transition-transform duration-200 ${
												isProfileOpen ? "transform rotate-180" : ""
											}`}
											aria-hidden="true"
										/>
									</div>
								</button>
							</div>

							{isProfileOpen && (
								<div
									className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="user-menu-button"
								>
									<div className="py-1" role="none">
										<Link
											href="/dashboard/profile"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											role="menuitem"
											onClick={() => setIsProfileOpen(false)}
										>
											Your Profile
										</Link>
										<Link
											href="/dashboard/settings"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											role="menuitem"
											onClick={() => setIsProfileOpen(false)}
										>
											Settings
										</Link>
										<button
											onClick={() => {
												setIsProfileOpen(false);
												useAuth().logout();
											}}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
											role="menuitem"
										>
											Sign out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
