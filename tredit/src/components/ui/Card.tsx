import React from "react";

interface CardProps {
	title: string;
	description: string;
	children?: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<h3 className="text-lg font-medium text-gray-900">{title}</h3>
			<p className="mt-2 text-sm text-gray-500">{description}</p>
			{children && <div className="mt-4">{children}</div>}
		</div>
	);
}
