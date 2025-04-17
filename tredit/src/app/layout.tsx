import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Tredit - Business Management Platform",
	description:
		"The all-in-one platform for businesses to manage, grow, and succeed in the digital age.",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
			{ url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
		],
		apple: { url: "/logo.svg", sizes: "any" },
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="h-full">
			<body className={`${inter.className} min-h-full flex flex-col`}>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
