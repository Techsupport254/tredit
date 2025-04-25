import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub!;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
	},
	pages: {
		signIn: "/login",
		error: "/auth/error",
	},
	debug: process.env.NODE_ENV === "development",
	events: {
		async signIn({ user }) {
			console.log("User signed in:", user.email);
		},
		async signOut({ user }) {
			console.log("User signed out:", user?.email);
		},
		async error({ error }) {
			console.error("Auth error:", error);
		},
	},
};
