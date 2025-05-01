import { ReactNode } from "react";

interface SummaryCardProps {
	title: string;
	value: string | number;
	icon: ReactNode;
	iconBg: string;
	iconColor: string;
	isCurrency?: boolean;
}

function formatKES(value: number | string) {
	if (typeof value === "string") value = parseFloat(value);
	return `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function SummaryCard({
	title,
	value,
	icon,
	iconBg,
	iconColor,
	isCurrency = false,
}: SummaryCardProps) {
	const displayValue = isCurrency
		? formatKES(value)
		: typeof value === "number" && value >= 1000
		? `${value.toLocaleString()}+`
		: value.toLocaleString();
	return (
		<div
			className="flex flex-row items-center"
			style={{
				background: "#f6f6fd",
				borderRadius: 18,
				boxShadow: "0 2px 8px 0 rgba(17, 38, 146, 0.03)",
				padding: "20px 24px",
				minWidth: 220,
				maxWidth: 320,
			}}
		>
			<div
				className="flex items-center justify-center"
				style={{
					width: 48,
					height: 48,
					borderRadius: 12,
					background: iconBg,
					marginRight: 18,
				}}
			>
				<span style={{ color: iconColor, fontSize: 24 }}>{icon}</span>
			</div>
			<div className="flex flex-col justify-center">
				{isCurrency ? (
					<div
						className="font-bold text-black"
						style={{ fontSize: 20, lineHeight: 1.2 }}
					>
						<span style={{ marginRight: 4 }}>KES</span>
						{parseFloat(value.toString()).toLocaleString("en-KE", {
							maximumFractionDigits: 0,
						})}
					</div>
				) : (
					<div
						className="font-bold text-black"
						style={{ fontSize: 20, lineHeight: 1.2 }}
					>
						{displayValue}
					</div>
				)}
				<div
					className="text-[#23272E]"
					style={{ fontSize: 15, marginTop: 2, lineHeight: 1.2 }}
				>
					{title}
				</div>
			</div>
		</div>
	);
}
