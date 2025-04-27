import { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen h-screen bg-gray-50 flex flex-col">
			{children}
		</div>
	);
}
