"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
	UserIcon,
	Cog6ToothIcon,
	ArrowRightOnRectangleIcon,
	SquaresPlusIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Helper function to format enum values
const formatEnumValue = (value: string) => {
	return value
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
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

	const navigation = [
		{ name: "Home", href: "/" },
		{ name: "Features", href: "/features" },
		{ name: "About", href: "/about" },
		{ name: "Pricing", href: "/pricing" },
		{ name: "Contact", href: "/contact" },
	];

	const handleSignOut = async () => {
		setIsProfileOpen(false);
		await signOut({ redirect: false });
		router.push("/");
	};

	const handleMenuItemClick = () => {
		setIsProfileOpen(false);
	};

	return (
		<nav className="sticky top-0 z-50 bg-[#121826]/80 backdrop-blur-lg border-b border-[#2a324b]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<div className="flex-shrink-0 flex items-center">
								<Image
									src="/logo.svg"
									alt="TredIt Logo"
									width={48}
									height={48}
									className="h-12 w-12"
									priority
								/>
								<span className="text-white text-2xl font-bold">TredIt</span>
							</div>
						</Link>
						<div className="hidden md:ml-10 md:flex md:space-x-8">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
										pathname === item.href
											? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
											: "text-gray-300 hover:text-white"
									}`}
								>
									{item.name}
								</Link>
							))}
						</div>
					</div>
					<div className="hidden md:flex md:items-center space-x-4">
						{session?.user ? (
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setIsProfileOpen(!isProfileOpen)}
									className="flex items-center space-x-3 focus:outline-none group bg-gray-800/50 rounded-full pr-3 pl-1 py-1 hover:bg-gray-700/50 transition-colors"
								>
									<div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-600 ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="Profile"
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600">
												{session.user.name?.[0] || "U"}
											</div>
										)}
									</div>
									<div className="flex flex-col items-start">
										<span className="text-gray-100 group-hover:text-white transition-colors text-sm font-medium">
											{session.user.name}
										</span>
										<span className="text-gray-400 text-xs">
											{formatEnumValue(session.user.role || "USER")}
										</span>
									</div>
									<ChevronDownIcon
										className={`w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-300 ${
											isProfileOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								{/* Profile Dropdown */}
								{isProfileOpen && (
									<div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-800 transform opacity-100 scale-100 transition-all duration-200">
										{/* User Info */}
										<div className="px-4 py-3">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{session.user.name}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
												{session.user.email}
											</p>
											<p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
												{formatEnumValue(session.user.role || "USER")}
											</p>
										</div>

										{/* Menu Items */}
										<div className="py-1">
											<Link
												href="/dashboard"
												onClick={handleMenuItemClick}
												className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group"
											>
												<SquaresPlusIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
												Dashboard
											</Link>
											<Link
												href="/dashboard/profile"
												onClick={handleMenuItemClick}
												className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group"
											>
												<UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
												Profile
											</Link>
											<Link
												href="/dashboard/settings"
												onClick={handleMenuItemClick}
												className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group"
											>
												<Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
												Settings
											</Link>
										</div>

										{/* Sign Out */}
										<div className="py-1">
											<button
												onClick={handleSignOut}
												className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 group"
											>
												<ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 group-hover:text-red-700 dark:group-hover:text-red-300" />
												Sign out
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<>
								<Link
									href="/login"
									className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white hover:bg-gray-800 transition-colors duration-200"
								>
									Sign in
								</Link>
								<Link
									href="/register"
									className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200"
								>
									Get Started
								</Link>
							</>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
						>
							<span className="sr-only">Open main menu</span>
							{!isMenuOpen ? (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div
				className={`${isMenuOpen ? "block" : "hidden"} md:hidden bg-[#1a202e]`}
			>
				<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
					{navigation.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className={`block px-3 py-2 rounded-md text-base font-medium ${
								pathname === item.href
									? "bg-[#2a324b] text-white"
									: "text-gray-300 hover:bg-gray-700 hover:text-white"
							}`}
						>
							{item.name}
						</Link>
					))}
				</div>
				<div className="pt-4 pb-3 border-t border-gray-700">
					{session?.user ? (
						<div className="px-2 space-y-1">
							<div className="px-3 py-2">
								<div className="flex items-center">
									<div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600 ring-2 ring-gray-700">
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="Profile"
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600">
												{session.user.name?.[0] || "U"}
											</div>
										)}
									</div>
									<div className="ml-3">
										<div className="text-base font-medium text-white">
											{session.user.name}
										</div>
										<div className="text-sm font-medium text-gray-400">
											{formatEnumValue(session.user.role || "USER")}
										</div>
									</div>
								</div>
							</div>

							<Link
								href="/dashboard"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
							>
								Dashboard
							</Link>
							<Link
								href="/dashboard/profile"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
							>
								Profile
							</Link>
							<Link
								href="/dashboard/settings"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
							>
								Settings
							</Link>
							<button
								onClick={handleSignOut}
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
							>
								Sign out
							</button>
						</div>
					) : (
						<div className="px-2 space-y-1">
							<Link
								href="/login"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
							>
								Sign in
							</Link>
							<Link
								href="/register"
								className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] m-2"
							>
								Get Started
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
