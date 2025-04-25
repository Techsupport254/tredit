"use client";

import { ReactNode } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";

interface DashboardContentProps {
	children: ReactNode;
	isLoading?: boolean;
}

export function DashboardContent({
	children,
	isLoading,
}: DashboardContentProps) {
	if (isLoading) {
		return (
			<div className="flex-1 p-2">
				<div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
				<div className="mt-6 space-y-4">
					<div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-48 bg-gray-200 rounded-lg animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen w-full bg-white">
			{/* Sticky Header with Breadcrumb */}
			<header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
				<div className="w-full">
					<Breadcrumb isLoading={isLoading} />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 overflow-auto bg-white">
				<Container maxWidth="2xl" className="py-6">
					{children}
				</Container>
			</main>
		</div>
	);
}
