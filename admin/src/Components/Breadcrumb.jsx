import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutContext } from "../Context/LayoutContext";
import { sidebarData } from "../data";
import { Breadcrumb } from "antd";
import { HomeOutlined, MenuOutlined } from "@ant-design/icons";

const Breadcrumbs = () => {
	const { toggleSidebar } = useContext(LayoutContext);
	const location = useLocation();
	const currentPath = location.pathname;

	// 🔹 Function to generate breadcrumb trail dynamically
	const getBreadcrumbTrail = (path) => {
		for (let category of sidebarData) {
			// If the category itself matches
			if (category.path === path) {
				return [{ name: category.category, path: category.path }];
			}

			// If the category has subpages
			if (category.pages) {
				for (let page of category.pages) {
					if (page.path === path) {
						return [
							{ name: category.category, path: "#" }, // Parent Category (not clickable)
							{ name: page.name, path: page.path }, // Active Page
						];
					}
				}
			}
		}
		return [];
	};

	const breadcrumbItems = getBreadcrumbTrail(currentPath);

	return (
		<div className="bg-gradient-to-b from-blue-50 to-white rounded-sm flex items-center justify-between h-14 py-4 px-2 shadow-md sticky top-0 z-40">
			{/* 🔹 Breadcrumb Navigation */}
			<Breadcrumb>
				<Breadcrumb.Item>
					<Link
						to="/"
						className="text-blue-500 hover:underline flex items-center"
					>
						<HomeOutlined className="mr-1" /> Home
					</Link>
				</Breadcrumb.Item>
				{breadcrumbItems.map((item, index) => (
					<Breadcrumb.Item key={index}>
						{item.path !== "#" ? (
							<Link to={item.path} className="text-blue-500 hover:underline">
								{item.name}
							</Link>
						) : (
							<span className="text-gray-500">{item.name}</span> // Non-clickable parent category
						)}
					</Breadcrumb.Item>
				))}
			</Breadcrumb>

			{/* 🔹 Mobile Sidebar Toggle */}
			<button
				className="md:hidden z-50 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition-all duration-200"
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
				</svg>{" "}
			</button>
		</div>
	);
};

export default Breadcrumbs;
