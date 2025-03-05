import { useState, useEffect } from "react";
import { sidebarData } from "../data"; // Import the data.js file as is
import { Link, useLocation } from "react-router-dom";
import { useLayoutContext } from "../Context/LayoutContext";
import { useAccount } from "../Context/AccountContext";
import { Avatar, Tag, Badge, Tooltip } from "antd";
import { UserOutlined, AppstoreOutlined } from "@ant-design/icons";

const getEthToKesRate = async () => {
	try {
		const response = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=kes"
		);
		const data = await response.json();
		return data.ethereum.kes; // Returns the current ETH to KES rate
	} catch (error) {
		console.error("Failed to fetch ETH to KES rate:", error);
		return null;
	}
};

const Sidebar = () => {
	const location = useLocation();
	const [openMenu, setOpenMenu] = useState(() => {
		const currentPath = location.pathname;
		const parentCategory = sidebarData.find((item) =>
			item.pages?.some((page) => currentPath.startsWith(page.path))
		)?.category;
		return parentCategory || null;
	});
	const { isSidebarOpen, closeSidebar, toggleSidebar } = useLayoutContext();
	const { walletAddress, profile, networkName, balance } = useAccount();
	const [ethToKesRate, setEthToKesRate] = useState(null);

	// Fetch ETH to KES exchange rate
	useEffect(() => {
		const fetchExchangeRate = async () => {
			const rate = await getEthToKesRate();
			setEthToKesRate(rate);
		};

		fetchExchangeRate();
		// Refresh rate every 5 minutes
		const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	// Store active path in localStorage when it changes
	useEffect(() => {
		if (location.pathname !== "/") {
			localStorage.setItem("lastActivePath", location.pathname);
		}
	}, [location.pathname]);

	// Persist sidebar and menu state
	useEffect(() => {
		const storedSidebarState = localStorage.getItem("isSidebarOpen");
		if (storedSidebarState === "true") {
			toggleSidebar();
		}

		// Keep parent menu open based on current path
		const currentPath = location.pathname;
		const parentCategory = sidebarData.find((item) =>
			item.pages?.some((page) => currentPath.startsWith(page.path))
		)?.category;

		if (parentCategory) {
			setOpenMenu(parentCategory);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("isSidebarOpen", isSidebarOpen);
	}, [isSidebarOpen]);

	// Close sidebar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			const sidebarElement = document.querySelector(".sidebar-container");
			const toggleButton = document.querySelector(".sidebar-toggle-button");
			if (
				isSidebarOpen &&
				sidebarElement &&
				!sidebarElement.contains(event.target) &&
				!toggleButton?.contains(event.target)
			) {
				closeSidebar();
			}
		};

		if (isSidebarOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSidebarOpen, closeSidebar]);

	// Toggle submenu with persistence
	const toggleSubmenu = (category) => {
		setOpenMenu(openMenu === category ? null : category);
		localStorage.setItem("lastOpenMenu", category);
	};

	// Close sidebar on menu item click
	const handleItemClick = () => {
		closeSidebar();
	};

	// Format balance display in KES
	const formatBalance = (balance) => {
		if (!ethToKesRate || !balance) {
			return "Loading...";
		}

		try {
			const kesBalance = parseFloat(balance) * ethToKesRate;
			return new Intl.NumberFormat("en-KE", {
				style: "currency",
				currency: "KES",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(kesBalance);
		} catch (error) {
			console.error("Error formatting balance:", error);
			return "Error";
		}
	};

	const getMissingFields = () => {
		if (!profile) return [];

		const missingFields = [];
		const requiredFields = {
			basic: [
				{ key: "phoneNumber", label: "Phone Number" },
				{ key: "gender", label: "Gender" },
				{ key: "dob", label: "Date of Birth" },
				{ key: "bio", label: "Bio" },
				{ key: "location", label: "Location" },
			],
			vendor: [
				{
					key: "socialMedias",
					label: "Social Media Links",
					validator: (value) => Array.isArray(value) && value.length > 0,
				},
			],
		};

		// Check basic required fields
		requiredFields.basic.forEach((field) => {
			const value = profile[field.key];
			if (field.validator) {
				if (!field.validator(value)) {
					missingFields.push(field.label);
				}
			} else if (!value || value === "") {
				missingFields.push(field.label);
			}
		});

		// Check vendor-specific fields if user is a vendor
		if (profile.role === "vendor") {
			requiredFields.vendor.forEach((field) => {
				const value = profile[field.key];
				if (field.validator) {
					if (!field.validator(value)) {
						missingFields.push(field.label);
					}
				} else if (!value || value === "") {
					missingFields.push(field.label);
				}
			});

			// Check store data if it exists
			if (profile.store) {
				const storeFields = [
					{ key: "name", label: "Store Name" },
					{ key: "description", label: "Store Description" },
					{ key: "category", label: "Store Category" },
					{ key: "logo", label: "Store Logo" },
				];

				storeFields.forEach((field) => {
					const value = profile.store[field.key];
					if (!value || value === "") {
						missingFields.push(field.label);
					}
				});

				// Check store settings
				if (profile.store.settings) {
					const requiredSettings = [
						{
							key: "enableYouTubeIntegration",
							label: "YouTube Integration Setting",
						},
						{ key: "enableSocialSharing", label: "Social Sharing Setting" },
						{ key: "allowComments", label: "Comments Setting" },
					];

					requiredSettings.forEach((setting) => {
						if (typeof profile.store.settings[setting.key] === "undefined") {
							missingFields.push(setting.label);
						}
					});
				} else {
					missingFields.push("Store Settings");
				}
			} else if (profile.role === "vendor") {
				missingFields.push("Store Setup");
			}
		}

		return missingFields;
	};

	const missingFields = getMissingFields();

	return (
		<div
			className={`absolute md:relative z-50 bg-gradient-to-b from-blue-50 to-white px-4 py-6 overflow-y-auto transition-transform duration-300 ease-in-out sidebar-container w-80 md:w-1/5 h-full shadow-lg flex flex-col ${
				isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
			}`}
		>
			{/* Sidebar Header */}
			<div className="flex flex-col items-center mb-6">
				<AppstoreOutlined className="text-4xl text-blue-600" />
				<h2 className="text-lg font-semibold text-blue-700 mt-2">
					Vendor Panel
				</h2>
			</div>

			{/* Navigation */}
			<div className="flex-grow">
				<ul className="space-y-2">
					{sidebarData.map((item, index) => (
						<li key={index} className="group">
							{item.pages ? (
								<div>
									<button
										onClick={() => toggleSubmenu(item.category)}
										className={`flex items-center justify-between w-full p-3 text-left rounded-lg transition-all duration-300 
											text-gray-700 hover:text-blue-800 hover:bg-blue-100`}
									>
										<div className="flex items-center space-x-3">
											<i
												className={`${item.icon} w-5 h-5 flex-shrink-0 text-blue-400`}
											></i>
											<span className="whitespace-nowrap">{item.category}</span>
										</div>
										<div className="flex items-center gap-2">
											{/* Show badge on Settings category ONLY when collapsed */}
											{item.category === "Settings" &&
												openMenu !== item.category &&
												missingFields.length > 0 && (
													<Badge
														count={missingFields.length}
														style={{ backgroundColor: "#ff4d4f" }}
													/>
												)}
											<i
												className={`fas fa-chevron-down transform transition-transform duration-300 ${
													openMenu === item.category ? "rotate-180" : "rotate-0"
												}`}
											></i>
										</div>
									</button>

									{/* Display submenu items when open */}
									<ul
										className={`ml-5 mt-2 space-y-2 transition-all duration-300 ease-in-out ${
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
													className={`flex items-center justify-between p-2 text-sm rounded-lg transition-all duration-300 hover:bg-blue-100 hover:text-blue-800 ${
														location.pathname === subItem.path ||
														(subItem.path !== "/products" &&
															location.pathname.startsWith(subItem.path))
															? "!bg-blue-100 !text-blue-800"
															: "text-gray-600"
													}`}
												>
													<div className="flex items-center space-x-3">
														<i
															className={`${
																subItem.icon
															} w-4 h-4 flex-shrink-0 ${
																location.pathname === subItem.path ||
																(subItem.path !== "/products" &&
																	location.pathname.startsWith(subItem.path))
																	? "!text-blue-800"
																	: "text-blue-400"
															}`}
														></i>
														<span className="whitespace-nowrap">
															{subItem.name}
														</span>
													</div>
													{/* Show badge on Profile item when expanded */}
													{subItem.showBadge && missingFields.length > 0 && (
														<Tooltip
															title={
																<div className="text-xs">
																	<div className="font-semibold mb-1">
																		Missing Profile Data:
																	</div>
																	{missingFields.map((field, index) => (
																		<div key={index} className="text-red-500">
																			• {field}
																		</div>
																	))}
																</div>
															}
															placement="right"
														>
															<Badge
																count={missingFields.length}
																style={{ backgroundColor: "#ff4d4f" }}
															/>
														</Tooltip>
													)}
												</Link>
											</li>
										))}
									</ul>
								</div>
							) : (
								<Link
									to={item.path}
									onClick={handleItemClick}
									className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-blue-100 hover:text-blue-800 ${
										location.pathname === item.path
											? "!bg-blue-100 !text-blue-800"
											: "text-gray-700"
									}`}
								>
									<i
										className={`${item.icon} w-5 h-5 flex-shrink-0 ${
											location.pathname === item.path
												? "!text-blue-800"
												: "text-blue-400"
										}`}
									></i>
									<span className="whitespace-nowrap">{item.category}</span>
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>

			{/* User Info Section */}
			<div className="mt-auto border-t border-gray-300 pt-4">
				<div className="flex items-center gap-3 p-3">
					<Avatar
						size={48}
						src={profile?.profileImage || profile?.photoURL}
						icon={<UserOutlined />}
						className="border border-gray-400"
					/>
					<div className="flex flex-col">
						<span className="font-semibold text-gray-800 text-sm">
							{profile?.name || "User"}
						</span>
						<div className="flex items-center gap-1">
							<span className="text-xs text-gray-500">
								{walletAddress
									? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
									: "No Wallet"}
							</span>
							{networkName && (
								<Tag color="blue" className="text-xs">
									{networkName}
								</Tag>
							)}
						</div>
						<span className="text-sm font-medium text-gray-700">
							{formatBalance(balance)}
						</span>
					</div>
				</div>

				{/* Footer Links */}
				<div className="text-center text-xs text-gray-500 mt-4">
					<Link to="/privacy-policy" className="hover:underline text-blue-500">
						Privacy Policy
					</Link>
					{" | "}
					<Link
						to="/terms-of-service"
						className="hover:underline text-blue-500"
					>
						Terms of Service
					</Link>
				</div>

				{/* Copyright */}
				<p className="text-center text-xs text-gray-400 mt-4">
					&copy; {new Date().getFullYear()} Vendor Panel
				</p>
			</div>
		</div>
	);
};

export default Sidebar;
