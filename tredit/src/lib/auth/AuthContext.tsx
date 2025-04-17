"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
	id: string;
	email: string;
	name: string;
	walletAddress?: string;
	role?: string;
}

interface LoginResponse {
	success: boolean;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<LoginResponse>;
	logout: () => void;
	checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		console.log("AuthProvider mounted, checking session");
		checkSession().finally(() => {
			setIsLoading(false);
		});
	}, []);

	const checkSession = async (): Promise<boolean> => {
		try {
			console.log("Checking session...");
			const res = await fetch("/api/auth/session", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await res.json();
			console.log("Session check response:", data);

			if (res.ok) {
				setUser(data.user);
				console.log("Session valid, user:", data.user);
				return true;
			} else {
				setUser(null);
				console.log("Session invalid");
				return false;
			}
		} catch (error) {
			console.error("Session check error:", error);
			setUser(null);
			return false;
		}
	};

	const login = async (
		email: string,
		password: string
	): Promise<LoginResponse> => {
		console.log("Login attempt for:", email);
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			console.log("Login API response:", data);

			if (!res.ok) {
				console.log("Login failed:", data.error);
				throw new Error(data.error || "Login failed");
			}

			console.log("Login successful, setting user");
			setUser(data.user);
			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			return { success: false };
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		console.log("Logout initiated");
		setIsLoading(true);
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			setUser(null);
			console.log("Logout successful, redirecting to login");
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				logout,
				checkSession,
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
