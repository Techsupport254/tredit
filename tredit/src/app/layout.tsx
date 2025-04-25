import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { CartProvider } from "@/lib/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
	"mobile-web-app-capable": "yes",
	"apple-mobile-web-app-capable": "yes",
};

export const metadata: Metadata = {
	title: "TredIt - Secure Escrow Platform",
	description:
		"Kenya's leading blockchain-powered escrow platform for secure online transactions",
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.png", type: "image/png", sizes: "32x32" },
			{
				url: "/android-chrome-192x192.png",
				type: "image/png",
				sizes: "192x192",
			},
			{
				url: "/android-chrome-512x512.png",
				type: "image/png",
				sizes: "512x512",
			},
		],
		apple: {
			url: "/apple-touch-icon.png",
			type: "image/png",
			sizes: "180x180",
		},
		shortcut: { url: "/favicon.ico" },
	},
	manifest: "/site.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "TredIt",
	},
	formatDetection: {
		telephone: false,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<CartProvider>
					<Providers>
						<AuthProvider>
							<Toaster position="top-center" />
							{children}
						</AuthProvider>
					</Providers>
				</CartProvider>
			</body>
		</html>
	);
}
