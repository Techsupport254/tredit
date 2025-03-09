import React from "react";
import { Link } from "react-router-dom";
import { FaStore, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const BusinessCard = ({ business, view = "grid" }) => {
	const getStatusIcon = () => {
		switch (business.verificationStatus) {
			case "verified":
				return <FaCheckCircle className="text-green-500" title="Verified" />;
			case "rejected":
				return <FaTimesCircle className="text-red-500" title="Rejected" />;
			default:
				return <FaClock className="text-yellow-500" title="Pending" />;
		}
	};

	// Conditional styling based on view mode
	const cardClass = view === "grid" ? "flex flex-col" : "flex flex-row";
	const imageClass = view === "grid" ? "h-48" : "h-32 w-48 flex-shrink-0";
	const contentClass = view === "grid" ? "p-4" : "p-4 flex-1";

	return (
		<div
			className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${cardClass}`}
		>
			{/* Business Image or Logo */}
			<div className={`relative ${imageClass}`}>
				<div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
					{business.logo ? (
						<img
							src={business.logo}
							alt={business.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<FaStore className="text-white text-5xl" />
					)}
				</div>

				{/* Verification Status Badge */}
				<div className="absolute top-4 right-4 text-xl">{getStatusIcon()}</div>
			</div>

			{/* Business Details */}
			<div className={contentClass}>
				<div className="flex items-start justify-between">
					<h3 className="text-lg font-semibold text-gray-800 truncate">
						{business.name}
					</h3>
					<span
						className={`px-2 py-1 text-xs rounded-full ${
							business.status === "active"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{business.status}
					</span>
				</div>

				{/* Description */}
				<p className="text-sm text-gray-600 mt-2 line-clamp-2">
					{business.description}
				</p>

				{/* Tags */}
				<div className="mt-3 flex flex-wrap gap-2">
					<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
						{business.type}
					</span>
					<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
						{business.businessModel}
					</span>
				</div>

				{/* Footer */}
				<div className="mt-4 flex items-center justify-between">
					<Link
						to={`/businesses/${business.id}`}
						className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
					>
						View Details
						<span className="text-xs">→</span>
					</Link>
					<span className="text-xs text-gray-500">ID: {business.id}</span>
				</div>
			</div>
		</div>
	);
};

export default BusinessCard;
