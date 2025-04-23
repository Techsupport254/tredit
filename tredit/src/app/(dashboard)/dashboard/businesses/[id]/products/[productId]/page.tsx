"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/types/product.types";
import { Card } from "antd";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailsPage() {
	const params = useParams();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const response = await fetch(`/api/products?id=${params.productId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch product");
				}
				const data = await response.json();
				setProduct(data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch product"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [params.productId]);

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[200px]" />
				<Skeleton className="h-[200px] w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
				{error}
			</div>
		);
	}

	if (!product) {
		return (
			<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
				Product not found
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<Card.Meta
					title="Product Details"
					description="View and manage product information"
				/>
				<div className="grid gap-4">
					<div>
						<h3 className="font-semibold">Name</h3>
						<p>{product.name}</p>
					</div>
					<div>
						<h3 className="font-semibold">Description</h3>
						<p>{product.description}</p>
					</div>
					<div>
						<h3 className="font-semibold">Price</h3>
						<p>${product.price}</p>
					</div>
					<div>
						<h3 className="font-semibold">Images</h3>
						<div className="grid grid-cols-2 gap-4">
							{product.images.map((image, index) => (
								<img
									key={index}
									src={image}
									alt={`Product image ${index + 1}`}
									className="rounded-lg"
								/>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-semibold">Videos</h3>
						<div className="grid grid-cols-2 gap-4">
							{product.videos.map((video, index) => (
								<div key={index} className="aspect-video">
									<iframe
										src={video}
										className="w-full h-full rounded-lg"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								</div>
							))}
						</div>
					</div>
					<div>
						<h3 className="font-semibold">Variants</h3>
						<div className="grid gap-2">
							{product.variants.map((variant, index) => (
								<div key={index} className="p-2 border rounded">
									<p>Name: {variant.name}</p>
									<p>Price: ${variant.price}</p>
									<p>Stock: {variant.stock}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
