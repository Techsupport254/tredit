"use client";

import { useEffect, useState } from "react";
import {
	PlusIcon,
	FunnelIcon,
	EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

export default function ProductsPage() {
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			// TODO: Replace with actual businessId logic or prop
			const businessId = "demo-business-id"; // Placeholder
			if (!businessId) {
				setProducts([]);
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(`/api/business/${businessId}/products`);
				if (!res.ok) throw new Error("Failed to fetch products");
				const data = await res.json();
				setProducts(data || []);
			} catch (e) {
				setProducts([]);
			}
			setLoading(false);
		};
		fetchProducts();
	}, []);

	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
							<input
								type="text"
								placeholder="Search products..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								style={{ paddingLeft: "2.5rem" }}
							/>
						</div>
						<button
							className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							onClick={() => setShowFilters((v) => !v)}
						>
							<FunnelIcon className="h-5 w-5 mr-2" />
							Filters
						</button>
					</div>
				</div>

				{/* Products Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20">
						<img
							src="/empty-box.svg"
							alt="No products"
							className="w-32 h-32 mb-4 opacity-70"
						/>
						<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
							No products found
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Try adjusting your search or add a new product.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-6">
						{filteredProducts.map((product) => (
							<div
								key={product.id}
								className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
							>
								<div className="relative aspect-square overflow-hidden">
									{product.media && product.media.length > 0 ? (
										<img
											src={product.media[0].url}
											alt={product.name}
											className="w-full h-full object-contain rounded-t-lg bg-gray-100 dark:bg-gray-700"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.onerror = null;
												target.src = "/placeholder.png";
											}}
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-t-lg">
											<span className="text-4xl text-gray-400">📦</span>
										</div>
									)}
									<button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
										<EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
									</button>
								</div>
								<div className="p-4">
									<h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">
										{product.name}
									</h3>
									<p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
										KES {Number(product.price).toLocaleString()}
									</p>
									<div className="mt-4 flex items-center justify-between">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												product.status === "ACTIVE"
													? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
													: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
											}`}
										>
											{product.status}
										</span>
										<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
											<span>{product.stock ?? 0} in stock</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
