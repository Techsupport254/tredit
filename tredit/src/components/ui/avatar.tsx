"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/outline";

const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
			className
		)}
		{...props}
	/>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn("aspect-square h-full w-full", className)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800",
			className
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface AvatarProps {
	src?: string | null;
	alt?: string;
	fallback?: string;
	size?: "sm" | "md" | "lg";
}

const sizeClasses = {
	sm: "w-8 h-8",
	md: "w-10 h-10",
	lg: "w-12 h-12",
};

export function Avatar({
	src,
	alt = "Avatar",
	fallback,
	size = "md",
}: AvatarProps) {
	const sizeClass = sizeClasses[size];
	const initial = fallback?.[0]?.toUpperCase() || "U";

	return (
		<div
			className={`${sizeClass} relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all`}
		>
			{src ? (
				<Image src={src} alt={alt} fill className="object-cover" />
			) : (
				<div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600">
					{initial}
				</div>
			)}
		</div>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
