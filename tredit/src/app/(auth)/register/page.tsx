"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";

// --- Zod Schema ---
const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Must contain an uppercase letter")
	.regex(/[a-z]/, "Must contain a lowercase letter")
	.regex(/[0-9]/, "Must contain a number")
	.regex(/[^A-Za-z0-9]/, "Must contain a special character");

const formSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: passwordSchema,
		confirmPassword: z.string(),
		walletAddress: z
			.string()
			.regex(/^0x[a-fA-F0-9]{40}$/, "Please connect a valid wallet address")
			.min(1, "Wallet connection is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type FormData = z.infer<typeof formSchema>;

// --- Ethereum Types ---
interface EthereumProvider {
	request: (args: { method: string }) => Promise<string[]>;
}

declare global {
	interface Window {
		ethereum?: EthereumProvider;
	}
}

// --- Helper Functions ---
const checkPasswordCriteria = (password: string) => ({
	length: password.length >= 8,
	uppercase: /[A-Z]/.test(password),
	lowercase: /[a-z]/.test(password),
	number: /[0-9]/.test(password),
	special: /[^A-Za-z0-9]/.test(password),
});

const formatWalletAddress = (address: string | undefined): string => {
	if (!address || address.length !== 42 || !address.startsWith("0x")) {
		return "";
	}
	return `${address.substring(0, 6)}...${address.substring(
		address.length - 4
	)}`;
};

// --- Component ---
export default function Register() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [walletConnected, setWalletConnected] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordCriteriaMet, setPasswordCriteriaMet] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: "onChange", // Validate on change for password criteria
		defaultValues: {
			walletAddress: "",
		},
	});

	const watchedPassword = watch("password");
	const walletAddress = watch("walletAddress");

	useEffect(() => {
		setPasswordCriteriaMet(checkPasswordCriteria(watchedPassword || ""));
	}, [watchedPassword]);

	useEffect(() => {
		setWalletConnected(!!walletAddress);
	}, [walletAddress]);

	const onSubmit = async (data: FormData) => {
		if (!walletConnected || !data.walletAddress) {
			toast.error("Please connect your wallet first.");
			return;
		}
		try {
			setIsLoading(true);

			// First, check if email or wallet address already exists
			const validationResponse = await fetch("/api/auth/validate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.email,
					walletAddress: data.walletAddress,
				}),
			});

			const validationResult = await validationResponse.json();

			if (!validationResponse.ok) {
				throw new Error(validationResult.error || "Validation failed");
			}

			// If validation passes, proceed with registration
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.email,
					password: data.password,
					name: data.name,
					walletAddress: data.walletAddress,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.details || result.error || "Registration failed"
				);
			}

			// After successful registration, sign in using NextAuth
			const signInResult = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (signInResult?.error) {
				throw new Error(signInResult.error);
			}

			toast.success("Registration successful! Redirecting to dashboard...");
			router.push("/dashboard");
		} catch (err) {
			const error = err as Error;
			console.error("Submit error:", error);
			toast.error(error.message || "Registration failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleConnectWallet = async () => {
		try {
			if (typeof window.ethereum === "undefined") {
				toast.error("Please install MetaMask");
				return;
			}

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			if (accounts.length > 0) {
				setValue("walletAddress", accounts[0], { shouldValidate: true }); // Set form value
				toast.success("Wallet connected successfully");
			} else {
				toast.error("No accounts found. Please ensure MetaMask is set up.");
			}
		} catch (err) {
			const error = err as Error;
			console.error("Wallet connection error:", error);
			toast.error(error.message || "Failed to connect wallet");
		}
	};

	return (
		<div className="flex flex-col lg:flex-row w-full min-h-screen">
			<Toaster position="top-center" />

			{/* Left Panel: Registration Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12 bg-white">
				<div className="w-full max-w-md mx-auto space-y-6">
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
					<h2 className="text-2xl font-bold text-gray-900 text-center">
						Create your account
					</h2>
					<p className="text-gray-500 text-center text-sm mb-6">
						Join Kenya&apos;s secure trading platform.
					</p>

					{/* Form */}
					<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
						{/* Name Input */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Full Name
							</label>
							<input
								{...register("name")}
								type="text"
								id="name"
								className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${
									errors.name
										? "border-red-500 focus:border-red-500 focus:ring-red-500"
										: "border-gray-300"
								}`}
								placeholder="Enter your full name"
							/>
							{errors.name && (
								<p className="mt-1 text-xs text-red-600">
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Email Input */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email Address
							</label>
							<input
								{...register("email")}
								type="email"
								id="email"
								className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 ${
									errors.email
										? "border-red-500 focus:border-red-500 focus:ring-red-500"
										: "border-gray-300"
								}`}
								placeholder="you@example.com"
							/>
							{errors.email && (
								<p className="mt-1 text-xs text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password Inputs */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Create Password
								</label>
								<div className="relative">
									<input
										{...register("password")}
										type={showPassword ? "text" : "password"}
										id="password"
										className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10 ${
											errors.password
												? "border-red-500 focus:border-red-500 focus:ring-red-500"
												: "border-gray-300"
										}`}
										placeholder="Create a password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
									>
										{showPassword ? (
											<EyeSlashIcon className="h-5 w-5" />
										) : (
											<EyeIcon className="h-5 w-5" />
										)}
									</button>
								</div>
								{errors.password &&
									!passwordCriteriaMet.length && ( // Show only if length criteria isn't met initially
										<p className="mt-1 text-xs text-red-600">
											{errors.password.message}
										</p>
									)}
							</div>

							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Confirm Password
								</label>
								<div className="relative">
									<input
										{...register("confirmPassword")}
										type={showConfirmPassword ? "text" : "password"}
										id="confirmPassword"
										className={`block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10 ${
											errors.confirmPassword
												? "border-red-500 focus:border-red-500 focus:ring-red-500"
												: "border-gray-300"
										}`}
										placeholder="Confirm your password"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
									>
										{showConfirmPassword ? (
											<EyeSlashIcon className="h-5 w-5" />
										) : (
											<EyeIcon className="h-5 w-5" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="mt-1 text-xs text-red-600">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
						</div>

						{/* Password Criteria */}
						{(errors.password || watchedPassword) && ( // Show criteria if there's an error or user started typing
							<div className="pt-1 space-y-1">
								<p className="text-xs font-medium text-gray-600">
									Password must contain:
								</p>
								<ul className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1">
									{[
										{ key: "length", label: "At least 8 characters" },
										{ key: "uppercase", label: "Uppercase letter" },
										{ key: "lowercase", label: "Lowercase letter" },
										{ key: "number", label: "Number" },
										{ key: "special", label: "Special character" },
									].map((item) => (
										<li
											key={item.key}
											className={`flex items-center transition-colors duration-200 ${
												passwordCriteriaMet[
													item.key as keyof typeof passwordCriteriaMet
												]
													? "text-green-600"
													: "text-gray-500"
											}`}
										>
											<span className="mr-1.5">
												{passwordCriteriaMet[
													item.key as keyof typeof passwordCriteriaMet
												]
													? "✓"
													: "•"}
											</span>{" "}
											{item.label}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Wallet Connection */}
						<div>
							<label
								htmlFor="walletAddressDisplay"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Blockchain Wallet (Required)
							</label>
							<div className="flex items-center gap-2">
								{/* Hidden input for react-hook-form */}
								<input {...register("walletAddress")} type="hidden" />
								<input
									id="walletAddressDisplay"
									type="text"
									value={formatWalletAddress(walletAddress)}
									disabled
									className={`flex-grow block w-full rounded-md border bg-gray-50 text-gray-500 shadow-sm focus:outline-none sm:text-sm px-3 py-2 ${
										errors.walletAddress ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={
										walletConnected
											? "Wallet Connected"
											: "Connect wallet to register"
									}
								/>
								<button
									type="button"
									onClick={handleConnectWallet}
									className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm whitespace-nowrap cursor-pointer"
									disabled={walletConnected}
								>
									{walletConnected ? "Connected" : "Connect"}
								</button>
							</div>
							{errors.walletAddress && (
								<p className="mt-1 text-xs text-red-600">
									{errors.walletAddress.message}
								</p>
							)}
						</div>

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={isLoading || !walletConnected}
								className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isLoading ? (
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
								{isLoading ? "Creating Account..." : "Create Account"}
							</button>
						</div>
					</form>

					{/* Login Link */}
					<p className="mt-6 text-center text-sm text-gray-500">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
						>
							Sign in
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
				<div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
					<div className="mb-12 w-52 h-52 bg-gradient-to-br from-blue-500/15 to-transparent rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
						{/* Lock Icon - similar to the screenshot */}
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
						Secure, Transparent Escrow
					</h2>
					<p className="text-xl text-gray-300 max-w-lg">
						Leveraging blockchain for trusted transactions in Kenya. Start
						trading safely today.
					</p>
				</div>
			</div>
		</div>
	);
}
