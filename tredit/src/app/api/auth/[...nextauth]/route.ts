import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { User } from "@/lib/models/User";

// Add debug logging
if (process.env.NODE_ENV !== "production") {
	console.log("Initializing NextAuth with Prisma adapter");
}

const prisma = new PrismaClient();

const handler = NextAuth({
	debug: process.env.NODE_ENV !== "production",
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) {
						console.error("Missing credentials");
						throw new Error("Email and password required");
					}

					console.log("Looking for user with email:", credentials.email);
					const user = await User.findByEmail(credentials.email);

					if (!user) {
						console.error("No user found with email:", credentials.email);
						throw new Error("No user found with this email");
					}

					console.log("User found, verifying password");
					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!isPasswordValid) {
						console.error("Invalid password for user:", credentials.email);
						throw new Error("Invalid password");
					}

					console.log("Password verified, returning user");
					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						verificationStatus: user.verificationStatus,
					};
				} catch (error) {
					console.error("Authorization error:", error);
					throw error;
				}
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	pages: {
		signIn: "/login",
		signOut: "/auth/signout",
		error: "/auth/error",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.id = user.id;
				token.verificationStatus = user.verificationStatus;
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.role = token.role as string;
				session.user.id = token.id as string;
				session.user.verificationStatus = token.verificationStatus as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
});

// Export handlers with runtime configuration
export const runtime = "nodejs"; // Set runtime to Node.js instead of Edge
export { handler as GET, handler as POST };
