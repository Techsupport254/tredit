"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TransactionsPage() {
	const [isLoading] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16" />
					))}
				</div>
			</div>
		);
	}

	const transactions = [
		{
			id: 1,
			type: "Purchase",
			amount: "120,000",
			status: "completed",
			date: "2024-03-15",
			description: "Laptop Pro X1",
		},
		{
			id: 2,
			type: "Sale",
			amount: "45,000",
			status: "pending",
			date: "2024-03-14",
			description: "Smartphone Y2",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Transactions
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					View and manage your transaction history
				</p>
			</div>

			<div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
					<thead className="bg-gray-50 dark:bg-gray-800">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								Type
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								Description
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								Amount (KES)
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								Status
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								Date
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
						{transactions.map((transaction) => (
							<tr key={transaction.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
									{transaction.type}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{transaction.description}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{transaction.amount}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											transaction.status === "completed"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										}`}
									>
										{transaction.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{transaction.date}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
