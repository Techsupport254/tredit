import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
	return (
		<div className="space-y-6 p-6">
			{/* Header Skeleton */}
			<div className="flex justify-between items-start">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>

			{/* Stats Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4"
					>
						<div className="flex justify-between items-center">
							<Skeleton className="h-10 w-10 rounded-lg" />
							<Skeleton className="h-4 w-16" />
						</div>
						<Skeleton className="h-7 w-24" />
						<Skeleton className="h-4 w-32" />
					</div>
				))}
			</div>

			{/* Charts Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4"
					>
						<div className="flex justify-between items-center">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-8 w-24" />
						</div>
						<Skeleton className="h-64 w-full rounded-lg" />
					</div>
				))}
			</div>

			{/* Tables Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4"
					>
						<div className="flex justify-between items-center">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-8 w-24" />
						</div>
						<div className="space-y-3">
							{[1, 2, 3].map((j) => (
								<Skeleton key={j} className="h-12 w-full" />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
