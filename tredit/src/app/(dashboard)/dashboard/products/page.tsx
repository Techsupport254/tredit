"use client";

import { useState } from "react";
import {
	PlusIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const products = [
	{
		id: 1,
		name: "Laptop Pro X1",
		price: "120,000",
		status: "active",
		sales: 24,
		rating: 4.5,
		image: "/images/products/laptop.jpg",
	},
	{
		id: 2,
		name: "Smartphone Y2",
		price: "45,000",
		status: "pending",
		sales: 12,
		rating: 4.2,
		image: "/images/products/phone.jpg",
	},
	// Add more products as needed
];

export default function ProductsPage() {
	const [searchTerm, setSearchTerm] = useState("");

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900">
			<div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="py-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
								Products
							</h1>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Manage your product listings and inventory
							</p>
						</div>
						<button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<PlusIcon className="h-5 w-5 mr-2" />
							Add Product
						</button>
					</div>

					{/* Search and Filters */}
					<div className="mt-6 flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search products..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<FunnelIcon className="h-5 w-5 mr-2" />
							Filters
						</button>
					</div>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-6">
					{products.map((product) => (
						<div
							key={product.id}
							className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
						>
							<div className="relative aspect-square">
								<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
								<button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
								</button>
							</div>
							<div className="p-4">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									{product.name}
								</h3>
								<p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
									KES {product.price}
								</p>
								<div className="mt-4 flex items-center justify-between">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											product.status === "active"
												? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
												: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
										}`}
									>
										{product.status}
									</span>
									<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
										<span>{product.sales} sales</span>
										<span className="mx-1.5">•</span>
										<span className="flex items-center">
											{product.rating}
											<span className="ml-1 text-yellow-400">★</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
