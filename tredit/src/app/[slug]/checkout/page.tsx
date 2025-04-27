import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";

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
		title: `Checkout - ${business.name}`,
		description: `Complete your purchase at ${business.name}`,
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
			paymentMethods: true,
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

export default async function CheckoutPage({ params }: Props) {
	const business = await getBusinessFromSlug(params.slug);

	if (!business) {
		notFound();
	}

	return <CheckoutClient business={business} />;
}
