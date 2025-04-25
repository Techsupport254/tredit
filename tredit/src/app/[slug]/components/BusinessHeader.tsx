"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
	BuildingStorefrontIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "antd";
import { ShareAltOutlined, StarFilled } from "@ant-design/icons";

interface BusinessHeaderProps {
	name: string;
	description: string | null;
	logoUrl: string | null;
	rating?: number;
	category?: string;
}

export default function BusinessHeader({
	name,
	description,
	logoUrl,
	rating = 4.8,
	category = "Retail Partner",
}: BusinessHeaderProps) {
	const pathname = usePathname();
	const params = useParams();
	const businessSlug = params.slug as string;
	const pathSegments = pathname.split("/").filter(Boolean);
	const currentPage = pathSegments[pathSegments.length - 1];

	// Generate breadcrumbs
	const breadcrumbs = pathSegments.map((segment, index) => {
		const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
		let label = segment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		// If this is the business slug, use the business name
		if (segment === businessSlug) {
			label = name;
		}

		return {
			href,
			label,
			isCurrent: index === pathSegments.length - 1,
		};
	});

	return (
		<div className="bg-gradient-to-br from-white via-blue-50 to-white border-b border-gray-200">
			{/* Decorative top wave */}
			<div className="h-24 w-full overflow-hidden">
				<svg
					className="w-full h-full"
					viewBox="0 0 1440 320"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill="#e0f2fe"
						fillOpacity="0.5"
						d="M0,96L60,85.3C120,75,240,53,360,74.7C480,96,600,160,720,165.3C840,171,960,117,1080,106.7C1200,96,1320,128,1380,144L1440,160V0H1380C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0H0Z"
					></path>
				</svg>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Breadcrumbs */}
				<nav className="flex items-center space-x-2 text-sm text-gray-500 py-4">
					<Link
						href={`/${businessSlug}`}
						className="hover:text-blue-600 transition-colors"
					>
						{name}
					</Link>
					{breadcrumbs.slice(1).map((crumb, index) => (
						<div key={crumb.href} className="flex items-center">
							<ChevronRightIcon className="h-4 w-4 mx-2" />
							<Link
								href={crumb.href as any}
								className={`hover:text-blue-600 transition-colors ${
									crumb.isCurrent ? "text-blue-600 font-medium" : ""
								}`}
							>
								{crumb.label}
							</Link>
						</div>
					))}
				</nav>

				{/* Business Info */}
				<div className="py-8">
					<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
						{/* Logo */}
						<div className="flex-shrink-0">
							<div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm border border-gray-100 flex items-center justify-center p-3 group hover:shadow-md transition-shadow">
								{logoUrl ? (
									<Image
										src={logoUrl}
										alt={`${name} logo`}
										fill
										className="object-contain group-hover:scale-105 transition-transform duration-300"
										priority
									/>
								) : (
									<BuildingStorefrontIcon className="h-12 w-12 text-blue-400" />
								)}
							</div>
						</div>

						{/* Business Details */}
						<div className="flex-grow">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
										{name}
									</h1>
									<div className="flex items-center flex-wrap gap-3 mt-2">
										<div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
											<StarFilled className="text-yellow-400 mr-1" />
											<span className="font-medium">{rating}</span>
										</div>
										<span className="text-gray-600">•</span>
										<span className="text-blue-600 font-medium">
											{category}
										</span>
									</div>
								</div>
								<Button
									icon={<ShareAltOutlined />}
									className="flex items-center gap-1 rounded-full"
								>
									Share
								</Button>
							</div>

							{description && (
								<p className="text-gray-600 text-base leading-relaxed max-w-3xl mt-4">
									{description}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Decorative bottom wave */}
			<div className="h-24 w-full overflow-hidden -mt-12">
				<svg
					className="w-full h-full"
					viewBox="0 0 1440 320"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill="#e0f2fe"
						fillOpacity="0.5"
						d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128V320H1380C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320H0Z"
					></path>
				</svg>
			</div>
		</div>
	);
}
