"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const features = [
		{
			name: "Secure Escrow Service",
			description:
				"Our blockchain-powered escrow system ensures safe transactions between buyers and sellers, protecting both parties.",
			icon: (
				<svg
					className="w-6 h-6 text-[#3b82f6]"
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
				"Boost your sales by seamlessly connecting your social media presence with our secure e-commerce platform.",
			icon: (
				<svg
					className="w-6 h-6 text-[#3b82f6]"
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
			name: "Dispute Resolution",
			description:
				"Fair and transparent dispute resolution system to handle any transaction issues efficiently.",
			icon: (
				<svg
					className="w-6 h-6 text-[#3b82f6]"
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
	];

	return (
		<div className="bg-[#0a101c]">
			{/* Hero Section */}
			<div className="min-h-screen pt-16 overflow-hidden relative">
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#0a101c] via-[#0d1626] to-[#0a101c] z-0"></div>

				{/* Grid pattern overlay */}
				<div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center opacity-5 z-0"></div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
					<div className="lg:grid lg:grid-cols-12 lg:gap-8">
						<div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
							<div data-aos="fade-right">
								<div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#3b82f6]/10 to-[#2563eb]/10 border border-[#3b82f6]/20 mb-4">
									<span className="text-xs font-medium text-[#60a5fa]">
										Secure E-commerce for Kenyan SMEs
									</span>
								</div>
								<h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl">
									<span className="block">Trust in Every</span>
									<span className="block text-[#3b82f6]">
										Online Transaction
									</span>
								</h1>
								<p className="mt-6 text-lg text-gray-300 sm:text-xl">
									Experience secure online trading with our blockchain-powered
									escrow service. Perfect for businesses and individuals looking
									to buy and sell with confidence.
								</p>
								<div className="mt-10 sm:flex sm:justify-center lg:justify-start">
									<div className="rounded-md shadow">
										<Link
											href="/register"
											className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-all duration-200 transform hover:-translate-y-1"
										>
											Get Started
										</Link>
									</div>
									<div className="mt-3 sm:mt-0 sm:ml-3">
										<Link
											href="/features"
											className="w-full flex items-center justify-center px-8 py-3 border border-[#475569] text-base font-medium rounded-md text-gray-200 bg-[#1e293b] hover:bg-[#334155] transition-all duration-200 transform hover:-translate-y-1"
										>
											Learn More
										</Link>
									</div>
								</div>
							</div>
						</div>
						<div
							className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6"
							data-aos="fade-left"
						>
							<div className="relative w-full h-[400px] rounded-3xl shadow-2xl border border-[#1e293b]/40 overflow-hidden">
								<svg
									className="w-full h-full"
									viewBox="0 0 800 600"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<defs>
										<linearGradient
											id="areaGradient"
											x1="400"
											y1="100"
											x2="400"
											y2="500"
											gradientUnits="userSpaceOnUse"
										>
											<stop
												offset="0%"
												style={{ stopColor: "#3B82F6", stopOpacity: 0.2 }}
											/>
											<stop
												offset="100%"
												style={{ stopColor: "#3B82F6", stopOpacity: 0 }}
											/>
										</linearGradient>
										<linearGradient
											id="lineGradient"
											x1="0"
											y1="0"
											x2="800"
											y2="0"
											gradientUnits="userSpaceOnUse"
										>
											<stop offset="0%" style={{ stopColor: "#60A5FA" }} />
											<stop offset="100%" style={{ stopColor: "#3B82F6" }} />
										</linearGradient>
										<linearGradient
											id="barGradient"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="0%" style={{ stopColor: "#60A5FA" }} />
											<stop offset="100%" style={{ stopColor: "#3B82F6" }} />
										</linearGradient>
										<filter
											id="glow"
											x="-50%"
											y="-50%"
											width="200%"
											height="200%"
										>
											<feGaussianBlur
												in="SourceGraphic"
												stdDeviation="4"
												result="blur"
											/>
											<feColorMatrix
												in="blur"
												type="matrix"
												values="0 0 0 0 0.376471 0 0 0 0 0.509804 0 0 0 0 0.964706 0 0 0 1 0"
											/>
										</filter>
									</defs>
									<pattern
										id="grid"
										x="0"
										y="0"
										width="40"
										height="40"
										patternUnits="userSpaceOnUse"
									>
										<path
											d="M 40 0 L 0 0 0 40"
											fill="none"
											stroke="#1E293B"
											strokeWidth="0.5"
										/>
									</pattern>
									<rect width="800" height="600" fill="#0A101C" />
									<rect width="800" height="600" fill="url(#grid)" />
									<g transform="translate(0, 50)">
										<path
											d="M 0 400 L 0 300 C 160 280, 320 350, 480 200 S 640 100, 800 150 L 800 400 Z"
											fill="url(#areaGradient)"
										/>
										<path
											d="M 0 300 C 160 280, 320 350, 480 200 S 640 100, 800 150"
											stroke="url(#lineGradient)"
											strokeWidth="3"
											fill="none"
											filter="url(#glow)"
										/>
										<g transform="translate(100, 250)">
											<g>
												<rect
													x="0"
													y="0"
													width="20"
													height="100"
													fill="url(#barGradient)"
													opacity="0.8"
												/>
												<rect
													x="60"
													y="-20"
													width="20"
													height="120"
													fill="url(#barGradient)"
													opacity="0.8"
												/>
												<rect
													x="120"
													y="-40"
													width="20"
													height="140"
													fill="url(#barGradient)"
													opacity="0.8"
												/>
												<rect
													x="180"
													y="-10"
													width="20"
													height="110"
													fill="url(#barGradient)"
													opacity="0.8"
												/>
												<rect
													x="240"
													y="-50"
													width="20"
													height="150"
													fill="url(#barGradient)"
													opacity="0.8"
												/>
											</g>
										</g>
										<circle
											cx="480"
											cy="200"
											r="4"
											fill="#60A5FA"
											filter="url(#glow)"
										/>
										<circle
											cx="640"
											cy="100"
											r="4"
											fill="#60A5FA"
											filter="url(#glow)"
										/>
										<circle
											cx="320"
											cy="350"
											r="4"
											fill="#60A5FA"
											filter="url(#glow)"
										/>
									</g>
									<g transform="translate(50, 100)">
										<rect
											x="0"
											y="0"
											width="120"
											height="60"
											rx="8"
											fill="#1E293B"
											fillOpacity="0.8"
										/>
										<text
											x="20"
											y="25"
											fill="#60A5FA"
											style={{ fontFamily: "system-ui", fontSize: "14px" }}
										>
											Growth
										</text>
										<text
											x="20"
											y="45"
											fill="white"
											style={{
												fontFamily: "system-ui",
												fontSize: "20px",
												fontWeight: "bold",
											}}
										>
											+147%
										</text>
									</g>
									<g transform="translate(630, 100)">
										<rect
											x="0"
											y="0"
											width="120"
											height="60"
											rx="8"
											fill="#1E293B"
											fillOpacity="0.8"
										/>
										<text
											x="20"
											y="25"
											fill="#60A5FA"
											style={{ fontFamily: "system-ui", fontSize: "14px" }}
										>
											Revenue
										</text>
										<text
											x="20"
											y="45"
											fill="white"
											style={{
												fontFamily: "system-ui",
												fontSize: "20px",
												fontWeight: "bold",
											}}
										>
											$1.2M
										</text>
									</g>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Wave decoration at bottom */}
				<div className="absolute bottom-0 left-0 right-0">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1440 320"
						className="w-full"
					>
						<path
							fill="#1e293b"
							fillOpacity="1"
							d="M0,96L48,112C96,128,192,160,288,181.3C384,203,480,213,576,197.3C672,181,768,139,864,144C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
						></path>
					</svg>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-24 bg-[#1e293b]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center" data-aos="fade-up">
						<h2 className="text-base font-semibold text-[#3b82f6] tracking-wide uppercase">
							Features
						</h2>
						<p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
							Advanced tools for modern businesses
						</p>
						<p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
							Everything you need to manage, grow, and succeed in the digital
							age.
						</p>
					</div>
					<div className="mt-20">
						<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
							{features.map((feature, index) => (
								<div
									key={feature.name}
									className="bg-[#0f172a]/70 p-8 rounded-2xl shadow-xl border border-[#334155] hover:border-[#3b82f6]/50 hover:bg-[#0f172a] transition-all duration-300 transform hover:-translate-y-1"
									data-aos="fade-up"
									data-aos-delay={index * 100}
								>
									<div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center mb-5">
										{feature.icon}
									</div>
									<h3 className="text-xl font-bold text-white mb-3">
										{feature.name}
									</h3>
									<p className="text-gray-400">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="bg-[#0f172a]">
				<div className="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
						<div className="text-center" data-aos="fade-up" data-aos-delay="0">
							<dt className="text-5xl font-extrabold text-white">10,000+</dt>
							<dd className="mt-3 text-xl font-medium text-[#60a5fa]">
								Active Businesses
							</dd>
						</div>
						<div
							className="text-center"
							data-aos="fade-up"
							data-aos-delay="200"
						>
							<dt className="text-5xl font-extrabold text-white">98%</dt>
							<dd className="mt-3 text-xl font-medium text-[#60a5fa]">
								Customer Satisfaction
							</dd>
						</div>
						<div
							className="text-center"
							data-aos="fade-up"
							data-aos-delay="400"
						>
							<dt className="text-5xl font-extrabold text-white">24/7</dt>
							<dd className="mt-3 text-xl font-medium text-[#60a5fa]">
								Support Available
							</dd>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-[#1e293b]">
				<div
					className="max-w-5xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8"
					data-aos="zoom-in"
				>
					<div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl shadow-2xl overflow-hidden">
						<div className="relative pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20 lg:flex lg:items-center lg:justify-between">
							<div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-20">
								<svg width="404" height="404" fill="none" viewBox="0 0 404 404">
									<defs>
										<pattern
											id="pattern"
											x="0"
											y="0"
											width="20"
											height="20"
											patternUnits="userSpaceOnUse"
										>
											<rect
												x="0"
												y="0"
												width="4"
												height="4"
												fill="currentColor"
											/>
										</pattern>
									</defs>
									<rect width="404" height="404" fill="url(#pattern)" />
								</svg>
							</div>
							<div data-aos="fade-right" data-aos-delay="200">
								<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
									<span className="block">Ready to get started?</span>
									<span className="block text-[#93c5fd]">
										Join thousands of successful businesses
									</span>
								</h2>
								<p className="mt-4 text-lg leading-6 text-[#bfdbfe]">
									Start your journey today and experience the future of business
									management.
								</p>
							</div>
							<div
								className="mt-8 lg:mt-0 lg:flex-shrink-0"
								data-aos="fade-left"
								data-aos-delay="400"
							>
								<div className="inline-flex rounded-md shadow">
									<Link
										href="/register"
										className="mt-8 bg-white border border-transparent rounded-md shadow px-8 py-4 inline-flex items-center text-base font-medium text-[#1e40af] hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-1"
									>
										Sign up for free
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

{
	/* Add required animation keyframes to global styles */
}
<style jsx global>{`
	@keyframes growBar {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}
`}</style>;
