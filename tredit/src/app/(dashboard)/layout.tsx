"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If we're not loading and there's no user, redirect to login
		if (!isLoading && !user) {
			router.push("/login");
		}
	}, [user, isLoading, router]);

	// Show loading or nothing while checking auth
	if (isLoading || !user) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<DashboardSidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
					{children}
				</main>
			</div>
		</div>
	);
}
