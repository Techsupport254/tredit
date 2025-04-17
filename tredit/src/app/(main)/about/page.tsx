"use client";

import Image from "next/image";

export default function About() {
	return (
		<div className="bg-[#0a101c]">
			{/* Hero Section */}
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0a101c] via-[#0d1626] to-[#0a101c]" />
				<div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
					<h1
						className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
						data-aos="fade-up"
					>
						About Tredit
					</h1>
					<p
						className="mt-6 text-xl text-gray-300 max-w-3xl"
						data-aos="fade-up"
						data-aos-delay="200"
					>
						Building trust in Kenya's digital marketplace through blockchain
						technology and secure escrow services.
					</p>
				</div>
			</div>

			{/* Our Story */}
			<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
				<div className="lg:text-center" data-aos="fade-up">
					<h2 className="text-base text-[#3b82f6] font-semibold tracking-wide uppercase">
						Our Story
					</h2>
					<p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
						Transforming Online Trade in Kenya
					</p>
					<p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">
						Founded in 2024, Tredit was created to address the trust gap in
						Kenya's growing e-commerce sector. By combining blockchain
						technology with user-friendly design, we're making online trading
						safer and more accessible for SMEs and individual sellers across
						Kenya.
					</p>
				</div>
			</div>

			{/* Values */}
			<div className="bg-[#1e293b]">
				<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div
							className="bg-[#0d1626] p-6 rounded-lg shadow-lg border border-[#334155]"
							data-aos="fade-up"
							data-aos-delay="0"
						>
							<div className="w-12 h-12 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								Trust & Security
							</h3>
							<p className="text-gray-400">
								We prioritize building trust through secure blockchain
								technology and transparent escrow services, ensuring safe
								transactions for all parties.
							</p>
						</div>
						<div
							className="bg-[#0d1626] p-6 rounded-lg shadow-lg border border-[#334155]"
							data-aos="fade-up"
							data-aos-delay="200"
						>
							<div className="w-12 h-12 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								Local Focus
							</h3>
							<p className="text-gray-400">
								Designed specifically for the Kenyan market, integrating with
								familiar payment systems and addressing local e-commerce
								challenges.
							</p>
						</div>
						<div
							className="bg-[#0d1626] p-6 rounded-lg shadow-lg border border-[#334155]"
							data-aos="fade-up"
							data-aos-delay="400"
						>
							<div className="w-12 h-12 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								Community Growth
							</h3>
							<p className="text-gray-400">
								Supporting SMEs in their digital journey by providing the tools
								and platform they need to grow their online presence safely.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Vision Section */}
			<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
				<div className="text-center" data-aos="fade-up">
					<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
						Our Vision
					</h2>
					<p className="mt-4 text-lg text-gray-400">
						To become the most trusted e-commerce platform in Kenya, empowering
						businesses through secure blockchain technology
					</p>
				</div>
				<div className="mt-12 grid gap-8 md:grid-cols-2">
					<div className="text-center" data-aos="fade-up" data-aos-delay="0">
						<div className="bg-[#1e293b] p-6 rounded-lg shadow-lg border border-[#334155]">
							<h3 className="text-lg font-medium text-white mb-4">
								For Sellers
							</h3>
							<p className="text-gray-400">
								We provide a secure platform for SMEs to expand their reach,
								build trust with customers, and grow their business online. Our
								blockchain-based escrow system ensures you receive payment for
								every successful transaction.
							</p>
						</div>
					</div>
					<div className="text-center" data-aos="fade-up" data-aos-delay="200">
						<div className="bg-[#1e293b] p-6 rounded-lg shadow-lg border border-[#334155]">
							<h3 className="text-lg font-medium text-white mb-4">
								For Buyers
							</h3>
							<p className="text-gray-400">
								Shop with confidence knowing your money is protected by our
								escrow system. Only release payment when you're satisfied with
								your purchase, with our support team ready to help resolve any
								disputes.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-[#1e293b]">
				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
					<h2
						className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
						data-aos="fade-right"
					>
						<span className="block">Ready to start trading securely?</span>
						<span className="block text-[#3b82f6]">
							Join the future of e-commerce in Kenya.
						</span>
					</h2>
					<div
						className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
						data-aos="fade-left"
					>
						<div className="inline-flex rounded-md shadow">
							<a
								href="/register"
								className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb]"
							>
								Get Started
							</a>
						</div>
						<div className="ml-3 inline-flex rounded-md shadow">
							<a
								href="/contact"
								className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-200 bg-[#334155] hover:bg-[#475569]"
							>
								Contact Us
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
