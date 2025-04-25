"use client";

import { Business } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type BusinessWithMinimalFields = Pick<
	Business,
	"id" | "name" | "description" | "logo"
>;

interface FooterProps {
	business: BusinessWithMinimalFields;
	logoUrl: string | null;
}

export default function Footer({ business, logoUrl }: FooterProps) {
	// Add null checks and fallbacks
	const businessName = business?.name || "Business";
	const businessDescription = business?.description || "";
	const businessInitial = businessName.charAt(0);
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-[#0f172a] border-t border-[#1e293b] relative">
			{/* Subtle dot pattern overlay */}
			<div
				className="absolute inset-0 opacity-10 pointer-events-none"
				style={{
					backgroundImage: `radial-gradient(rgba(96, 165, 250, 0.7) 1px, transparent 1px)`,
					backgroundSize: "20px 20px",
				}}
			/>

			<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
					{/* Business Info - 60% */}
					<div className="md:col-span-7 space-y-6">
						<div className="flex items-center">
							{logoUrl ? (
								<img
									src={logoUrl}
									alt={businessName}
									className="h-12 w-12 rounded-lg object-cover"
								/>
							) : (
								<div className="h-12 w-12 rounded-lg bg-[#1e293b] flex items-center justify-center">
									<span className="text-2xl text-[#60a5fa]">
										{businessInitial}
									</span>
								</div>
							)}
							<span className="text-white text-2xl font-bold ml-2">
								{businessName}
							</span>
						</div>
						<p className="text-gray-400 text-base">{businessDescription}</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
							<div>
								<h3 className="text-sm font-semibold text-[#60a5fa] tracking-wider uppercase">
									Business
								</h3>
								<ul className="mt-4 space-y-3">
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											About {businessName}
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											Products & Services
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											Contact Us
										</a>
									</li>
								</ul>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-[#60a5fa] tracking-wider uppercase">
									Support
								</h3>
								<ul className="mt-4 space-y-3">
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											Help Center
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											Privacy Policy
										</a>
									</li>
									<li>
										<a
											href="#"
											className="text-base text-gray-400 hover:text-white"
										>
											Terms of Service
										</a>
									</li>
								</ul>
							</div>
						</div>

						<div className="flex space-x-5 pt-2">
							<a
								href="#"
								className="text-gray-400 hover:text-[#3b82f6]"
								aria-label="Twitter"
							>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-[#3b82f6]"
								aria-label="Facebook"
							>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-[#3b82f6]"
								aria-label="Instagram"
							>
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
						</div>
					</div>

					{/* Tredit Platform Info - 40% */}
					<div className="md:col-span-5 flex flex-col">
						<div className="bg-[#1e293b] p-6 rounded-xl relative overflow-hidden">
							{/* Subtle gradient accent */}
							<div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-xl"></div>

							<div className="flex items-center mb-4">
								<div className="relative w-10 h-10">
									<Image
										src="/logo.svg"
										alt="TredIt Logo"
										fill
										className="object-contain"
									/>
								</div>
								<span className="ml-2 font-bold text-2xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
									TredIt
								</span>
							</div>

							<p className="text-gray-300 mb-6">
								TredIt is a revolutionary marketplace platform connecting
								businesses and customers. Join thousands of businesses and
								millions of customers on our secure, reliable platform.
							</p>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-semibold text-[#60a5fa] tracking-wider uppercase mb-3">
										Platform
									</h4>
									<ul className="space-y-2">
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												About TredIt
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Features
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Marketplace
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Pricing
											</Link>
										</li>
									</ul>
								</div>
								<div>
									<h4 className="text-sm font-semibold text-[#60a5fa] tracking-wider uppercase mb-3">
										Resources
									</h4>
									<ul className="space-y-2">
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Documentation
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												API
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Blog
											</Link>
										</li>
										<li>
											<Link
												href="/"
												className="text-gray-400 hover:text-white text-sm"
											>
												Contact
											</Link>
										</li>
									</ul>
								</div>
							</div>

							{/* Social icons for Tredit */}
							<div className="mt-6 pt-5 border-t border-gray-700/50">
								<h4 className="text-sm font-semibold text-[#60a5fa] tracking-wider uppercase mb-3">
									Connect with TredIt
								</h4>
								<div className="flex space-x-5">
									<a
										href="#"
										className="text-gray-400 hover:text-blue-400 transition duration-200"
									>
										<svg
											className="h-6 w-6"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-400 hover:text-blue-600 transition duration-200"
									>
										<svg
											className="h-6 w-6"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-400 hover:text-pink-600 transition duration-200"
									>
										<svg
											className="h-6 w-6"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-400 hover:text-red-600 transition duration-200"
									>
										<svg
											className="h-6 w-6"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.004A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z" />
										</svg>
									</a>
									<a
										href="#"
										className="text-gray-400 hover:text-[#6441a5] transition duration-200"
									>
										<svg
											className="h-6 w-6"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M4.2 2H19.8A2.2 2.2 0 0 1 22 4.2V19.8A2.2 2.2 0 0 1 19.8 22H4.2A2.2 2.2 0 0 1 2 19.8V4.2A2.2 2.2 0 0 1 4.2 2M8.6 13.8L12.1 10.3L15.5 13.7L19 10.2V19.7H5V7.9L8.6 11.4V13.8Z" />
										</svg>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Copyright and Legal */}
				<div className="mt-12 pt-8 border-t border-[#1e293b]">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-gray-500">
							&copy; {currentYear} {businessName}. All rights reserved.
						</p>
						<div className="mt-4 md:mt-0 flex items-center">
							<p className="text-sm text-gray-500">
								Powered by{" "}
								<span className="text-blue-400 font-medium">TredIt</span> |
								&copy; {currentYear} TredIt Technologies Ltd.
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
