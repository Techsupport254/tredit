"use client";

import { useState, useEffect, useRef, FormEventHandler } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
	HomeIcon,
	ChevronRightIcon,
	CheckCircleIcon,
	XMarkIcon,
	UserCircleIcon,
	EnvelopeIcon,
	PhoneIcon,
	CalendarIcon,
	IdentificationIcon,
	WalletIcon,
	DocumentTextIcon,
	Cog6ToothIcon,
	ShieldCheckIcon,
	ClockIcon,
	BellIcon,
	ArrowTopRightOnSquareIcon,
	PhotoIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ethers } from "ethers";
import { NotificationChannel, NotificationType, Gender } from "@prisma/client";

// Profile completion checklist
const completionChecklist = [
	{ id: "name", label: "Full Name", icon: UserCircleIcon },
	{ id: "email", label: "Email Address", icon: EnvelopeIcon },
	{ id: "phoneNumber", label: "Phone Number", icon: PhoneIcon },
	{ id: "gender", label: "Gender", icon: IdentificationIcon },
	{ id: "dob", label: "Date of Birth", icon: CalendarIcon },
	{ id: "profileImage", label: "Profile Picture", icon: PhotoIcon },
	{ id: "bio", label: "Bio", icon: DocumentTextIcon },
	{ id: "walletAddress", label: "Wallet Connected", icon: WalletIcon },
	{
		id: "preferences",
		label: "Preferences Set",
		icon: Cog6ToothIcon,
		condition: (value: any) => {
			if (typeof value === "object" && value?.preferences?.notifications) {
				const notifs = value.preferences.notifications;
				return (
					notifs.emailNotifications ||
					notifs.pushNotifications ||
					notifs.inAppNotifications ||
					notifs.smsNotifications ||
					notifs.webhookNotifications
				);
			}
			return false;
		},
	},
	{
		id: "verificationStatus",
		label: "Account Verified",
		icon: ShieldCheckIcon,
		condition: (value: any) => {
			if (typeof value === "string") {
				return value === "VERIFIED";
			}
			return false;
		},
	},
];

// Enums from schema
enum UserStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

enum VerificationStatus {
	PENDING = "PENDING",
	VERIFIED = "VERIFIED",
	REJECTED = "REJECTED",
}

// Profile update schema
const profileUpdateSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phoneNumber: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	dob: z.string().optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	profileImage: z.string().optional(),
	preferences: z
		.object({
			notifications: z
				.object({
					channels: z
						.array(z.nativeEnum(NotificationChannel))
						.default([NotificationChannel.EMAIL]),
					types: z.array(z.nativeEnum(NotificationType)).default([]),
					emailNotifications: z.boolean().default(true),
					pushNotifications: z.boolean().default(true),
					inAppNotifications: z.boolean().default(true),
					smsNotifications: z.boolean().default(false),
					webhookNotifications: z.boolean().default(false),
				})
				.default({
					channels: [NotificationChannel.EMAIL],
					types: [],
					emailNotifications: true,
					pushNotifications: true,
					inAppNotifications: true,
					smsNotifications: false,
					webhookNotifications: false,
				}),
		})
		.optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Constants for external services
const getBlockchainExplorerUrl = (txHash: string) => {
	return `https://www.oklink.com/amoy/tx/${txHash}`;
};

const IPFS_GATEWAY_URL =
	process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
	"https://gateway.pinata.cloud/ipfs/";
const USER_PROFILE_CONTRACT_ADDRESS =
	process.env.NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS;
const USER_PROFILE_ABI = process.env.NEXT_PUBLIC_USER_PROFILE_ABI
	? JSON.parse(process.env.NEXT_PUBLIC_USER_PROFILE_ABI)
	: [];

interface UserProfile {
	id: string;
	name: string;
	email: string;
	walletAddress: string;
	status: string;
	verificationStatus: string;
	createdAt: string;
	updatedAt: string;
	lastLogin: string;
	blockchainTxHash?: string;
	ipfsUrl?: string;
	ipfsMetadata?: any;
	profileImage?: string;
	gender?: Gender;
	dob?: string;
	phoneNumber?: string;
	bio?: string;
	preferences?: {
		notifications?: {
			channels?: NotificationChannel[];
			types?: NotificationType[];
			emailNotifications?: boolean;
			pushNotifications?: boolean;
			inAppNotifications?: boolean;
			smsNotifications?: boolean;
			webhookNotifications?: boolean;
		};
	};
	metadata?: any;
	lastNotificationAt?: string;
	unreadCount?: number;
}

interface UserSession {
	id: string;
	email: string;
	name: string;
	walletAddress: string | null;
	role: string;
	verificationStatus: string;
}

// Format date with relative time if recent
const formatDate = (date: string) => {
	const now = new Date();
	const targetDate = new Date(date);
	const diffInHours = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60);

	if (diffInHours < 24) {
		return `${Math.round(diffInHours)} hours ago`;
	} else if (diffInHours < 48) {
		return "Yesterday";
	} else {
		return targetDate.toLocaleString();
	}
};

// Loading skeleton component
const ProfileSkeleton = () => (
	<div className="space-y-6">
		{/* Header Skeleton */}
		<div className="space-y-1">
			<div className="h-7 bg-gray-200 rounded w-32"></div>
			<div className="h-4 bg-gray-200 rounded w-64"></div>
		</div>

		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Left Column Skeleton */}
			<div className="lg:col-span-2 space-y-6">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="p-6">
						<div className="flex justify-between items-center mb-6">
							<div className="h-6 bg-gray-200 rounded w-40"></div>
							<div className="h-8 bg-gray-200 rounded w-24"></div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Profile Image Skeleton */}
							<div className="flex items-center space-x-4">
								<div className="h-16 w-16 bg-gray-200 rounded-full"></div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-32"></div>
									<div className="h-3 bg-gray-200 rounded w-48"></div>
								</div>
							</div>

							{/* Form Fields Skeleton */}
							{[...Array(4)].map((_, i) => (
								<div key={i} className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-24"></div>
									<div className="h-10 bg-gray-200 rounded w-full"></div>
								</div>
							))}

							{/* Bio Skeleton */}
							<div className="col-span-2 space-y-2">
								<div className="h-4 bg-gray-200 rounded w-16"></div>
								<div className="h-24 bg-gray-200 rounded w-full"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Preferences Section Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="p-6">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
						<div className="grid grid-cols-2 gap-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="bg-gray-100 rounded-lg p-3 space-y-2">
									<div className="h-4 bg-gray-200 rounded w-24"></div>
									<div className="h-4 bg-gray-200 rounded w-32"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Right Column Skeleton */}
			<div className="space-y-6">
				{/* Profile Completion Circle Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="h-6 bg-gray-200 rounded w-40"></div>
						<div className="relative w-20 h-20 rounded-full bg-gray-200"></div>
					</div>
					<div className="space-y-3">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<div className="h-5 w-5 bg-gray-200 rounded"></div>
									<div className="h-4 bg-gray-200 rounded w-32"></div>
								</div>
								<div className="h-4 bg-gray-200 rounded w-16"></div>
							</div>
						))}
					</div>
				</div>

				{/* Blockchain Wallet Skeleton */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
					<div className="bg-gray-100 rounded-lg p-4">
						<div className="flex items-center space-x-2">
							<div className="h-5 w-5 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-48"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// Function to send verification email
const sendVerificationEmail = async (email: string) => {
	try {
		const response = await fetch("/api/auth/send-verification", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Failed to send verification email");
		}

		toast.success("Verification email sent! Please check your inbox.");
	} catch (error) {
		console.error("Error sending verification email:", error);
		toast.error(
			error instanceof Error
				? error.message
				: "Failed to send verification email"
		);
		throw error;
	}
};

type PreferencesFormValues = {
	emailNotifications: boolean;
	pushNotifications: boolean;
	inAppNotifications: boolean;
	smsNotifications: boolean;
	webhookNotifications: boolean;
};

export default function ProfilePage() {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(true);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [activeField, setActiveField] = useState<string | null>(null);
	const [verificationDigits, setVerificationDigits] = useState([
		"",
		"",
		"",
		"",
		"",
		"",
	]);
	const [resendTimer, setResendTimer] = useState(0);
	const inputRefs = Array(6)
		.fill(0)
		.map(() => useRef<HTMLInputElement>(null));
	const [isResending, setIsResending] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [formValues, setFormValues] = useState<PreferencesFormValues>({
		emailNotifications: false,
		pushNotifications: false,
		inAppNotifications: false,
		smsNotifications: false,
		webhookNotifications: false,
	});

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<ProfileUpdateFormData>({
		resolver: zodResolver(profileUpdateSchema) as any,
		defaultValues: {
			name: "",
			email: "",
			preferences: {
				notifications: {
					channels: [NotificationChannel.EMAIL],
					types: [],
					emailNotifications: true,
					pushNotifications: true,
					inAppNotifications: true,
					smsNotifications: false,
					webhookNotifications: false,
				},
			},
		},
	});

	const handleComplete = (field: string) => {
		setActiveField(field);
		setIsSidePanelOpen(true);
	};

	useEffect(() => {
		if (session?.user?.email) {
			fetchProfileData();
		}
	}, [session]);

	useEffect(() => {
		// Prefill form data when profile is loaded or side panel is opened
		if (profile && isSidePanelOpen) {
			// Convert dates to YYYY-MM-DD format for input[type="date"]
			const formattedDob = profile.dob
				? new Date(profile.dob).toISOString().split("T")[0]
				: "";

			// Reset form with current profile data
			reset({
				name: profile.name || "",
				email: profile.email || "",
				phoneNumber: profile.phoneNumber || "",
				gender: (profile.gender as Gender) || undefined,
				dob: formattedDob,
				bio: profile.bio || "",
				preferences: profile.preferences || {},
			});

			// Focus on the active field if set
			if (activeField) {
				const element = document.getElementById(activeField);
				if (element) {
					element.focus();
					// Scroll the element into view
					element.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			}
		}
	}, [profile, isSidePanelOpen, reset, activeField]);

	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [resendTimer]);

	useEffect(() => {
		if (profile?.preferences?.notifications) {
			setFormValues({
				emailNotifications:
					profile.preferences.notifications.emailNotifications ?? false,
				pushNotifications:
					profile.preferences.notifications.pushNotifications ?? false,
				inAppNotifications:
					profile.preferences.notifications.inAppNotifications ?? false,
				smsNotifications:
					profile.preferences.notifications.smsNotifications ?? false,
				webhookNotifications:
					profile.preferences.notifications.webhookNotifications ?? false,
			});
		}
	}, [profile]);

	const fetchProfileData = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/user/profile");

			if (!response.ok) {
				throw new Error("Failed to fetch profile data");
			}

			const data = await response.json();
			setProfile(data);
			reset(data); // Pre-fill form with current data
		} catch (error) {
			console.error("Error fetching profile:", error);
			toast.error("Failed to fetch profile data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		try {
			const file = event.target.files?.[0];
			if (!file) return;

			setIsUploading(true);

			// Create form data
			const formData = new FormData();
			formData.append("file", file);

			// Upload to Pinata
			const uploadResponse = await fetch("/api/ipfs/upload-file", {
				method: "POST",
				body: formData,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			const { hash } = await uploadResponse.json();
			const ipfsUrl = `ipfs://${hash}`;

			// Update profile with new image URL
			const updateResponse = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					profileImage: ipfsUrl,
				}),
			});

			if (!updateResponse.ok) {
				throw new Error("Failed to update profile");
			}

			// Update local state
			setImagePreview(URL.createObjectURL(file));
			setProfile((prev) => (prev ? { ...prev, profileImage: ipfsUrl } : null));
			toast.success("Profile image updated successfully");
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload image");
		} finally {
			setIsUploading(false);
		}
	};

	const onUpdateProfile = async (data: ProfileUpdateFormData) => {
		try {
			setIsUpdating(true);

			// Format date to ISO string if it exists
			const formattedData = {
				...data,
				dob: data.dob ? new Date(data.dob).toISOString() : undefined,
			};

			// Update profile
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formattedData),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			const updatedProfile = await response.json();
			setProfile(updatedProfile);
			setIsSidePanelOpen(false);
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsUpdating(false);
		}
	};

	const handlePreferenceUpdate = async (
		field: keyof PreferencesFormValues | string,
		value: boolean | string
	) => {
		try {
			console.log("Toggle clicked:", { field, value });

			// Create a deep copy of the current preferences
			const currentPreferences = profile?.preferences || {};
			console.log("Current preferences:", currentPreferences);

			const updatedPreferences = {
				notifications: {
					...currentPreferences.notifications,
					channels: currentPreferences.notifications?.channels || [
						NotificationChannel.EMAIL,
					],
					types: currentPreferences.notifications?.types || [],
					emailNotifications:
						field === "emailNotifications"
							? value
							: currentPreferences.notifications?.emailNotifications ?? true,
					pushNotifications:
						field === "pushNotifications"
							? value
							: currentPreferences.notifications?.pushNotifications ?? true,
					inAppNotifications:
						field === "inAppNotifications"
							? value
							: currentPreferences.notifications?.inAppNotifications ?? true,
					smsNotifications:
						field === "smsNotifications"
							? value
							: currentPreferences.notifications?.smsNotifications ?? false,
					webhookNotifications:
						field === "webhookNotifications"
							? value
							: currentPreferences.notifications?.webhookNotifications ?? false,
				},
			};

			console.log("Sending updated preferences:", updatedPreferences);

			// Send update to server
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					preferences: updatedPreferences,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Server response error:", errorData);
				throw new Error(errorData.error || "Failed to update preferences");
			}

			const updatedProfile = await response.json();
			console.log("Server response success:", updatedProfile);

			// Update local state
			setProfile((prev) => {
				const newProfile = {
					...prev!,
					preferences: updatedProfile.preferences,
				};
				console.log("Updated profile state:", newProfile);
				return newProfile;
			});

			// Update form values
			setFormValues((prev) => {
				const newFormValues = {
					...prev,
					[field]: value,
				};
				console.log("Updated form values:", newFormValues);
				return newFormValues;
			});

			toast.success("Preferences updated successfully");
		} catch (error) {
			console.error("Error updating preferences:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update preferences"
			);

			// Revert form values on error
			if (profile?.preferences?.notifications) {
				setFormValues({
					emailNotifications:
						profile.preferences.notifications.emailNotifications ?? false,
					pushNotifications:
						profile.preferences.notifications.pushNotifications ?? false,
					inAppNotifications:
						profile.preferences.notifications.inAppNotifications ?? false,
					smsNotifications:
						profile.preferences.notifications.smsNotifications ?? false,
					webhookNotifications:
						profile.preferences.notifications.webhookNotifications ?? false,
				});
			}
		}
	};

	const handleDigitChange = (index: number, value: string) => {
		// Handle pasting
		if (value.length > 1) {
			const digits = value
				.slice(0, 6)
				.split("")
				.map((char) => char.toUpperCase());
			const newDigits = [...verificationDigits];
			digits.forEach((digit, i) => {
				if (i < 6) newDigits[i] = digit;
			});
			setVerificationDigits(newDigits);

			// Focus the next empty input or the last input if all filled
			const nextEmptyIndex = newDigits.findIndex((digit) => !digit);
			if (nextEmptyIndex === -1) {
				inputRefs[5]?.current?.focus();
				// Auto verify if all digits are filled
				handleVerifyEmail(newDigits.join(""));
			} else {
				inputRefs[nextEmptyIndex]?.current?.focus();
			}
			return;
		}

		// Handle single digit input
		if (!/^\d*$/.test(value)) return;

		const newDigits = [...verificationDigits];
		newDigits[index] = value.toUpperCase();
		setVerificationDigits(newDigits);

		// Move to next input if value is entered
		if (value && index < 5) {
			inputRefs[index + 1]?.current?.focus();
		}

		// Auto verify when all digits are filled
		if (newDigits.every((digit) => digit) && value) {
			handleVerifyEmail(newDigits.join(""));
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Backspace") {
			if (!verificationDigits[index]) {
				// If current input is empty, move to previous input and clear it
				if (index > 0) {
					const newDigits = [...verificationDigits];
					newDigits[index - 1] = "";
					setVerificationDigits(newDigits);
					inputRefs[index - 1]?.current?.focus();
				}
			} else {
				// Clear current input
				const newDigits = [...verificationDigits];
				newDigits[index] = "";
				setVerificationDigits(newDigits);
			}
		} else if (e.key === "ArrowLeft" && index > 0) {
			inputRefs[index - 1]?.current?.focus();
		} else if (e.key === "ArrowRight" && index < 5) {
			inputRefs[index + 1]?.current?.focus();
		}
	};

	const handleVerifyEmail = async (code: string) => {
		if (!profile?.email) return;

		try {
			setIsVerifying(true);
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: profile.email,
					code,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to verify email");
			}

			toast.success("Email verified successfully!");
			await fetchProfileData(); // Refresh profile data
			setVerificationDigits(["", "", "", "", "", ""]); // Clear inputs
		} catch (error) {
			console.error("Verification error:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to verify email"
			);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleResendVerification = async () => {
		if (!profile?.email || resendTimer > 0) return;

		try {
			setIsResending(true);
			await sendVerificationEmail(profile.email);
			toast.success("Verification email sent! Please check your inbox.");
			setResendTimer(60); // Start 60 second timer
		} catch (error) {
			console.error("Error sending verification email:", error);
			toast.error("Failed to send verification email. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	const calculateCompletion = (profile: UserProfile) => {
		const completed = completionChecklist.filter((item) => {
			const value = profile[item.id as keyof UserProfile];
			if (item.condition) {
				return item.condition(value as string);
			}
			return (
				value &&
				(typeof value === "object" ? Object.keys(value).length > 0 : true)
			);
		});
		return {
			completed: completed.length,
			total: completionChecklist.length,
			percentage: Math.round(
				(completed.length / completionChecklist.length) * 100
			),
		};
	};

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!profile) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
				<div className="bg-gray-100 rounded-full p-6 mb-4">
					<UserCircleIcon className="w-16 h-16 text-gray-400" />
				</div>
				<h2 className="text-2xl font-semibold text-gray-900 mb-2">
					Profile Not Found
				</h2>
				<p className="text-gray-600 max-w-md">
					We couldn't find your profile information. This might be because your
					account is not fully set up or there was an error accessing your data.
				</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	const completion = calculateCompletion(profile);

	const onSubmit = handleSubmit((data: ProfileUpdateFormData) => {
		return onUpdateProfile(data);
	}) as unknown as FormEventHandler<HTMLFormElement>;

	return (
		<div className="h-full w-full overflow-hidden">
			<div className="h-full overflow-y-auto px-6 py-4">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
					<p className="text-sm text-gray-500">
						Manage your account settings and preferences
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Personal Information */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							<div className="p-6">
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-lg font-medium text-gray-900">
										Personal Information
									</h2>
									<button
										onClick={() => setIsSidePanelOpen(true)}
										className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
									>
										<Cog6ToothIcon className="w-4 h-4 mr-1" />
										Edit Profile
									</button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Profile Image */}
									<div className="flex items-start space-x-4 col-span-2">
										<div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
											{imagePreview ? (
												<Image
													src={imagePreview}
													alt="Profile preview"
													fill
													sizes="(max-width: 96px) 96px"
													priority
													className="object-cover"
												/>
											) : profile?.profileImage ? (
												<Image
													src={profile.profileImage.replace(
														"ipfs://",
														"https://gateway.pinata.cloud/ipfs/"
													)}
													alt={profile.name || "Profile"}
													fill
													sizes="(max-width: 96px) 96px"
													priority
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center bg-gray-200">
													<UserCircleIcon className="w-16 h-16 text-gray-400" />
												</div>
											)}
											{isUploading && (
												<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
													<LoadingSpinner size="sm" className="text-white" />
												</div>
											)}
										</div>
										<div>
											<label
												htmlFor="profile-image"
												className="block text-sm font-medium text-gray-700"
											>
												Profile Picture
											</label>
											<div className="mt-1 flex items-center">
												<input
													type="file"
													id="profile-image"
													accept="image/*"
													onChange={handleImageUpload}
													className="sr-only"
												/>
												<label
													htmlFor="profile-image"
													className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
												>
													<PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
													Change Photo
												</label>
											</div>
											<p className="mt-1 text-sm text-gray-500">
												JPG, PNG, or GIF. Max size 5MB.
											</p>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-center">
											<PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
											<div>
												<label className="text-sm font-medium text-gray-500">
													Phone Number
												</label>
												<p className="text-sm text-gray-700">
													{profile.phoneNumber || "Not provided"}
												</p>
											</div>
										</div>
										<div className="flex items-center">
											<IdentificationIcon className="w-5 h-5 text-gray-400 mr-2" />
											<div>
												<label className="text-sm font-medium text-gray-500">
													Gender
												</label>
												<p className="text-sm text-gray-700">
													{profile.gender || "Not specified"}
												</p>
											</div>
										</div>
									</div>

									<div className="flex items-center">
										<CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
										<div>
											<label className="text-sm font-medium text-gray-500">
												Date of Birth
											</label>
											<p className="text-sm text-gray-700">
												{profile.dob || "Not provided"}
											</p>
										</div>
									</div>

									<div className="flex items-center">
										<WalletIcon className="w-5 h-5 text-gray-400 mr-2" />
										<div>
											<label className="text-sm font-medium text-gray-500">
												Wallet Address
											</label>
											<p className="text-sm text-gray-700 font-mono break-all">
												{profile.walletAddress}
											</p>
										</div>
									</div>

									<div className="col-span-2">
										<div className="flex items-start">
											<DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
											<div>
												<label className="text-sm font-medium text-gray-500">
													Bio
												</label>
												<p className="text-sm text-gray-700 mt-1">
													{profile.bio || "No bio provided"}
												</p>
											</div>
										</div>
									</div>

									{profile.blockchainTxHash && (
										<div className="col-span-2">
											<div className="flex items-center bg-blue-50 rounded-lg p-4">
												<div className="flex-1">
													<label className="text-sm font-medium text-gray-500 flex items-center">
														<WalletIcon className="w-4 h-4 mr-1" />
														Blockchain Transaction
														<span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
															Polygon Network
														</span>
													</label>
													<div className="flex items-center">
														<p className="text-sm text-gray-700 font-mono break-all mr-2">
															{profile.blockchainTxHash}
														</p>
														<a
															href={getBlockchainExplorerUrl(
																profile.blockchainTxHash
															)}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-700"
															title="View on Polygonscan"
														>
															<ArrowTopRightOnSquareIcon className="w-4 h-4" />
														</a>
													</div>
												</div>
											</div>
										</div>
									)}

									{profile.ipfsUrl && (
										<div className="col-span-2">
											<div className="flex items-center bg-purple-50 rounded-lg p-4">
												<div className="flex-1">
													<label className="text-sm font-medium text-gray-500">
														IPFS URL
													</label>
													<div className="flex items-center">
														<p className="text-sm text-blue-600 break-all mr-2">
															{profile.ipfsUrl}
														</p>
														<a
															href={`${IPFS_GATEWAY_URL}${profile.ipfsUrl.replace(
																"ipfs://",
																""
															)}`}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-700"
														>
															<ArrowTopRightOnSquareIcon className="w-4 h-4" />
														</a>
													</div>
												</div>
											</div>
										</div>
									)}

									{profile.metadata && (
										<div className="col-span-2">
											<div className="bg-gray-50 rounded-lg p-4">
												<label className="text-sm font-medium text-gray-500">
													Additional Metadata
												</label>
												<pre className="mt-2 text-xs text-gray-700 overflow-x-auto">
													{JSON.stringify(profile.metadata, null, 2)}
												</pre>
											</div>
										</div>
									)}

									{/* Account Verification Section */}
									{profile?.verificationStatus === "PENDING" && (
										<div className="col-span-2 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
											<div className="flex items-center justify-between mb-4">
												<h4 className="text-base font-medium text-yellow-800">
													Email Verification Required
												</h4>
												<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
													Pending
												</span>
											</div>

											<div className="space-y-4">
												<p className="text-sm text-yellow-700">
													Please enter the 6-digit verification code sent to
													your email.
												</p>

												<div className="flex justify-center gap-4">
													{verificationDigits.map((digit, index) => (
														<div key={index} className="relative w-14 h-14">
															<input
																ref={inputRefs[index]}
																type="text"
																maxLength={6}
																value={digit}
																onChange={(e) =>
																	handleDigitChange(index, e.target.value)
																}
																onKeyDown={(e) => handleKeyDown(index, e)}
																onPaste={(e) => {
																	e.preventDefault();
																	const pastedData = e.clipboardData
																		.getData("text")
																		.trim();
																	handleDigitChange(index, pastedData);
																}}
																className="absolute inset-0 w-full h-full text-center border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-0 text-xl font-semibold bg-white disabled:opacity-50"
																style={{ aspectRatio: "1/1" }}
																disabled={isVerifying}
																inputMode="numeric"
															/>
														</div>
													))}
												</div>

												{/* Resend Code */}
												<div className="flex items-center justify-between pt-2 border-t border-yellow-200">
													<p className="text-sm text-yellow-700">
														Didn't receive the code?
													</p>
													<button
														type="button"
														onClick={handleResendVerification}
														disabled={isResending || resendTimer > 0}
														className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline disabled:opacity-50 disabled:no-underline"
													>
														{isResending
															? "Sending..."
															: resendTimer > 0
															? `Resend in ${resendTimer}s`
															: "Resend verification email"}
													</button>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Preferences Section */}
						{profile.preferences && (
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
									<Cog6ToothIcon className="w-5 h-5 text-gray-400 mr-2" />
									Preferences
								</h2>

								<div className="space-y-6">
									<section className="space-y-4">
										<label className="text-sm font-medium text-gray-700 block">
											Notification Channels
										</label>

										{/* Email Notifications */}
										<div className="flex items-center justify-between py-2 border-b">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Email Notifications
												</h4>
												<p className="text-xs text-gray-500">
													Receive updates via email
												</p>
											</div>
											<button
												type="button"
												className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
												onClick={() => {
													const newValue = !formValues.emailNotifications;
													setFormValues((prev) => ({
														...prev,
														emailNotifications: newValue,
													}));
													setValue(
														"preferences.notifications.emailNotifications",
														newValue
													);
													handlePreferenceUpdate(
														"emailNotifications",
														newValue
													);
												}}
											>
												<input
													type="checkbox"
													checked={formValues.emailNotifications}
													onChange={() => {}}
													className="peer sr-only"
												/>
												<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
												<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
											</button>
										</div>

										{/* Push Notifications */}
										<div className="flex items-center justify-between py-2 border-b">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Push Notifications
												</h4>
												<p className="text-xs text-gray-500">
													Get browser notifications
												</p>
											</div>
											<button
												type="button"
												className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
												onClick={() => {
													const newValue = !formValues.pushNotifications;
													setFormValues((prev) => ({
														...prev,
														pushNotifications: newValue,
													}));
													setValue(
														"preferences.notifications.pushNotifications",
														newValue
													);
													handlePreferenceUpdate("pushNotifications", newValue);
												}}
											>
												<input
													type="checkbox"
													checked={formValues.pushNotifications}
													onChange={() => {}}
													className="peer sr-only"
												/>
												<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
												<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
											</button>
										</div>

										{/* In-App Notifications */}
										<div className="flex items-center justify-between py-2 border-b">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													In-App Notifications
												</h4>
												<p className="text-xs text-gray-500">
													Show notifications within the app
												</p>
											</div>
											<button
												type="button"
												className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
												onClick={() => {
													const newValue = !formValues.inAppNotifications;
													setFormValues((prev) => ({
														...prev,
														inAppNotifications: newValue,
													}));
													setValue(
														"preferences.notifications.inAppNotifications",
														newValue
													);
													handlePreferenceUpdate(
														"inAppNotifications",
														newValue
													);
												}}
											>
												<input
													type="checkbox"
													checked={formValues.inAppNotifications}
													onChange={() => {}}
													className="peer sr-only"
												/>
												<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
												<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
											</button>
										</div>

										{/* SMS Notifications */}
										<div className="flex items-center justify-between py-2 border-b">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													SMS Notifications
												</h4>
												<p className="text-xs text-gray-500">
													Get text message alerts
												</p>
											</div>
											<button
												type="button"
												className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
												onClick={() => {
													const newValue = !formValues.smsNotifications;
													setFormValues((prev) => ({
														...prev,
														smsNotifications: newValue,
													}));
													setValue(
														"preferences.notifications.smsNotifications",
														newValue
													);
													handlePreferenceUpdate("smsNotifications", newValue);
												}}
											>
												<input
													type="checkbox"
													checked={formValues.smsNotifications}
													onChange={() => {}}
													className="peer sr-only"
												/>
												<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
												<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
											</button>
										</div>

										{/* Webhook Notifications */}
										<div className="flex items-center justify-between py-2 border-b">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Webhook Notifications
												</h4>
												<p className="text-xs text-gray-500">
													Send notifications to external services
												</p>
											</div>
											<button
												type="button"
												className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
												onClick={() => {
													const newValue = !formValues.webhookNotifications;
													setFormValues((prev) => ({
														...prev,
														webhookNotifications: newValue,
													}));
													setValue(
														"preferences.notifications.webhookNotifications",
														newValue
													);
													handlePreferenceUpdate(
														"webhookNotifications",
														newValue
													);
												}}
											>
												<input
													type="checkbox"
													checked={formValues.webhookNotifications}
													onChange={() => {}}
													className="peer sr-only"
												/>
												<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
												<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
											</button>
										</div>
									</section>
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Account Status */}
					<div className="space-y-6">
						{/* Profile Completion */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-medium text-gray-900">
									Profile Completion
								</h2>
								<div className="relative w-20 h-20">
									<svg className="w-20 h-20 transform -rotate-90">
										<circle
											cx="40"
											cy="40"
											r="36"
											stroke="currentColor"
											strokeWidth="8"
											fill="transparent"
											className="text-gray-200"
										/>
										<circle
											cx="40"
											cy="40"
											r="36"
											stroke="currentColor"
											strokeWidth="8"
											fill="transparent"
											strokeDasharray={`${2 * Math.PI * 36}`}
											strokeDashoffset={`${
												2 * Math.PI * 36 * (1 - completion.percentage / 100)
											}`}
											className="text-blue-500 transition-all duration-1000 ease-out"
										/>
									</svg>
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="text-lg font-semibold text-gray-900">
											{completion.percentage}%
										</span>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								{completionChecklist.map((item) => {
									const value = profile?.[item.id as keyof UserProfile];
									const isComplete = item.condition
										? item.condition(value)
										: Boolean(value);
									return (
										<div
											key={item.id}
											className="flex items-center justify-between text-sm"
											onClick={() => handleComplete(item.id)}
										>
											<span className="flex items-center text-gray-700">
												<item.icon className="h-5 w-5 text-gray-400 mr-2" />
												{item.label}
												{isComplete ? (
													<CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
												) : (
													<XMarkIcon className="h-4 w-4 text-gray-400 ml-2" />
												)}
											</span>
											{!isComplete && (
												<button
													type="button"
													onClick={() => handleComplete(item.id)}
													className="text-blue-600 hover:text-blue-700 text-sm font-medium"
												>
													Complete
												</button>
											)}
										</div>
									);
								})}
							</div>
						</div>

						{/* Account Status */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
								<ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-2" />
								Account Status
							</h2>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium text-gray-500">
										Account Status
									</label>
									<span
										className={`px-2 py-1 text-xs font-medium rounded-full ${
											profile.status === "ACTIVE"
												? "bg-green-100 text-green-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{profile.status}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium text-gray-500">
										Verification Status
									</label>
									<span
										className={`px-2 py-1 text-xs font-medium rounded-full ${
											profile.verificationStatus === "VERIFIED"
												? "bg-green-100 text-green-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{profile.verificationStatus}
									</span>
								</div>
								<div className="flex items-center">
									<ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
									<div>
										<label className="text-sm font-medium text-gray-500">
											Member Since
										</label>
										<p className="text-sm text-gray-700">
											{new Date(profile.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="flex items-center">
									<ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
									<div>
										<label className="text-sm font-medium text-gray-500">
											Last Login
										</label>
										<p className="text-sm text-gray-700">
											{formatDate(profile.lastLogin)}
										</p>
									</div>
								</div>
								<div className="flex items-center">
									<ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
									<div>
										<label className="text-sm font-medium text-gray-500">
											Last Updated
										</label>
										<p className="text-sm text-gray-700">
											{formatDate(profile.updatedAt)}
										</p>
									</div>
								</div>
								{profile.lastNotificationAt && (
									<div className="flex items-center">
										<BellIcon className="w-5 h-5 text-gray-400 mr-2" />
										<div>
											<label className="text-sm font-medium text-gray-500">
												Last Notification
											</label>
											<p className="text-sm text-gray-700">
												{formatDate(profile.lastNotificationAt)}
											</p>
										</div>
									</div>
								)}
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<BellIcon className="w-5 h-5 text-gray-400 mr-2" />
										<label className="text-sm font-medium text-gray-500">
											Unread Notifications
										</label>
									</div>
									<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
										{profile.unreadCount}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Side Panel */}
			{isSidePanelOpen && (
				<div className="fixed inset-0 overflow-hidden z-50">
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
						<div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
							<div className="relative w-screen max-w-md">
								<div className="h-full flex flex-col bg-white shadow-xl">
									{/* Header */}
									<div className="py-6 px-4 bg-blue-600 sm:px-6">
										<div className="flex items-center justify-between">
											<h2 className="text-lg font-medium text-white">
												Update Profile
											</h2>
											<button
												type="button"
												className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
												onClick={() => {
													setIsSidePanelOpen(false);
													setActiveField(null);
												}}
											>
												<XCircleIcon className="h-6 w-6" aria-hidden="true" />
											</button>
										</div>
									</div>

									{/* Form Content */}
									<div className="flex-1 overflow-y-auto">
										<div className="px-4 py-6 sm:px-6">
											<form onSubmit={onSubmit} className="space-y-6">
												{/* Profile Picture */}
												<div>
													<h3 className="text-lg font-medium text-gray-900">
														Profile Picture
													</h3>
													<div className="mt-4 flex items-center space-x-4">
														<div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
															{imagePreview ? (
																<Image
																	src={imagePreview}
																	alt="Profile preview"
																	fill
																	sizes="(max-width: 96px) 96px"
																	priority
																	className="object-cover"
																/>
															) : profile?.profileImage ? (
																<Image
																	src={profile.profileImage.replace(
																		"ipfs://",
																		"https://gateway.pinata.cloud/ipfs/"
																	)}
																	alt={profile.name || "Profile"}
																	fill
																	sizes="(max-width: 96px) 96px"
																	priority
																	className="object-cover"
																/>
															) : (
																<div className="w-full h-full flex items-center justify-center bg-gray-200">
																	<UserCircleIcon className="w-16 h-16 text-gray-400" />
																</div>
															)}
															{isUploading && (
																<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
																	<LoadingSpinner
																		size="sm"
																		className="text-white"
																	/>
																</div>
															)}
														</div>
														<div className="flex flex-col space-y-2">
															<input
																type="file"
																id="profile-image"
																accept="image/*"
																onChange={handleImageUpload}
																className="sr-only"
															/>
															<label
																htmlFor="profile-image"
																className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
															>
																<PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
																Change Photo
															</label>
														</div>
													</div>
												</div>

												{/* Basic Information */}
												<div>
													<h3 className="text-lg font-medium text-gray-900 mb-4">
														Basic Information
													</h3>
													<div className="space-y-4">
														{/* Full Name */}
														<div>
															<label
																htmlFor="name"
																className="block text-sm font-medium text-gray-700"
															>
																Full Name *
															</label>
															<input
																type="text"
																id="name"
																{...register("name")}
																className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
																placeholder="Enter your full name"
															/>
															{errors.name && (
																<p className="mt-1 text-sm text-red-600">
																	{errors.name.message}
																</p>
															)}
														</div>

														{/* Email */}
														<div>
															<label
																htmlFor="email"
																className="block text-sm font-medium text-gray-700"
															>
																Email Address *
															</label>
															<div className="mt-1">
																<input
																	type="email"
																	id="email"
																	{...register("email")}
																	className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
																	placeholder="your.email@example.com"
																/>
																{errors.email && (
																	<p className="mt-1 text-sm text-red-600">
																		{errors.email.message}
																	</p>
																)}
															</div>
														</div>

														{/* Phone Number */}
														<div>
															<label
																htmlFor="phoneNumber"
																className="block text-sm font-medium text-gray-700"
															>
																Phone Number
															</label>
															<input
																type="tel"
																id="phoneNumber"
																{...register("phoneNumber")}
																className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
																placeholder="+1234567890"
															/>
														</div>

														{/* Gender */}
														<div>
															<label
																htmlFor="gender"
																className="block text-sm font-medium text-gray-700"
															>
																Gender
															</label>
															<select
																id="gender"
																{...register("gender")}
																className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
															>
																<option value="">Select gender</option>
																{Object.values(Gender).map((gender) => (
																	<option key={gender} value={gender}>
																		{gender.charAt(0) +
																			gender.slice(1).toLowerCase()}
																	</option>
																))}
															</select>
														</div>

														{/* Date of Birth */}
														<div>
															<label
																htmlFor="dob"
																className="block text-sm font-medium text-gray-700"
															>
																Date of Birth
															</label>
															<input
																type="date"
																id="dob"
																{...register("dob")}
																className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
															/>
														</div>
													</div>
												</div>

												{/* Bio */}
												<div>
													<label
														htmlFor="bio"
														className="block text-sm font-medium text-gray-700"
													>
														Bio
													</label>
													<textarea
														id="bio"
														{...register("bio")}
														rows={4}
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
														placeholder="Tell us about yourself..."
													/>
													{errors.bio && (
														<p className="mt-1 text-sm text-red-600">
															{errors.bio.message}
														</p>
													)}
												</div>

												{/* Preferences */}
												<div>
													<h3 className="text-lg font-medium text-gray-900 mb-4">
														Notification Preferences
													</h3>
													<div className="space-y-4">
														<label className="text-sm font-medium text-gray-700 block">
															Notification Channels
														</label>

														{/* Email Notifications */}
														<div className="flex items-center justify-between py-2 border-b">
															<div>
																<h4 className="text-sm font-medium text-gray-900">
																	Email Notifications
																</h4>
																<p className="text-xs text-gray-500">
																	Receive updates via email
																</p>
															</div>
															<button
																type="button"
																className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
																onClick={() => {
																	const newValue =
																		!formValues.emailNotifications;
																	setFormValues((prev) => ({
																		...prev,
																		emailNotifications: newValue,
																	}));
																	setValue(
																		"preferences.notifications.emailNotifications",
																		newValue
																	);
																	handlePreferenceUpdate(
																		"emailNotifications",
																		newValue
																	);
																}}
															>
																<input
																	type="checkbox"
																	checked={formValues.emailNotifications}
																	onChange={() => {}}
																	className="peer sr-only"
																/>
																<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
																<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
															</button>
														</div>

														{/* Push Notifications */}
														<div className="flex items-center justify-between py-2 border-b">
															<div>
																<h4 className="text-sm font-medium text-gray-900">
																	Push Notifications
																</h4>
																<p className="text-xs text-gray-500">
																	Get browser notifications
																</p>
															</div>
															<button
																type="button"
																className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
																onClick={() => {
																	const newValue =
																		!formValues.pushNotifications;
																	setFormValues((prev) => ({
																		...prev,
																		pushNotifications: newValue,
																	}));
																	setValue(
																		"preferences.notifications.pushNotifications",
																		newValue
																	);
																	handlePreferenceUpdate(
																		"pushNotifications",
																		newValue
																	);
																}}
															>
																<input
																	type="checkbox"
																	checked={formValues.pushNotifications}
																	onChange={() => {}}
																	className="peer sr-only"
																/>
																<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
																<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
															</button>
														</div>

														{/* In-App Notifications */}
														<div className="flex items-center justify-between py-2 border-b">
															<div>
																<h4 className="text-sm font-medium text-gray-900">
																	In-App Notifications
																</h4>
																<p className="text-xs text-gray-500">
																	Show notifications within the app
																</p>
															</div>
															<button
																type="button"
																className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
																onClick={() => {
																	const newValue =
																		!formValues.inAppNotifications;
																	setFormValues((prev) => ({
																		...prev,
																		inAppNotifications: newValue,
																	}));
																	setValue(
																		"preferences.notifications.inAppNotifications",
																		newValue
																	);
																	handlePreferenceUpdate(
																		"inAppNotifications",
																		newValue
																	);
																}}
															>
																<input
																	type="checkbox"
																	checked={formValues.inAppNotifications}
																	onChange={() => {}}
																	className="peer sr-only"
																/>
																<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
																<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
															</button>
														</div>

														{/* SMS Notifications */}
														<div className="flex items-center justify-between py-2 border-b">
															<div>
																<h4 className="text-sm font-medium text-gray-900">
																	SMS Notifications
																</h4>
																<p className="text-xs text-gray-500">
																	Get text message alerts
																</p>
															</div>
															<button
																type="button"
																className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
																onClick={() => {
																	const newValue = !formValues.smsNotifications;
																	setFormValues((prev) => ({
																		...prev,
																		smsNotifications: newValue,
																	}));
																	setValue(
																		"preferences.notifications.smsNotifications",
																		newValue
																	);
																	handlePreferenceUpdate(
																		"smsNotifications",
																		newValue
																	);
																}}
															>
																<input
																	type="checkbox"
																	checked={formValues.smsNotifications}
																	onChange={() => {}}
																	className="peer sr-only"
																/>
																<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
																<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
															</button>
														</div>

														{/* Webhook Notifications */}
														<div className="flex items-center justify-between py-2 border-b">
															<div>
																<h4 className="text-sm font-medium text-gray-900">
																	Webhook Notifications
																</h4>
																<p className="text-xs text-gray-500">
																	Send notifications to external services
																</p>
															</div>
															<button
																type="button"
																className="relative inline-block w-12 h-6 transition duration-200 ease-in-out"
																onClick={() => {
																	const newValue =
																		!formValues.webhookNotifications;
																	setFormValues((prev) => ({
																		...prev,
																		webhookNotifications: newValue,
																	}));
																	setValue(
																		"preferences.notifications.webhookNotifications",
																		newValue
																	);
																	handlePreferenceUpdate(
																		"webhookNotifications",
																		newValue
																	);
																}}
															>
																<input
																	type="checkbox"
																	checked={formValues.webhookNotifications}
																	onChange={() => {}}
																	className="peer sr-only"
																/>
																<span className="absolute inset-0 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors duration-200 ease-in-out cursor-pointer" />
																<span className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform peer-checked:translate-x-6 transition duration-200 ease-in-out" />
															</button>
														</div>
													</div>
												</div>

												{/* Form Actions */}
												<div className="flex justify-end pt-4">
													<button
														type="button"
														onClick={() => {
															setIsSidePanelOpen(false);
															setActiveField(null);
														}}
														className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
													>
														Cancel
													</button>
													<button
														type="submit"
														disabled={isUpdating}
														className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
													>
														{isUpdating ? (
															<>
																<LoadingSpinner size="sm" />
																<span className="ml-2">Updating...</span>
															</>
														) : (
															"Update Profile"
														)}
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
