import { useState, useEffect } from "react";
import { sidebarData } from "../data"; // Import the data.js file as is
import { Link, useLocation } from "react-router-dom";
import { useLayoutContext } from "../Context/LayoutContext";
import { useAccount } from "../Context/AccountContext";
import { useAuth } from "../Context/AuthContext";
import { Avatar, Tag, Badge, Tooltip, Skeleton } from "antd";
import {
	UserOutlined,
	AppstoreOutlined,
	LoadingOutlined,
	CheckCircleFilled,
	ExclamationCircleFilled,
} from "@ant-design/icons";

const getEthToKesRate = async () => {
	try {
		const response = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=kes",
			{
				mode: "cors",
				headers: {
					Accept: "application/json",
				},
			}
		);

		if (!response.ok) {
			if (response.status === 429) {
				console.warn("Rate limit hit for CoinGecko API");
				return null;
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data.ethereum.kes;
	} catch (error) {
		console.error("Failed to fetch ETH to KES rate:", error);
		return null;
	}
};

const Sidebar = () => {
	const location = useLocation();
	const { user: authUser, isLoading: authLoading } = useAuth();
	const {
		walletAddress,
		networkName,
		balance,
		user: accountUser,
		connectionState,
	} = useAccount();
	const { isSidebarOpen, closeSidebar, toggleSidebar } = useLayoutContext();
	const [ethToKesRate, setEthToKesRate] = useState(null);
	const [isRateLoading, setIsRateLoading] = useState(false);

	// Track the currently open menu
	const [openMenu, setOpenMenu] = useState(null);

	// Combine user data from both contexts
	const user = authUser || accountUser;

	// Find active category based on current path
	const findActiveCategory = (path) => {
		return sidebarData.find(
			(item) =>
				item.pages?.some(
					(page) =>
						path === page.path ||
						(page.path !== "/" && path.startsWith(page.path))
				)?.category
		);
	};

	// Set initial open menu based on current path
	useEffect(() => {
		const activeCategory = findActiveCategory(location.pathname);
		if (activeCategory) {
			setOpenMenu(activeCategory);
		}
	}, [location.pathname]);

	// Fetch ETH to KES exchange rate
	useEffect(() => {
		const fetchExchangeRate = async () => {
			setIsRateLoading(true);
			try {
				const rate = await getEthToKesRate();
				setEthToKesRate(rate);
			} catch (error) {
				console.error("Error fetching rate:", error);
			} finally {
				setIsRateLoading(false);
			}
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
		const currentMenu = sidebarData.find((item) =>
			item.pages?.some((page) => page.path === currentPath)
		);

		if (currentMenu) {
			setOpenMenu(currentMenu.category);
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

	// Updated toggleSubmenu to handle active state correctly
	const toggleSubmenu = (category) => {
		if (openMenu === category) {
			// Close the menu if it's already open
			setOpenMenu(null);
		} else {
			// Open the clicked menu and close others
			setOpenMenu(category);
		}
	};

	// Close sidebar on mobile when an item is clicked
	const handleItemClick = (isDropdownToggle = false) => {
		if (window.innerWidth <= 768 && !isDropdownToggle) {
			closeSidebar();
		}
	};

	// Format balance display in KES
	const formatBalance = (balance) => {
		if (isRateLoading) {
			return <LoadingOutlined className="text-blue-500" />;
		}

		if (!ethToKesRate || !balance) {
			return "N/A";
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
		if (!user) return [];

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
			const value = user[field.key];
			if (field.validator) {
				if (!field.validator(value)) {
					missingFields.push(field.label);
				}
			} else if (!value || value === "") {
				missingFields.push(field.label);
			}
		});

		// Check vendor-specific fields if user is a vendor
		if (user.role === "vendor") {
			requiredFields.vendor.forEach((field) => {
				const value = user[field.key];
				if (field.validator) {
					if (!field.validator(value)) {
						missingFields.push(field.label);
					}
				} else if (!value || value === "") {
					missingFields.push(field.label);
				}
			});

			// Check store data if it exists
			if (user.store) {
				const storeFields = [
					{ key: "name", label: "Store Name" },
					{ key: "description", label: "Store Description" },
					{ key: "category", label: "Store Category" },
					{ key: "logo", label: "Store Logo" },
				];

				storeFields.forEach((field) => {
					const value = user.store[field.key];
					if (!value || value === "") {
						missingFields.push(field.label);
					}
				});

				// Check store settings
				if (user.store.settings) {
					const requiredSettings = [
						{
							key: "enableYouTubeIntegration",
							label: "YouTube Integration Setting",
						},
						{ key: "enableSocialSharing", label: "Social Sharing Setting" },
						{ key: "allowComments", label: "Comments Setting" },
					];

					requiredSettings.forEach((setting) => {
						if (typeof user.store.settings[setting.key] === "undefined") {
							missingFields.push(setting.label);
						}
					});
				} else {
					missingFields.push("Store Settings");
				}
			} else if (user.role === "vendor") {
				missingFields.push("Store Setup");
			}
		}

		return missingFields;
	};

	const missingFields = getMissingFields();

	const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
	const [isWalletOpen, setIsWalletOpen] = useState(false);

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
					{sidebarData.map((item) => (
						<li key={item.category} className="group">
							{item.pages ? (
								<div>
									<button
										onClick={() => toggleSubmenu(item.category)}
										className={`flex items-center justify-between w-full p-3 text-left rounded-lg transition-all duration-300 
        ${
					openMenu === item.category
						? "text-blue-800"
						: "text-gray-700 hover:text-blue-800"
				}`}
									>
										<div className="flex items-center space-x-3">
											<i
												className={`${
													item.icon
												} w-5 h-5 flex items-center justify-center aspect-square ${
													openMenu === item.category
														? "text-blue-800"
														: "text-blue-400"
												}`}
											></i>
											<span className="whitespace-nowrap">{item.category}</span>
										</div>
										<i
											className={`fas fa-chevron-down w-5 h-5 flex items-center justify-center aspect-square transform transition-transform duration-300 ${
												openMenu === item.category ? "rotate-180" : "rotate-0"
											}`}
										></i>
									</button>

									<ul
										className={`ml-5 mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
											openMenu === item.category
												? "max-h-[1000px] opacity-100 visible"
												: "max-h-0 opacity-0 invisible"
										}`}
										style={{
											transitionProperty: "max-height, opacity, visibility",
											transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
										}}
									>
										{item.pages.map((page) => (
											<li key={page.path}>
												<Link
													to={page.path}
													onClick={() => handleItemClick(false)}
													className={`flex items-center justify-between p-2 text-sm rounded-lg transition-all duration-300 hover:bg-blue-100 hover:text-blue-800 ${
														location.pathname === page.path ||
														(page.path !== "/" &&
															!page.exact &&
															location.pathname.startsWith(page.path))
															? "!bg-blue-100 !text-blue-800"
															: "text-gray-600"
													}`}
												>
													<div className="flex items-center space-x-3">
														<i
															className={`${page.icon} w-4 h-4 flex-shrink-0 ${
																location.pathname === page.path ||
																(page.path !== "/" &&
																	!page.exact &&
																	location.pathname.startsWith(page.path))
																	? "!text-blue-800"
																	: "text-blue-400"
															}`}
														></i>
														<span className="whitespace-nowrap">
															{page.name}
														</span>
													</div>
													{page.badge && page.badge.content > 0 && (
														<Badge
															count={page.badge.content}
															style={{
																backgroundColor:
																	page.badge.color === "warning"
																		? "#faad14"
																		: page.badge.color === "error"
																		? "#ff4d4f"
																		: "#1890ff",
															}}
														/>
													)}
												</Link>
											</li>
										))}
									</ul>
								</div>
							) : (
								<Link
									to={item.path}
									onClick={() => handleItemClick(false)}
									className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:bg-blue-100 hover:text-blue-800 ${
										location.pathname === item.path
											? "!bg-blue-100 !text-blue-800"
											: "text-gray-700"
									}`}
								>
									<div className="flex items-center h-full w-full space-x-3 ">
										<i
											className={`${
												item.icon
											} flex items-center justify-center aspect-square w-5 h-5 ${
												location.pathname === item.path
													? "!text-blue-800"
													: "text-blue-400"
											}`}
										></i>

										<span className="whitespace-nowrap">{item.category}</span>
									</div>
									{item.showBadge && missingFields.length > 0 && (
										<Tooltip
											title={
												<div className="text-xs">
													<div className="font-semibold mb-1">
														Missing Profile Data:
													</div>
													<div className="max-h-48 overflow-y-auto">
														{missingFields.map((field, index) => (
															<div key={index} className="text-red-500">
																• {field}
															</div>
														))}
													</div>
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
							)}
						</li>
					))}
				</ul>
			</div>

			{/* User Info Section */}
			<div className="mt-auto border-t border-gray-200 pt-4 bg-white">
				{user ? (
					<div className="px-4 py-3">
						{/* Main User Info - Always Visible */}
						<div className="bg-white rounded-xl p-3">
							<div className="flex items-center gap-3">
								<Avatar
									size={40}
									src={user.photoURL || user.profileImage}
									icon={<UserOutlined />}
									className="flex-shrink-0 bg-blue-100"
									crossOrigin="anonymous"
									referrerPolicy="no-referrer"
								/>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<h3 className="text-sm font-medium text-gray-900 truncate">
											{user.name || "User"}
										</h3>
										<Tag className="text-[10px] px-1.5 py-0 uppercase border-0 bg-gray-100 text-gray-600">
											{user.role || "USER"}
										</Tag>
									</div>
									<p className="text-xs text-gray-500 truncate">{user.email}</p>
								</div>
							</div>
						</div>

						{/* Collapsible Details Section */}
						<div className="mt-3">
							<button
								onClick={() => setIsAccountDetailsOpen(!isAccountDetailsOpen)}
								className="flex items-center justify-between w-full p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
							>
								<span className="font-medium">Account Details</span>
								<i
									className={`fas fa-chevron-${
										isAccountDetailsOpen ? "up" : "down"
									} text-gray-400`}
								></i>
							</button>
							<div
								className={`overflow-hidden transition-all duration-300 ${
									isAccountDetailsOpen
										? "max-h-[500px] opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className="space-y-3 pt-2">
									{/* Verification Status */}
									{!user.isVerified && (
										<div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs">
											<ExclamationCircleFilled className="text-xs" />
											<span>Unverified Account</span>
										</div>
									)}

									{/* Wallet Section */}
									{walletAddress && (
										<div className="bg-gray-50 rounded-lg p-3">
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<i className="fas fa-wallet text-blue-500"></i>
													<span className="text-sm">Wallet</span>
												</div>
												<div className="flex items-center gap-1.5">
													<div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
													<span className="text-xs text-emerald-600">
														Connected
													</span>
												</div>
											</div>

											<div className="space-y-3">
												{/* Wallet Address */}
												<div className="flex items-center justify-between">
													<span className="text-sm font-mono text-gray-600">
														{`${walletAddress.slice(
															0,
															6
														)}...${walletAddress.slice(-4)}`}
													</span>
													<i
														className="fas fa-copy text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
														onClick={() =>
															navigator.clipboard.writeText(walletAddress)
														}
													></i>
												</div>

												{/* Network & Balance */}
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-sm text-gray-600">
															Network
														</span>
														<Tag className="m-0 border-0 bg-blue-50 text-blue-600">
															{networkName === "Polygon Amoy Testnet"
																? "Amoy"
																: networkName}
														</Tag>
													</div>

													{balance && (
														<div>
															<div className="flex items-center justify-between">
																<span className="text-sm text-gray-600">
																	Balance
																</span>
																<span className="text-sm font-medium">
																	{parseFloat(balance).toFixed(4)} ETH
																</span>
															</div>
															<div className="flex justify-end">
																<span className="text-xs text-gray-500">
																	≈ {formatBalance(balance)}
																</span>
															</div>
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Missing Fields Warning */}
									{missingFields.length > 0 && (
										<div className="bg-red-50 rounded-lg p-3">
											<div className="text-xs font-medium text-red-600 mb-2">
												Missing Profile Data:
											</div>
											<div className="space-y-1 max-h-32 overflow-y-auto">
												{missingFields.map((field, index) => (
													<div
														key={index}
														className="text-xs text-red-500 flex items-center gap-1"
													>
														<span>•</span> {field}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="p-4">
						<div className="animate-pulse space-y-3">
							<div className="bg-white rounded-xl p-3">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
										<UserOutlined className="text-gray-300" />
									</div>
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-gray-100 rounded w-3/4"></div>
										<div className="h-3 bg-gray-100 rounded w-1/2"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="px-4 py-3 border-t border-gray-100">
					<div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-2">
						<Link to="/privacy-policy" className="hover:text-gray-600">
							Privacy Policy
						</Link>
						<span>•</span>
						<Link to="/terms-of-service" className="hover:text-gray-600">
							Terms of Service
						</Link>
					</div>
					<p className="text-center text-xs text-gray-400">
						© {new Date().getFullYear()} Vendor Panel
					</p>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
