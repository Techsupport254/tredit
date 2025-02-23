import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

export const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
	// Retrieve sidebar state from localStorage to persist user preference
	const initialSidebarState =
		JSON.parse(localStorage.getItem("isSidebarOpen")) ?? false;
	const initialSidebarCollapse =
		JSON.parse(localStorage.getItem("isSidebarCollapsed")) ?? false;

	const [isSidebarOpen, setIsSidebarOpen] = useState(initialSidebarState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
		initialSidebarCollapse
	);

	// Toggle Sidebar
	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => {
			const newState = !prev;
			localStorage.setItem("isSidebarOpen", JSON.stringify(newState));
			return newState;
		});
	};

	// Close Sidebar explicitly
	const closeSidebar = () => {
		setIsSidebarOpen(false);
		localStorage.setItem("isSidebarOpen", JSON.stringify(false));
	};

	// Toggle Sidebar Collapse
	const toggleSidebarCollapse = () => {
		setIsSidebarCollapsed((prev) => {
			const newState = !prev;
			localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
			return newState;
		});
	};

	// Sync sidebar state to localStorage on changes
	useEffect(() => {
		localStorage.setItem("isSidebarOpen", JSON.stringify(isSidebarOpen));
		localStorage.setItem(
			"isSidebarCollapsed",
			JSON.stringify(isSidebarCollapsed)
		);
	}, [isSidebarOpen, isSidebarCollapsed]);

	return (
		<LayoutContext.Provider
			value={{
				isSidebarOpen,
				isSidebarCollapsed,
				toggleSidebar,
				closeSidebar,
				toggleSidebarCollapse,
				setIsSidebarCollapsed,
			}}
		>
			{children}
		</LayoutContext.Provider>
	);
};

export const useLayoutContext = () => {
	return useContext(LayoutContext);
};

// Props validation
LayoutProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
