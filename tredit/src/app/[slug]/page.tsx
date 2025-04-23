import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import StorePageClient from "./StorePageClient";

// IPFS Gateway URL
const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;

	// If it's already a full URL, return it
	if (hash.startsWith("http")) return hash;

	// If it's an IPFS hash, convert it to a gateway URL
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}

	// If it's just a hash, assume it's an IPFS hash
	return `${IPFS_GATEWAY}${hash}`;
}

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

	const description = business.description || "Check out our store!";
	const imageUrl =
		getIpfsUrl(business.logo) || getIpfsUrl(business.coverImage) || "";

	return {
		title: business.name,
		description,
		openGraph: {
			title: business.name,
			description,
			images: imageUrl ? [imageUrl] : [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: business.name,
			description,
			images: imageUrl ? [imageUrl] : [],
		},
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
			coverImage: true,
			type: true,
			status: true,
			products: {
				select: {
					id: true,
					name: true,
					description: true,
					price: true,
					stock: true,
					media: {
						select: {
							url: true,
							type: true,
							order: true,
						},
						orderBy: {
							order: "asc",
						},
						take: 1,
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

export default async function StorePage({ params }: Props) {
	const business = await getBusinessFromSlug(params.slug);

	if (!business) {
		notFound();
	}

	return <StorePageClient business={business} />;
}
