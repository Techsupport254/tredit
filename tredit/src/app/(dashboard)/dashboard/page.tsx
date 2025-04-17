"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Card } from "@/components/ui/Card";

export default function Dashboard() {
	const { user } = useAuth();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card
					title="Welcome"
					description={`Hello, ${
						user?.name || "User"
					}! Welcome to your dashboard.`}
				/>

				<Card
					title="Account"
					description="Manage your account settings and wallet connections."
				/>

				<Card
					title="Transactions"
					description="View your transaction history and escrow status."
				/>
			</div>
		</div>
	);
}
