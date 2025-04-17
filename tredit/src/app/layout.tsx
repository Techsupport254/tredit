import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "TredIt - Secure Escrow Platform",
	description:
		"Kenya's leading blockchain-powered escrow platform for secure online transactions",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<Toaster position="top-center" />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
