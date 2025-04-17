"use client";

import Image from "next/image";

export default function Features() {
	const features = [
		{
			name: "Blockchain-Powered Escrow",
			description:
				"Our secure escrow system uses Polygon blockchain to hold funds safely until both buyer and seller are satisfied with the transaction. This eliminates the risk of fraud and builds trust in online trading.",
			icon: (
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
			),
		},
		{
			name: "Social Media Integration",
			description:
				"Connect your social media presence to your Tredit store. Boost your sales by reaching customers where they are, while maintaining the security of our escrow system.",
			icon: (
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
						d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
					/>
				</svg>
			),
		},
		{
			name: "Fair Dispute Resolution",
			description:
				"Our transparent dispute resolution system ensures fair outcomes. Administrators review evidence from both parties and make informed decisions to resolve any transaction issues.",
			icon: (
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
						d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
					/>
				</svg>
			),
		},
		{
			name: "Mobile-First Design",
			description:
				"Access Tredit anywhere with our mobile-responsive platform. List products, manage transactions, and track orders from your smartphone or tablet.",
			icon: (
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
						d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			name: "Secure Payments",
			description:
				"Support for familiar payment methods like M-Pesa, while leveraging blockchain technology behind the scenes for maximum security and transparency.",
			icon: (
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
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
		},
		{
			name: "Seller Verification",
			description:
				"Build trust with verified seller badges and ratings. Our platform helps buyers identify reliable sellers through transaction history and user reviews.",
			icon: (
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
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			),
		},
	];

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
						Secure Trading Features
					</h1>
					<p
						className="mt-6 text-xl text-gray-300 max-w-3xl"
						data-aos="fade-up"
						data-aos-delay="200"
					>
						Discover how Tredit makes online trading safe and efficient for
						Kenyan SMEs
					</p>
				</div>
			</div>

			{/* Features Grid */}
			<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<div
							key={feature.name}
							className="bg-[#1e293b] p-6 rounded-lg shadow-lg border border-[#334155]"
							data-aos="fade-up"
							data-aos-delay={index * 100}
						>
							<div className="w-12 h-12 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg flex items-center justify-center mb-4">
								{feature.icon}
							</div>
							<h3 className="text-lg font-medium text-white mb-2">
								{feature.name}
							</h3>
							<p className="text-gray-400">{feature.description}</p>
						</div>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-[#1e293b]">
				<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
					<h2
						className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
						data-aos="fade-right"
					>
						<span className="block">Ready to trade securely?</span>
						<span className="block text-[#3b82f6]">Join Tredit today.</span>
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
								href="/about"
								className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-200 bg-[#334155] hover:bg-[#475569]"
							>
								Learn More
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
