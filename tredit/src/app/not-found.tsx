"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-white relative overflow-hidden">
			{/* Background Illustration */}
			<div className="absolute inset-0 w-full h-full">
				<Image
					src="/illustrations/404.svg"
					alt="404 Background"
					fill
					className="object-cover"
					priority
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
				<div className="max-w-lg w-full space-y-8">
					{/* Logo */}
					<div className="flex justify-center">
						<Link href="/" className="flex items-center space-x-2">
							<Image
								src="/favicon.svg"
								alt="TredIt Logo"
								width={48}
								height={48}
								className="w-12 h-12"
							/>
							<span className="text-xl font-semibold text-gray-900">
								TredIt
							</span>
						</Link>
					</div>

					{/* Content */}
					<div className="text-center space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
						<h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
						<p className="text-lg text-gray-600 max-w-md mx-auto">
							Oops! It seems the page you're looking for has wandered off. Let's
							get you back on track.
						</p>

						{/* Navigation Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
							<button
								onClick={() => router.back()}
								className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
							>
								<ArrowLeftIcon className="w-5 h-5 mr-2" />
								Go Back
							</button>
							<Link
								href="/"
								className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
							>
								<HomeIcon className="w-5 h-5 mr-2" />
								Home
							</Link>
						</div>
					</div>

					{/* Help Text */}
					<p className="text-sm text-gray-500 text-center mt-8 bg-white/80 backdrop-blur-sm rounded-lg py-2">
						Need assistance?{" "}
						<Link
							href="/contact"
							className="text-blue-600 hover:text-blue-700 hover:underline"
						>
							Contact our support team
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
