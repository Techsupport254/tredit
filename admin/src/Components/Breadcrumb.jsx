import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutContext } from "../Context/LayoutContext";
import { sidebarData } from "../data";
import { Breadcrumb } from "antd";

const Breadcrumbs = () => {
	const { toggleSidebar } = useContext(LayoutContext);
	const location = useLocation();
	const currentPath = location.pathname;

	// 🔹 Function to generate breadcrumb trail dynamically
	const getBreadcrumbTrail = (path) => {
		// If we're on the dashboard, just return dashboard
		if (path === "/dashboard") {
			return [
				{
					name: "Dashboard",
					path: "/dashboard",
					icon: "fas fa-tachometer-alt",
				},
			];
		}

		// Always start with Dashboard
		let trail = [
			{
				name: "Dashboard",
				path: "/dashboard",
				icon: "fas fa-tachometer-alt",
			},
		];

		for (let category of sidebarData) {
			// If the category itself matches
			if (category.path === path) {
				trail.push({
					name: category.category,
					path: category.path,
					icon: category.icon,
				});
				return trail;
			}

			// If the category has subpages
			if (category.pages) {
				for (let page of category.pages) {
					if (page.path === path) {
						trail.push(
							{
								name: category.category,
								path: "#",
								icon: category.icon,
							}, // Parent Category (not clickable)
							{
								name: page.name,
								path: page.path,
								icon: page.icon,
							} // Active Page
						);
						return trail;
					}
				}
			}
		}
		return trail;
	};

	const breadcrumbItems = getBreadcrumbTrail(currentPath);

	const breadcrumbItemsForBreadcrumb = breadcrumbItems.map((item, index) => ({
		title: (
			<div className="flex items-center gap-2">
				<i
					className={`${item.icon} text-sm ${
						item.path !== "#" ? "text-blue-500" : "text-gray-500"
					}`}
				/>
				{item.path !== "#" ? (
					<Link to={item.path} className="text-blue-500 hover:underline">
						{item.name}
					</Link>
				) : (
					<span className="text-gray-500">{item.name}</span>
				)}
			</div>
		),
		key: index,
	}));

	return (
		<div className="bg-gradient-to-b from-blue-50 to-white rounded-sm flex items-center justify-between h-14 py-4 px-4 shadow-md sticky top-0 z-40">
			{/* 🔹 Breadcrumb Navigation */}
			<Breadcrumb items={breadcrumbItemsForBreadcrumb} />

			{/* 🔹 Mobile Sidebar Toggle */}
			<button
				className="sidebar-toggle-button md:hidden z-50 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition-all duration-200"
				onClick={toggleSidebar}
				aria-label="Toggle Sidebar"
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
