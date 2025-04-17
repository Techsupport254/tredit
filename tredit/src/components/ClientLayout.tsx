"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		AOS.init({
			duration: 800,
			once: false,
			easing: "ease-out",
		});
	}, []);

	return <AuthProvider>{children}</AuthProvider>;
}
