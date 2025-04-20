"use client";

import { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="h-screen flex overflow-hidden">
			<DashboardSidebar />
			<DashboardContent>{children}</DashboardContent>
		</div>
	);
}
