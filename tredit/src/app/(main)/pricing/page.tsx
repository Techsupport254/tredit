"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function Pricing() {
	const tiers = [
		{
			name: "Basic",
			id: "tier-basic",
			price: "1.5%",
			description: "Perfect for small businesses and individual sellers.",
			features: [
				"Secure escrow service",
				"Basic seller verification",
				"Standard dispute resolution",
				"M-Pesa integration",
				"Social media integration",
				"Mobile-responsive dashboard",
			],
			cta: "Start Selling",
			mostPopular: false,
		},
		{
			name: "Business",
			id: "tier-business",
			price: "1%",
			description: "For established businesses with regular transactions.",
			features: [
				"All Basic features",
				"Priority dispute resolution",
				"Advanced seller verification badge",
				"Multiple payment methods",
				"Bulk listing tools",
				"Priority customer support",
				"Transaction analytics",
			],
			cta: "Get Business",
			mostPopular: true,
		},
		{
			name: "Enterprise",
			id: "tier-enterprise",
			price: "Custom",
			description: "Custom solutions for large-scale operations.",
			features: [
				"All Business features",
				"Custom escrow rates",
				"Dedicated account manager",
				"API access",
				"Custom integration support",
				"24/7 priority support",
				"Advanced analytics",
				"White-label options",
			],
			cta: "Contact Sales",
			mostPopular: false,
		},
	];

	return (
		<div className="bg-[#0a101c]">
			{/* Header and Title */}
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0a101c] via-[#0d1626] to-[#0a101c]" />
				<div className="relative pt-12 px-4 sm:px-6 lg:px-8 lg:pt-20">
					<div className="text-center" data-aos="fade-up">
						<h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
							Transparent Pricing
						</h1>
						<p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
							Simple and affordable escrow fees to protect your transactions
						</p>
					</div>
				</div>
			</div>

			{/* Pricing Cards */}
			<div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-3">
					{tiers.map((tier, index) => (
						<div
							key={tier.id}
							className={`relative flex flex-col rounded-2xl border ${
								tier.mostPopular
									? "border-[#3b82f6] shadow-lg"
									: "border-[#334155]"
							} bg-[#1e293b] shadow-lg`}
							data-aos="fade-up"
							data-aos-delay={index * 100}
						>
							{tier.mostPopular && (
								<div className="absolute top-0 right-0 px-4 py-1 bg-[#3b82f6] rounded-bl-2xl rounded-tr-2xl text-xs font-semibold uppercase tracking-wide text-white">
									Most popular
								</div>
							)}
							<div className="p-6 sm:px-8">
								<h3 className="text-lg font-semibold text-white">
									{tier.name}
								</h3>
								<p className="mt-4 text-sm text-gray-400">{tier.description}</p>
								<p className="mt-8">
									<span className="text-4xl font-extrabold text-white">
										{tier.price}
									</span>
									{tier.price !== "Custom" && (
										<span className="text-base font-medium text-gray-400">
											{" "}
											per transaction
										</span>
									)}
								</p>
								<Link
									href={tier.name === "Enterprise" ? "/contact" : "/register"}
									className={`mt-8 block w-full py-3 px-4 rounded-md text-sm font-semibold text-center text-white ${
										tier.mostPopular
											? "bg-[#3b82f6] hover:bg-[#2563eb]"
											: "bg-[#334155] hover:bg-[#475569]"
									} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]`}
								>
									{tier.cta}
								</Link>
							</div>
							<div className="flex-1 flex flex-col justify-between p-6 bg-[#0d1626] space-y-6 sm:p-8 rounded-bl-2xl rounded-br-2xl">
								<ul className="space-y-4">
									{tier.features.map((feature, i) => (
										<li key={i} className="flex items-start">
											<div className="flex-shrink-0">
												<CheckIcon
													className="h-6 w-6 text-[#3b82f6]"
													aria-hidden="true"
												/>
											</div>
											<p className="ml-3 text-base text-gray-300">{feature}</p>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* FAQ Section */}
			<div className="bg-[#1e293b]" data-aos="fade-up">
				<div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-extrabold text-center text-white">
						Frequently asked questions
					</h2>
					<div className="mt-12">
						<dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
							{[
								{
									question: "How do escrow payments work?",
									answer:
										"When a buyer makes a purchase, the payment is securely held in escrow. Once the buyer confirms receipt and satisfaction with the item, the funds are released to the seller.",
								},
								{
									question: "When are escrow fees charged?",
									answer:
										"Escrow fees are only charged when a transaction is successfully completed. The fee is calculated based on your tier and the transaction amount.",
								},
								{
									question: "What payment methods are supported?",
									answer:
										"We support M-Pesa and other popular payment methods in Kenya. The funds are securely held in escrow regardless of the payment method used.",
								},
								{
									question: "How are disputes handled?",
									answer:
										"Our dedicated team handles disputes fairly and efficiently. Business and Enterprise users get priority resolution to minimize any delays.",
								},
								{
									question: "Can I upgrade my plan?",
									answer:
										"Yes, you can upgrade your plan at any time as your business grows. Your new rate will apply to transactions after the upgrade.",
								},
								{
									question: "Is there a minimum transaction amount?",
									answer:
										"There is no minimum transaction amount, but we recommend using escrow for transactions above KES 1,000 to make the fees worthwhile.",
								},
							].map((faq, index) => (
								<div key={index} className="space-y-2">
									<dt className="text-lg font-medium text-white">
										{faq.question}
									</dt>
									<dd className="text-base text-gray-400">{faq.answer}</dd>
								</div>
							))}
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}
