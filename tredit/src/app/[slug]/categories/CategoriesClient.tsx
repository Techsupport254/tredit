"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "antd";
import { SearchOutlined, ShoppingOutlined } from "@ant-design/icons";

// IPFS Gateway URL
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

interface Category {
	id: string;
	name: string;
	description: string | null;
	image: string | null;
	productCount: number;
}

interface Business {
	id: string;
	name: string;
	description: string | null;
	logo: string | null;
	type: string;
	status: string;
	categories: Category[];
}

interface CategoriesClientProps {
	business: Business;
}

export default function CategoriesClient({ business }: CategoriesClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const params = useParams();
	const slug = params.slug as string;

	// Filter categories based on search query
	const filteredCategories = business.categories.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					Browse Categories
				</h1>
				<p className="text-lg text-gray-600 max-w-2xl mx-auto">
					Explore our wide range of products organized by categories
				</p>
			</div>

			{/* Search Bar */}
			<div className="max-w-xl mx-auto mb-12">
				<Input
					placeholder="Search categories..."
					prefix={<SearchOutlined className="text-gray-400" />}
					className="rounded-full h-12 bg-white border-gray-200 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					allowClear
				/>
			</div>

			{/* Categories Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{filteredCategories.map((category) => (
					<Link
						key={category.id}
						href={`/${slug}/categories/${category.id}`}
						className="group"
					>
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
									{category.name}
								</h3>
								<span className="text-sm text-gray-500">
									{category.productCount} products
								</span>
							</div>
							{category.description && (
								<p className="text-gray-600 text-sm line-clamp-2">
									{category.description}
								</p>
							)}
						</div>
					</Link>
				))}
			</div>

			{/* Empty State */}
			{filteredCategories.length === 0 && (
				<div className="text-center py-12">
					<ShoppingOutlined className="text-6xl text-gray-400 mb-4" />
					<h3 className="text-xl font-medium text-gray-900 mb-2">
						No categories found
					</h3>
					<p className="text-gray-600">
						Try adjusting your search or check back later for new categories
					</p>
				</div>
			)}
		</div>
	);
}
