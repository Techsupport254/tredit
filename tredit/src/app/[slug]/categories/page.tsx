import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

interface Props {
	params: {
		slug: string;
	};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const business = await getBusinessFromSlug(params.slug);

	if (!business) {
		return {
			title: "Business Not Found",
		};
	}

	return {
		title: `Categories - ${business.name}`,
		description: `Browse all categories from ${business.name}`,
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
		select: {
			id: true,
			name: true,
			description: true,
			logo: true,
			type: true,
			status: true,
			productCategories: {
				select: {
					id: true,
					name: true,
					description: true,
					type: true,
					isAvailable: true,
					_count: {
						select: {
							inventory: true,
						},
					},
				},
			},
		},
	});

	// Verify that the business name matches the slug
	if (business) {
		const businessNameSlug = business.name
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((word) => word.length > 0)
			.slice(0, 3)
			.join("-");

		if (businessNameSlug !== nameSlug) {
			return null;
		}
	}

	return business;
}

export default async function CategoriesPage({ params }: Props) {
	const business = await getBusinessFromSlug(params.slug);

	if (!business) {
		notFound();
	}

	// Transform the data to match the expected format
	const transformedBusiness = {
		...business,
		categories: business.productCategories.map((category) => ({
			id: category.id,
			name: category.name,
			description: category.description,
			image: null, // Since we don't have images in the schema
			productCount: category._count.inventory,
		})),
	};

	// Serialize the business data to handle any non-serializable objects
	const serializedBusiness = JSON.parse(
		JSON.stringify(transformedBusiness, (key, value) => {
			// Handle BigInt, Decimal, or any non-serializable values
			if (
				typeof value === "object" &&
				value !== null &&
				typeof value.toString === "function"
			) {
				// For Decimal objects from Prisma, convert to string or number
				if (value.constructor?.name === "Decimal") {
					return value.toString();
				}
			}
			return value;
		})
	);

	return <CategoriesClient business={serializedBusiness} />;
}
