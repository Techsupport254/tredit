"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsPage() {
	const [isLoading] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<div className="grid gap-6">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
					Settings
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Manage your application settings and preferences
				</p>
			</div>

			<div className="grid gap-6">
				<div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Notifications
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-900 dark:text-white">
									Email Notifications
								</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Receive email notifications for important updates
								</p>
							</div>
							<button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600">
								<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
							</button>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-medium text-gray-900 dark:text-white">
									Push Notifications
								</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Receive push notifications on your devices
								</p>
							</div>
							<button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
								<span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
							</button>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Appearance
					</h2>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								Theme
							</label>
							<select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500">
								<option>Light</option>
								<option>Dark</option>
								<option>System</option>
							</select>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700 dark:text-gray-200">
								Language
							</label>
							<select className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500">
								<option>English</option>
								<option>Spanish</option>
								<option>French</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
