import { useState, useEffect } from "react";
import { sidebarData } from "../data";
import { Link, useLocation } from "react-router-dom";
import { useLayoutContext } from "../Context/LayoutContext";
import { useAccount } from "../Context/AccountContext"; // Import user context
import { Avatar, Tag } from "antd";
import { UserOutlined, AppstoreOutlined } from "@ant-design/icons";

const Sidebar = () => {
	const location = useLocation();
	const [openMenu, setOpenMenu] = useState(null);
	const { isSidebarOpen, closeSidebar, toggleSidebar } = useLayoutContext();
	const { userAddress, profile, networkName, balance, setLocalBalance } =
		useAccount();
	const [currency, setCurrency] = useState("USD");

	// Persist sidebar state
	useEffect(() => {
		const storedSidebarState = localStorage.getItem("isSidebarOpen");
		if (storedSidebarState === "true") {
			toggleSidebar();
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("isSidebarOpen", isSidebarOpen);
	}, [isSidebarOpen]);

	// Close sidebar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isSidebarOpen && !event.target.closest(".sidebar-container")) {
				closeSidebar();
			}
		};

		if (isSidebarOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSidebarOpen, closeSidebar]);

	// Toggle submenu and display navigation items correctly
	const toggleSubmenu = (category) => {
		setOpenMenu(openMenu === category ? null : category);
	};

	// Close sidebar on menu item click
	const handleItemClick = () => {
		closeSidebar();
	};

	// Get current year for footer
	const getCurrentYear = () => new Date().getFullYear();

	// Format balance display in USD
	const getBalance = (balance) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(balance);
	};

	return (
		<div
			className={`absolute md:relative z-40 bg-gray-900 text-white px-4 py-6 overflow-y-auto transition-transform duration-300 ease-in-out sidebar-container w-80 md:w-1/5 h-full shadow-lg flex flex-col justify-between ${
				isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
			}`}
		>
			{/* Sidebar Header */}
			<div className="flex flex-col items-center mb-6">
				<AppstoreOutlined className="text-4xl text-blue-400 mb-2" />
				<h2 className="text-lg font-semibold">Vendor Panel</h2>
			</div>

			{/* Navigation */}
			<div>
				<ul className="space-y-2">
					{sidebarData.map((item, index) => (
						<li key={index} className="group">
							{item.pages ? (
								<div>
									<button
										onClick={() => toggleSubmenu(item.category)}
										className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-800 rounded-lg transition-all duration-300"
									>
										<div className="flex items-center space-x-3">
											<i className={`${item.icon} w-5 h-5 flex-shrink-0`}></i>
											<span className="whitespace-nowrap">{item.category}</span>
										</div>
										<i
											className={`fas fa-chevron-down transform transition-transform duration-300 ${
												openMenu === item.category ? "rotate-180" : "rotate-0"
											}`}
										></i>
									</button>

									{/* Display submenu items when open */}
									<ul
										className={`ml-5 mt-2 space-y-2 transition-max-height duration-300 ease-in-out ${
											openMenu === item.category
												? "max-h-96 opacity-100"
												: "max-h-0 opacity-0 hidden"
										}`}
									>
										{item.pages.map((subItem, subIndex) => (
											<li key={subIndex}>
												<Link
													to={subItem.path}
													onClick={handleItemClick}
													className={`flex items-center space-x-3 p-2 text-sm rounded-lg transition-all duration-300 hover:bg-gray-700 ${
														location.pathname === subItem.path
															? "bg-gray-700"
															: ""
													}`}
												>
													<i
														className={`${subItem.icon} w-4 h-4 flex-shrink-0`}
													></i>
													<span className="whitespace-nowrap">
														{subItem.name}
													</span>
												</Link>
											</li>
										))}
									</ul>
								</div>
							) : (
								<Link
									to={item.path}
									onClick={handleItemClick}
									className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800"
								>
									<i className={`${item.icon} w-5 h-5 flex-shrink-0`}></i>
									<span className="whitespace-nowrap">{item.category}</span>
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>

			{/* User Info Section */}
			<div className="border-t border-gray-800 pt-4">
				<div className="flex items-center gap-3 p-3">
					<Avatar
						size={48}
						src={profile?.profilePicture || null}
						icon={<UserOutlined />}
						className="border border-gray-500"
					/>
					<div className="flex flex-col">
						<span className="font-semibold text-sm">
							{profile?.name || "User"}
						</span>
						<span className="text-xs text-gray-400 break-all">
							{userAddress
								? userAddress.slice(0, 6) + "..." + userAddress.slice(-4)
								: "No Wallet"}{" "}
							<Tag color="blue">{networkName}</Tag>
						</span>
						<span>{balance ? getBalance(balance) : "Loading..."}</span>
					</div>
				</div>

				{/* Policies Section */}
				<div className="text-center text-xs text-gray-400 mt-4">
					<Link to="/privacy-policy" className="hover:underline">
						Privacy Policy
					</Link>{" "}
					|{" "}
					<Link to="/terms-of-service" className="hover:underline">
						Terms of Service
					</Link>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-gray-500 mt-4">
					&copy; {getCurrentYear()} Vendor Panel
				</p>
			</div>
		</div>
	);
};

export default Sidebar;
