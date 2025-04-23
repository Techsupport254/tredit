"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/outline";

const AvatarRoot = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex shrink-0 overflow-hidden rounded-full",
			className
		)}
		{...props}
	/>
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

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
	className?: string;
}

const sizeClasses = {
	sm: "w-8 h-8",
	md: "w-10 h-10",
	lg: "w-12 h-12",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
	({ src, alt = "Avatar", fallback, size = "md", className }, ref) => {
		return (
			<AvatarRoot className={cn(sizeClasses[size], className)} ref={ref}>
				{src ? (
					<AvatarImage src={src} alt={alt} />
				) : (
					<AvatarFallback>
						{fallback ? (
							<span className="text-sm font-medium text-gray-600">
								{fallback}
							</span>
						) : (
							<UserIcon className="h-4 w-4 text-gray-500" />
						)}
					</AvatarFallback>
				)}
			</AvatarRoot>
		);
	}
);

Avatar.displayName = "Avatar";

export { Avatar, AvatarImage, AvatarFallback };
