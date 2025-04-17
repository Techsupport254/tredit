"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();

	const navigation = [
		{ name: "Home", href: "/" },
		{ name: "Features", href: "/features" },
		{ name: "About", href: "/about" },
		{ name: "Pricing", href: "/pricing" },
		{ name: "Contact", href: "/contact" },
	];

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
					<div className="hidden md:flex md:items-center">
						<Link
							href="/login"
							className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white hover:bg-gray-800 transition-colors duration-200"
						>
							Sign in
						</Link>
						<Link
							href="/register"
							className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200"
						>
							Get Started
						</Link>
					</div>
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
					<div className="px-2 space-y-1">
						<Link
							href="/login"
							className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Sign in
						</Link>
						<Link
							href="/register"
							className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] my-2 mx-2"
						>
							Get Started
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
