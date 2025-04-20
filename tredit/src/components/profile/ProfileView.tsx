"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
	UserIcon,
	HomeIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Profile completion items
const completionItems = [
	{ id: 1, label: "Profile Picture", completed: true },
	{ id: 2, label: "Basic Information", completed: true },
	{ id: 3, label: "Contact Details", completed: true },
	{ id: 4, label: "Wallet Connected", completed: true },
	{ id: 5, label: "Email Verified", completed: true },
	{ id: 6, label: "Phone Verified", completed: false },
	{ id: 7, label: "2FA Enabled", completed: false },
	{ id: 8, label: "KYC Verification", completed: false },
];

export function ProfileView() {
	const { data: session } = useSession();

	// Calculate profile completion percentage
	const completedItems = completionItems.filter(
		(item) => item.completed
	).length;
	const completionPercentage = Math.round(
		(completedItems / completionItems.length) * 100
	);

	return (
		<div className="flex-1 space-y-6">
			{/* Breadcrumb */}
			<div className="flex items-center space-x-2 text-sm text-gray-500">
				<Link href="/" className="hover:text-gray-700">
					<HomeIcon className="h-4 w-4" />
				</Link>
				<ChevronRightIcon className="h-4 w-4" />
				<Link href="/dashboard" className="hover:text-gray-700">
					Dashboard
				</Link>
				<ChevronRightIcon className="h-4 w-4" />
				<span className="text-blue-600 font-medium">Profile</span>
			</div>

			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
				<p className="text-sm text-gray-500">
					Manage your account settings and preferences
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Personal Information */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200">
						<div className="p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-6">
								Personal Information
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="flex items-center space-x-4">
									<div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
										{session?.user?.image ? (
											<Image
												src={session.user.image}
												alt="Profile"
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xl font-semibold">
												{session?.user?.name?.[0]?.toUpperCase() || "V"}
											</div>
										)}
									</div>
									<div>
										<h3 className="text-base font-medium text-gray-900">
											{session?.user?.name}
										</h3>
										<p className="text-sm text-gray-500">
											{session?.user?.email}
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-500">
											Phone Number
										</label>
										<p className="text-sm text-gray-700">Not provided</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">
											Gender
										</label>
										<p className="text-sm text-gray-700">Not specified</p>
									</div>
								</div>

								<div>
									<label className="text-sm font-medium text-gray-500">
										Date of Birth
									</label>
									<p className="text-sm text-gray-700">Not provided</p>
								</div>

								<div>
									<label className="text-sm font-medium text-gray-500">
										Wallet Address
									</label>
									<p className="text-sm text-gray-700 font-mono break-all">
										0xe9f1388a436656f2c20bc8f3d333c0a1571c0700
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Account Status */}
				<div className="space-y-6">
					{/* Profile Completion Circle */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-medium text-gray-900">
								Profile Completion
							</h2>
							<div className="relative w-20 h-20">
								<svg className="w-20 h-20 transform -rotate-90">
									<circle
										cx="40"
										cy="40"
										r="36"
										stroke="currentColor"
										strokeWidth="8"
										fill="transparent"
										className="text-gray-200"
									/>
									<circle
										cx="40"
										cy="40"
										r="36"
										stroke="currentColor"
										strokeWidth="8"
										fill="transparent"
										strokeDasharray={`${2 * Math.PI * 36}`}
										strokeDashoffset={`${
											2 * Math.PI * 36 * (1 - completionPercentage / 100)
										}`}
										className="text-blue-500 transition-all duration-1000 ease-out"
									/>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-lg font-semibold text-gray-900">
										{completionPercentage}%
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Account Status */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Account Status
						</h2>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium text-gray-500">
									Account Status
								</label>
								<span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
									ACTIVE
								</span>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">
									Verification Status
								</label>
								<span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
									PENDING
								</span>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">
									Member Since
								</label>
								<p className="text-sm text-gray-700">4/19/2025</p>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">
									Last Login
								</label>
								<p className="text-sm text-gray-700">4/19/2025</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
