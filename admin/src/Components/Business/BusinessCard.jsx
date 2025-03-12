import React from "react";
import { Link } from "react-router-dom";
import {
	FaStore,
	FaCheckCircle,
	FaTimesCircle,
	FaClock,
	FaEnvelope,
	FaGlobe,
	FaBuilding,
	FaTag,
	FaUser,
	FaCalendar,
	FaCreditCard,
} from "react-icons/fa";

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

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const cardClass = view === "grid" ? "flex flex-col" : "flex flex-row";
	const imageClass = view === "grid" ? "h-48" : "h-32 w-32 flex-shrink-0";
	const contentClass = view === "grid" ? "p-4" : "p-4 flex-1";

	return (
		<div
			className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${cardClass} border border-gray-100`}
		>
			{/* Business Image/Logo Section */}
			<div
				className={`relative ${imageClass} bg-gradient-to-br from-indigo-500 to-purple-600`}
			>
				{business.logo ? (
					<img
						src={business.logo}
						alt={business.name}
						className="w-full h-full object-cover"
					/>
				) : business.owner?.profileImage ? (
					<div className="w-full h-full flex items-center justify-center p-4">
						<img
							src={business.owner.profileImage}
							alt={business.owner.name}
							className="w-16 h-16 rounded-full border-2 border-white shadow-md"
						/>
					</div>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<FaStore className="text-white text-4xl" />
					</div>
				)}

				{/* Status Badge */}
				<div className="absolute top-2 right-2 flex gap-2">
					{getStatusIcon()}
					<span
						className={`px-2 py-0.5 text-xs rounded-full font-medium ${
							business.status === "active"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{business.status}
					</span>
				</div>
			</div>

			{/* Content Section */}
			<div className={contentClass}>
				<div className="space-y-3">
					{/* Header */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-1">
							{business.name}
						</h3>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<FaUser className="w-3 h-3" />
							<span>{business.owner?.name || "Unknown Owner"}</span>
						</div>
					</div>

					{/* Description */}
					<p className="text-sm text-gray-600 line-clamp-2">
						{business.description}
					</p>

					{/* Tags & Categories */}
					<div className="flex flex-wrap gap-2">
						<span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
							{business.category}
						</span>
						<span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
							{business.businessModel}
						</span>
						<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
							{business.operationMode}
						</span>
					</div>

					{/* Business Info */}
					<div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
						<div className="flex items-center gap-1">
							<FaEnvelope className="w-3 h-3" />
							<span className="truncate">{business.email}</span>
						</div>
						<div className="flex items-center gap-1">
							<FaCreditCard className="w-3 h-3" />
							<span>{business.currency}</span>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between pt-3 border-t border-gray-100">
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<FaCalendar className="w-3 h-3" />
							<span>Created {formatDate(business.createdAt)}</span>
						</div>
						<Link
							to={`/businesses/${business.id}`}
							className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
						>
							View Details
							<span aria-hidden="true">→</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BusinessCard;
