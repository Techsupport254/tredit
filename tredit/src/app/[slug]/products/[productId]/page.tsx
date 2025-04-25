import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotFound from "@/app/not-found";
import { Decimal } from "@prisma/client/runtime/library";

interface ProductPageProps {
	params: {
		slug: string;
		productId: string;
	};
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const business = await getBusinessFromSlug(params.slug);
	const product = await getProductDetails(params.productId);

	if (!business || !product) {
		return {
			title: "Product Not Found",
		};
	}

	return {
		title: `${product.name} - ${business.name}`,
		description: product.description,
	};
}

async function getBusinessFromSlug(slug: string) {
	// Split the slug into name and shortId
	const parts = slug.split("-");
	const shortId = parts.pop(); // Get the last part as shortId
	const nameSlug = parts.join("-"); // Join the rest as name slug

	if (!shortId) {
		return null;
	}

	// Find the business that matches the short ID
	const business = await prisma.business.findFirst({
		where: {
			id: {
				startsWith: shortId,
			},
		},
	});

	return business;
}

async function getProductDetails(productId: string) {
	const product = await prisma.product.findUnique({
		where: { id: productId },
		include: {
			media: {
				orderBy: {
					order: "asc",
				},
			},
			variants: {
				select: {
					id: true,
					name: true,
					value: true,
					price: true,
					stock: true,
				},
			},
		},
	});

	return product;
}

// Serialize decimal and date objects for client components
function serializeProduct(product: any) {
	if (!product) return null;
	return {
		...product,
		price: product.price.toString(),
		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
		// Make sure youtubeVideoId gets passed to the client
		youtubeVideoId: product.youtubeVideoId || null,
		media:
			product.media?.map((m: any) => ({
				...m,
				createdAt: m.createdAt.toISOString(),
				updatedAt: m.updatedAt.toISOString(),
			})) || [],
		variants:
			product.variants?.map((variant: any) => ({
				...variant,
				price: variant.price.toString(),
				createdAt: variant.createdAt.toISOString(),
				updatedAt: variant.updatedAt.toISOString(),
			})) || [],
	};
}

// Serialize business data to avoid Decimal serialization issues
function serializeBusiness(business: any) {
	if (!business) return null;

	// Create a safe copy with all fields
	const serialized = { ...business };

	// Handle Decimal fields
	if (business.revenue) {
		serialized.revenue = business.revenue.toString();
	} else {
		serialized.revenue = "0";
	}

	// Handle date fields with better null checking
	if (business.createdAt) {
		serialized.createdAt =
			business.createdAt instanceof Date
				? business.createdAt.toISOString()
				: business.createdAt;
	}

	if (business.updatedAt) {
		serialized.updatedAt =
			business.updatedAt instanceof Date
				? business.updatedAt.toISOString()
				: business.updatedAt;
	}

	// Handle any other potentially problematic fields
	Object.keys(serialized).forEach((key) => {
		const value = serialized[key];

		// Check if value is a Decimal object
		if (
			value &&
			typeof value === "object" &&
			value.constructor &&
			value.constructor.name === "Decimal"
		) {
			serialized[key] = value.toString();
		}

		// Convert Dates to ISO strings
		if (value instanceof Date) {
			serialized[key] = value.toISOString();
		}
	});

	return serialized;
}

export default async function ProductPage({ params }: ProductPageProps) {
	const session = await getServerSession(authOptions);
	if (!session?.user) {
		redirect("/login");
	}

	const businessData = await getBusinessFromSlug(params.slug);
	if (!businessData) {
		return <NotFound />;
	}

	// Serialize business data
	const business = serializeBusiness(businessData);

	// Update the query to include necessary fields
	const productData = await prisma.product.findUnique({
		where: {
			id: params.productId,
		},
		include: {
			media: {
				select: {
					id: true,
					url: true,
					type: true,
					order: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: {
					order: "asc",
				},
			},
			variants: {
				select: {
					id: true,
					name: true,
					value: true,
					price: true,
					stock: true,
					createdAt: true,
					updatedAt: true,
				},
			},
		},
		// Remove the explicit select for now as it's causing type errors
	});

	if (!productData || productData.businessId !== businessData.id) {
		return <NotFound />;
	}

	const product = serializeProduct(productData);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProductDetailClient business={business} product={product} />
		</Suspense>
	);
}
