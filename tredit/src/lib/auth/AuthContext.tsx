"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
	isLoading: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean }>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isLoading = status === "loading";

	const login = async (email: string, password: string) => {
		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast.error(result.error);
				return { success: false };
			}

			if (result?.ok) {
				toast.success("Login successful!");
				router.push("/dashboard");
				return { success: true };
			}

			return { success: false };
		} catch (error) {
			console.error("Login error:", error);
			return { success: false };
		}
	};

	const logout = async () => {
		await signOut({ redirect: false });
		router.push("/login");
	};

	return (
		<AuthContext.Provider
			value={{
				user: session?.user as User | null,
				isLoading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
