import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavbarWrapper from "./components/NavbarWrapper";
import BusinessHeader from "./components/BusinessHeader";
import Footer from "./components/Footer";

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	return `${IPFS_GATEWAY}${hash}`;
}

export default async function SlugLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { slug: string };
}) {
	// Split the slug into name and shortId
	const parts = params.slug.split("-");
	const shortId = parts.pop(); // Get the last part as shortId
	const nameSlug = parts.join("-"); // Join the rest as name slug

	if (!shortId) {
		notFound();
	}

	// Fetch business data
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
		},
	});

	if (!business) {
		notFound();
	}

	// Verify that the business name matches the slug
	const businessNameSlug = business.name
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 0)
		.slice(0, 3)
		.join("-");

	if (businessNameSlug !== nameSlug) {
		notFound();
	}

	const logoUrl = getIpfsUrl(business.logo);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<NavbarWrapper />
			<BusinessHeader
				name={business.name}
				description={business.description}
				logoUrl={logoUrl}
			/>
			<main className="flex-grow">{children}</main>
			<Footer business={business} logoUrl={logoUrl} />
		</div>
	);
}
