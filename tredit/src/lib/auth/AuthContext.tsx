"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

interface User {
	id: string;
	email: string;
	name: string;
	walletAddress?: string;
	role?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (
		email: string,
		password: string,
		callbackUrl?: string
	) => Promise<{ success: boolean }>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	login: async () => ({ success: false }),
	logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			setUser({
				id: session.user.id as string,
				name: session.user.name as string,
				email: session.user.email as string,
				role: session.user.role as string,
			});
		} else if (status === "unauthenticated") {
			setUser(null);
		}
	}, [session, status]);

	const login = async (
		email: string,
		password: string,
		callbackUrl?: string
	) => {
		try {
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (result?.error) {
				toast.error(result.error);
				return { success: false };
			}

			if (callbackUrl) {
				router.push(callbackUrl);
			} else {
				router.push("/dashboard");
			}

			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			toast.error("An error occurred during login");
			return { success: false };
		}
	};

	const logout = async () => {
		try {
			// Store the current path before logging out
			const currentPath = pathname;
			// Only store the path if it's not an auth-related path
			if (
				!currentPath.startsWith("/login") &&
				!currentPath.startsWith("/register")
			) {
				sessionStorage.setItem("returnTo", currentPath);
			}

			await signOut({ redirect: false });
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("An error occurred during logout");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading: status === "loading",
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
