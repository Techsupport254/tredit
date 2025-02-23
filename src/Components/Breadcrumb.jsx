import { useContext } from "react";
import { LayoutContext } from "../Context/LayoutContext";

const Breadcrumbs = () => {
	const { toggleSidebar } = useContext(LayoutContext);

	return (
		<div className="bg-gray-100 rounded-sm flex items-center justify-between h-14 px-4 shadow-sm p-2">
			{/* Breadcrumb Title */}
			<div className="text-gray-700 text-sm font-medium">Dashboard</div>

			{/* Mobile Sidebar Toggle - Far right, hidden on large screens */}
			<button
				className="md:hidden z-50 p-1 bg-white shadow-md rounded-full"
				onClick={toggleSidebar}
			>
				<svg
					className="w-6 h-6 text-gray-700"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M4 6h16M4 12h16m-7 6h7"
					></path>
				</svg>
			</button>
		</div>
	);
};

export default Breadcrumbs;
