"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/lib/auth/AuthContext";

// --- Zod Schema ---
const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"), // Simple check for login
	rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

// --- Component ---
export default function Login() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login, isLoading: authLoading, user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// Get and decode the callback URL
	const rawCallbackUrl = searchParams.get("callbackUrl");
	const callbackUrl = rawCallbackUrl
		? decodeURIComponent(rawCallbackUrl)
		: "/dashboard";

	// If user is already logged in, redirect to callback URL or dashboard
	useEffect(() => {
		if (user) {
			router.replace(callbackUrl);
		}
	}, [user, callbackUrl, router]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			rememberMe: false,
		},
	});

	const onSubmit = async (data: FormData) => {
		console.log("=== LOGIN SUBMIT START ===");
		console.log("Form data:", {
			email: data.email,
			passwordLength: data.password?.length,
		});

		try {
			setIsLoading(true);
			const callback = searchParams.get("callbackUrl");
			console.log("Current URL params:", {
				callback,
				fullSearchParams: Object.fromEntries(searchParams.entries()),
			});

			console.log("Calling login function...");
			const response = await login(data.email, data.password);
			console.log("Login response:", response);

			if (response.success) {
				console.log("Login successful, preparing navigation");
				toast.success("Login successful!");

				const redirectTo = callback ? `/${callback}` : "/dashboard";
				console.log("Redirect target:", redirectTo);

				// Try both navigation methods
				console.log("Attempting navigation with router.push...");
				try {
					await router.push(redirectTo);
					console.log("Router push completed");
				} catch (navError) {
					console.error("Router navigation failed:", navError);
					console.log("Falling back to window.location...");
					window.location.href = redirectTo;
				}
			} else {
				console.log("Login failed");
				toast.error("Invalid email or password");
			}
		} catch (err) {
			const error = err as Error;
			console.error("=== LOGIN ERROR ===", error);
			toast.error(error.message || "Login failed");
		} finally {
			setIsLoading(false);
			console.log("=== LOGIN SUBMIT END ===");
		}
	};

	const handleGoogleSignIn = async () => {
		// TODO: Implement Google OAuth flow
		toast.error("Google Sign-In not implemented yet.");
	};

	return (
		<div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
			<Toaster position="top-center" />

			{/* Left Panel: Login Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					{/* Logo and Title */}
					<div className="flex flex-col items-center">
						<Image
							src="/favicon.svg"
							alt="TredIt Logo"
							width={56}
							height={56}
							className="mb-3"
							priority
						/>
						<h1 className="text-xl font-semibold text-gray-800">TredIt</h1>
					</div>
					<div className="text-center">
						<h2 className="text-3xl font-bold text-gray-900">
							Sign in to your account
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							Welcome back! Please enter your details.
						</p>
					</div>

					{/* Google Sign-In Button */}
					<button
						type="button"
						onClick={handleGoogleSignIn}
						className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium shadow-sm text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						disabled={isLoading || authLoading}
					>
						<svg className="w-5 h-5" viewBox="0 0 48 48">
							<path
								fill="#EA4335"
								d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
							></path>
							<path
								fill="#4285F4"
								d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
							></path>
							<path
								fill="#FBBC05"
								d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
							></path>
							<path
								fill="#34A853"
								d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
							></path>
							<path fill="none" d="M0 0h48v48H0z"></path>
						</svg>
						Continue with Google
					</button>

					{/* Divider */}
					<div className="flex items-center">
						<div className="flex-grow border-t border-gray-300" />
						<span className="mx-4 text-gray-500 text-sm">or</span>
						<div className="flex-grow border-t border-gray-300" />
					</div>

					{/* Form */}
					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						{/* Email Input */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email address
							</label>
							<input
								{...register("email")}
								type="email"
								id="email"
								autoComplete="email"
								className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2.5 ${
									errors.email
										? "border-red-500 focus:border-red-500 focus:ring-red-500"
										: "border-gray-300"
								}`}
								placeholder="you@example.com"
							/>
							{errors.email && (
								<p className="mt-1.5 text-xs text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<div className="relative">
								<input
									{...register("password")}
									type={showPassword ? "text" : "password"}
									id="password"
									autoComplete="current-password"
									className={`block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2.5 pr-10 ${
										errors.password
											? "border-red-500 focus:border-red-500 focus:ring-red-500"
											: "border-gray-300"
									}`}
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeSlashIcon className="h-5 w-5" />
									) : (
										<EyeIcon className="h-5 w-5" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1.5 text-xs text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									{...register("rememberMe")}
									id="rememberMe"
									type="checkbox"
									className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
								/>
								<label
									htmlFor="rememberMe"
									className="ml-2 block text-sm text-gray-900"
								>
									Remember me
								</label>
							</div>
							<div className="text-sm">
								<Link
									href="/forgot-password" // Link to forgot password page
									className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
								>
									Forgot your password?
								</Link>
							</div>
						</div>

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={isLoading || authLoading}
							>
								{isLoading || authLoading ? (
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : null}
								{isLoading || authLoading ? "Signing In..." : "Sign In"}
							</button>
						</div>
					</form>

					{/* Sign Up Link */}
					<p className="mt-4 text-center text-sm text-gray-600">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>

			{/* Right Panel: Decorative */}
			<div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#172033] to-[#0f172a] min-h-screen p-12 relative overflow-hidden">
				{/* Background Illustration */}
				<div className="absolute inset-0 opacity-15 z-0">
					<Image
						src="/illustrations/auth-modern-escrow.svg"
						alt="Abstract background pattern"
						width={1200}
						height={1200}
						className="w-full h-full object-cover"
						priority
					/>
				</div>
				{/* Content */}
				<div className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl">
					<div className="mb-12 w-52 h-52 bg-gradient-to-br from-blue-500/15 to-transparent rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-24 h-24 text-blue-300 opacity-90"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
							/>
						</svg>
					</div>
					<h2 className="text-4xl font-bold text-white mb-4">
						Secure, Transparent Trading
					</h2>
					<p className="text-xl text-gray-300">
						Join Kenya&apos;s leading blockchain-powered escrow platform for
						secure online transactions.
					</p>
				</div>
			</div>
		</div>
	);
}
