import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutContext } from "../Context/LayoutContext";
import { sidebarData } from "../data";
import { Breadcrumb, ConfigProvider } from "antd";
import { FaChevronRight } from "react-icons/fa";

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

		// Split the path into segments
		const segments = path.split("/").filter(Boolean);
		const baseSegment = segments[0];
		const isDetailPage = segments.length === 2 && !isNaN(segments[1]);
		const isEditPage = segments.length === 3 && segments[2] === "edit";

		// Find the matching category and page from sidebar data
		for (let category of sidebarData) {
			if (category.pages) {
				// Find the base page that matches our route
				const matchingPage = category.pages.find((page) => {
					const pagePath = page.path.slice(1); // Remove leading slash
					return pagePath === baseSegment;
				});

				if (matchingPage) {
					// Add the category
					trail.push({
						name: category.category,
						path: "#",
						icon: category.icon,
					});

					// Add the base page
					trail.push({
						name: matchingPage.name,
						path: matchingPage.path,
						icon: matchingPage.icon,
					});

					// Handle sub-routes
					if (isDetailPage) {
						trail.push({
							name: "Business Details",
							path: `/${baseSegment}/${segments[1]}`,
							icon: "fas fa-building",
						});
					} else if (isEditPage) {
						trail.push({
							name: "Business Details",
							path: `/${baseSegment}/${segments[1]}`,
							icon: "fas fa-building",
						});
						trail.push({
							name: "Edit Business",
							path: path,
							icon: "fas fa-edit",
						});
					} else if (path.endsWith("/create")) {
						// Replace the last item for create route
						trail.pop(); // Remove the base page
						trail.push({
							name: "Create New",
							path: path,
							icon: "fas fa-plus-circle",
						});
					}
					break;
				}
			}
		}

		return trail;
	};

	const breadcrumbItems = getBreadcrumbTrail(currentPath);

	const breadcrumbItemsForBreadcrumb = breadcrumbItems.map((item, index) => ({
		title: (
			<div className="flex items-center h-full whitespace-nowrap">
				<i
					className={`${item.icon} text-sm flex-shrink-0 ${
						item.path !== "#" ? "text-blue-500" : "text-gray-500"
					}`}
				/>
				<span className="ml-2 whitespace-nowrap">
					{item.path !== "#" ? (
						<Link to={item.path} className="text-blue-500 hover:underline">
							{item.name}
						</Link>
					) : (
						<span className="text-gray-500">{item.name}</span>
					)}
				</span>
			</div>
		),
		key: index,
	}));

	return (
		<div className="bg-gradient-to-b from-blue-50 to-white rounded-sm flex items-center justify-between h-14 py-4 px-4 shadow-md sticky top-0 z-40">
			{/* 🔹 Breadcrumb Navigation */}
			<div className="flex-1 min-w-0 flex items-center">
				<div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
					<ConfigProvider
						theme={{
							components: {
								Breadcrumb: {
									separatorMargin: "0 8px",
									itemLinkColor: "#3B82F6",
								},
							},
						}}
					>
						<Breadcrumb
							className="!flex items-center flex-nowrap w-max"
							items={breadcrumbItemsForBreadcrumb}
							separator={
								<span className="flex items-center h-full text-gray-400 flex-shrink-0">
									<FaChevronRight size={12} />
								</span>
							}
						/>
					</ConfigProvider>
				</div>
			</div>

			{/* 🔹 Mobile Sidebar Toggle */}
			<button
				className="sidebar-toggle-button md:hidden z-50 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition-all duration-200 ml-4 flex-shrink-0"
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
