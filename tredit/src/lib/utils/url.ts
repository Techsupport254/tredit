export function generateSlug(name: string): string {
	// Get the first word or up to 3 words
	const words = name
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 0)
		.slice(0, 3)
		.join("-");

	return words;
}

export function generateShareableLink(
	businessId: string,
	businessName: string,
	businessType: string
): string {
	const slug = generateSlug(businessName);
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
	if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
		throw new Error(
			"NEXT_PUBLIC_APP_URL is not set or is not a valid absolute URL. Please set it in your .env file."
		);
	}
	const shortId = businessId.split("-")[0];
	return `${baseUrl}/${slug}-${shortId}`;
}
