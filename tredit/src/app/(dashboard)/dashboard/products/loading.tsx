"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900">
			<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header Skeleton */}
				<div className="py-6">
					<div className="flex justify-between items-center">
						<div>
							<Skeleton className="h-8 w-32" />
							<Skeleton className="mt-1 h-4 w-64" />
						</div>
						<Skeleton className="h-10 w-32" />
					</div>

					{/* Search and Filters Skeleton */}
					<div className="mt-6 flex flex-col sm:flex-row gap-4">
						<Skeleton className="flex-1 h-10" />
						<Skeleton className="h-10 w-28" />
					</div>
				</div>

				{/* Products Grid Skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-6">
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
						<div
							key={i}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
						>
							<Skeleton className="aspect-square rounded-t-lg" />
							<div className="p-4 space-y-3">
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<div className="flex justify-between items-center pt-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-24" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
