"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BusinessesPage() {
	const router = useRouter();
	const [isLoading] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-48" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
						Businesses
					</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Manage your business profiles and settings
					</p>
				</div>
				<button
					className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
					onClick={() => router.push("/dashboard/businesses/setup")}
				>
					Add Business
				</button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Empty state */}
				<div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/50">
						<svg
							className="h-6 w-6 text-blue-600 dark:text-blue-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
						No businesses
					</h3>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Get started by creating a new business.
					</p>
					<button
						className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
						onClick={() => router.push("/dashboard/businesses/setup")}
					>
						Add your first business
					</button>
				</div>
			</div>
		</div>
	);
}
