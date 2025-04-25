"use client";

import Navbar from "./Navbar";

export default function NavbarWrapper() {
	// Pass empty values for search since it's handled in StorePageClient now
	return <Navbar searchQuery="" setSearchQuery={() => {}} />;
}
