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

	// Get the current path from the child segment
	// This is a workaround: check if the child is a profile page by inspecting the child's type/name
	// But a more robust way is to use parallel routes or pass a flag from the profile layout
	// For now, let's use a regex on the child's props if available
	const isProfilePage =
		(children as any)?.props?.childPropSegment === "profile";

	// Fallback: check if the child has a key or segment that includes 'profile'
	const childKey = (children as any)?.key || "";
	const childTypeName = (children as any)?.type?.name || "";
	const isProfile =
		childKey.includes("profile") ||
		childTypeName.toLowerCase().includes("profile");

	const shouldShowBusinessHeader = !(isProfilePage || isProfile);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{shouldShowBusinessHeader && <NavbarWrapper />}
			{shouldShowBusinessHeader && (
				<BusinessHeader
					name={business.name}
					description={business.description}
					logoUrl={logoUrl}
				/>
			)}
			<main className="flex-grow">{children}</main>
			<Footer business={business} logoUrl={logoUrl} />
		</div>
	);
}
