"use client";

import { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProductGrid from "./components/ProductGrid";

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

// Define a custom Product interface that matches what ProductGrid expects
interface Product {
	id: string;
	name: string;
	description: string | null;
	price: any; // Use 'any' to accommodate Decimal or number
	stock: number;
	businessId: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	ipfsHash: string | null;
	media: Array<{
		url: string;
		type: string;
		order: number;
	}>;
	variants?: Array<{
		id: string;
		name: string;
		value: string;
		price: string; // Use string for price
		stock: number;
	}>;
}

interface StorePageClientProps {
	business: {
		id: string;
		name: string;
		description: string | null;
		logo: string | null;
		coverImage: string | null;
		type: string;
		status: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		country: string;
		supportEmail: string | null;
		supportPhone: string | null;
		products: Array<any>; // Use any to avoid typing issues
	};
}

export default function StorePageClient({ business }: StorePageClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	// Filter products based on search query
	const filteredProducts = business.products.filter((product) =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calculate pagination
	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentProducts = filteredProducts.slice(startIndex, endIndex);

	return (
		<div className="py-6">
			{/* Search input */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
				<Input
					placeholder="Search products..."
					prefix={<SearchOutlined className="text-gray-400" />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-md rounded-full"
					size="large"
				/>
			</div>

			<ProductGrid
				businessName={business.name}
				businessType={business.type}
				products={currentProducts as any}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
				totalPages={totalPages}
			/>
		</div>
	);
}
