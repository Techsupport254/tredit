"use client";

import { useState } from "react";
import Link from "next/link";

export default function Contact() {
	const [formSubmitted, setFormSubmitted] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		setFormSubmitted(true);
	};

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
						Contact Us
					</h1>
					<p
						className="mt-6 text-xl text-gray-300 max-w-3xl"
						data-aos="fade-up"
						data-aos-delay="200"
					>
						Have questions about our escrow service? Need help with a
						transaction? Our team is here to assist you.
					</p>
				</div>
			</div>

			{/* Contact Form Section */}
			<div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					{/* Contact Information */}
					<div data-aos="fade-right">
						<h2 className="text-3xl font-extrabold text-white">Get in touch</h2>
						<p className="mt-4 text-lg text-gray-400">
							Whether you're a buyer or seller, we're here to help you trade
							safely. Reach out to us for support with escrow services, dispute
							resolution, or general inquiries.
						</p>

						<div className="mt-8 space-y-6">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="h-6 w-6 text-[#3b82f6]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
								</div>
								<div className="ml-3 text-gray-300">+254 (700) 123-456</div>
							</div>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="h-6 w-6 text-[#3b82f6]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div className="ml-3 text-gray-300">support@tredit.co.ke</div>
							</div>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="h-6 w-6 text-[#3b82f6]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<div className="ml-3 text-gray-300">
									Westlands Business Center
									<br />
									Nairobi, Kenya
								</div>
							</div>
						</div>

						<div className="mt-12">
							<h3 className="text-lg font-medium text-white">
								Connect with us
							</h3>
							<div className="mt-4 flex space-x-6">
								<a href="#" className="text-gray-400 hover:text-[#3b82f6]">
									<span className="sr-only">Twitter</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</a>
								<a href="#" className="text-gray-400 hover:text-[#3b82f6]">
									<span className="sr-only">LinkedIn</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
									</svg>
								</a>
								<a href="#" className="text-gray-400 hover:text-[#3b82f6]">
									<span className="sr-only">Facebook</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											fillRule="evenodd"
											d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div
						className="bg-[#1e293b] p-8 rounded-lg shadow-lg"
						data-aos="fade-left"
					>
						{formSubmitted ? (
							<div className="bg-[#0d1626] border border-[#3b82f6] rounded-lg p-8 text-center">
								<svg
									className="w-16 h-16 text-[#3b82f6] mx-auto"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								<h3 className="mt-4 text-lg font-medium text-white">
									Message sent successfully!
								</h3>
								<p className="mt-2 text-gray-300">
									Thank you for contacting us. We'll get back to you shortly.
								</p>
								<button
									onClick={() => setFormSubmitted(false)}
									className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]"
								>
									Send another message
								</button>
							</div>
						) : (
							<form
								onSubmit={handleSubmit}
								className="grid grid-cols-1 gap-y-6"
							>
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-white"
									>
										Name
									</label>
									<div className="mt-1">
										<input
											type="text"
											name="name"
											id="name"
											required
											className="block w-full bg-[#0d1626] border border-[#334155] rounded-md py-3 px-4 text-white placeholder-gray-400"
											placeholder="Your name"
										/>
									</div>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-white"
									>
										Email
									</label>
									<div className="mt-1">
										<input
											type="email"
											name="email"
											id="email"
											required
											className="block w-full bg-[#0d1626] border border-[#334155] rounded-md py-3 px-4 text-white placeholder-gray-400"
											placeholder="you@example.com"
										/>
									</div>
								</div>
								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-medium text-white"
									>
										Phone Number
									</label>
									<div className="mt-1">
										<input
											type="tel"
											name="phone"
											id="phone"
											className="block w-full bg-[#0d1626] border border-[#334155] rounded-md py-3 px-4 text-white placeholder-gray-400"
											placeholder="+254 XXX XXX XXX"
										/>
									</div>
								</div>
								<div>
									<label
										htmlFor="subject"
										className="block text-sm font-medium text-white"
									>
										Subject
									</label>
									<div className="mt-1">
										<select
											id="subject"
											name="subject"
											className="block w-full bg-[#0d1626] border border-[#334155] rounded-md py-3 px-4 text-white"
										>
											<option value="escrow">Escrow Service Question</option>
											<option value="dispute">Dispute Resolution</option>
											<option value="account">Account Support</option>
											<option value="business">Business Inquiry</option>
											<option value="other">Other</option>
										</select>
									</div>
								</div>
								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-white"
									>
										Message
									</label>
									<div className="mt-1">
										<textarea
											id="message"
											name="message"
											rows={4}
											required
											className="block w-full bg-[#0d1626] border border-[#334155] rounded-md py-3 px-4 text-white placeholder-gray-400"
											placeholder="How can we help you?"
										/>
									</div>
								</div>
								<div>
									<button
										type="submit"
										className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]"
									>
										Send message
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
