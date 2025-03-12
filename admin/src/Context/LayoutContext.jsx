import {
	createContext,
	useState,
	useContext,
	useCallback,
	useMemo,
} from "react";
import PropTypes from "prop-types";

export const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
	const [layoutState, setLayoutState] = useState({
		isSidebarOpen: JSON.parse(localStorage.getItem("isSidebarOpen")) ?? false,
		isSidebarCollapsed:
			JSON.parse(localStorage.getItem("isSidebarCollapsed")) ?? false,
	});

	const toggleSidebar = useCallback(() => {
		setLayoutState((prev) => {
			const newState = {
				...prev,
				isSidebarOpen: !prev.isSidebarOpen,
			};
			localStorage.setItem(
				"isSidebarOpen",
				JSON.stringify(newState.isSidebarOpen)
			);
			return newState;
		});
	}, []);

	const closeSidebar = useCallback(() => {
		setLayoutState((prev) => {
			const newState = {
				...prev,
				isSidebarOpen: false,
			};
			localStorage.setItem("isSidebarOpen", JSON.stringify(false));
			return newState;
		});
	}, []);

	const toggleSidebarCollapse = useCallback(() => {
		setLayoutState((prev) => {
			const newState = {
				...prev,
				isSidebarCollapsed: !prev.isSidebarCollapsed,
			};
			localStorage.setItem(
				"isSidebarCollapsed",
				JSON.stringify(newState.isSidebarCollapsed)
			);
			return newState;
		});
	}, []);

	const value = useMemo(
		() => ({
			...layoutState,
			toggleSidebar,
			closeSidebar,
			toggleSidebarCollapse,
		}),
		[layoutState, toggleSidebar, closeSidebar, toggleSidebarCollapse]
	);

	return (
		<LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
	);
};

export const useLayoutContext = () => {
	return useContext(LayoutContext);
};

LayoutProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
