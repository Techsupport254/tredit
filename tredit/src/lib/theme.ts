// Global theme configuration for the application
// Define colors used across the application for consistency

export const theme = {
	colors: {
		// Primary navy/dark colors from the screenshot
		primary: {
			dark: "#0f172a", // Very dark navy blue (background)
			medium: "#172033", // Medium navy blue
			light: "#334155", // Lighter navy blue
		},

		// Accent colors - now using blue as the primary accent
		accent: {
			blue: {
				300: "#93c5fd", // Light blue (for icons)
				400: "#60a5fa", // Medium blue
				500: "#3b82f6", // Darker blue
				600: "#2563eb", // Even darker blue
				700: "#1d4ed8", // Very dark blue
			},
			slate: {
				500: "#64748b", // Medium slate
				600: "#475569", // Darker slate
				700: "#334155", // Even darker slate
				800: "#1e293b", // Very dark slate
				900: "#0f172a", // Darkest slate (same as primary.dark)
			},
		},

		// UI element colors
		ui: {
			background: "#f9fafb", // Page background
			card: "#ffffff", // Card background
			border: "#e5e7eb", // Border color
			hover: "#f3f4f6", // Hover state background
		},

		// Text colors
		text: {
			primary: "#1e293b", // Dark text
			secondary: "#64748b", // Medium text
			light: "#94a3b8", // Light text
			white: "#ffffff", // White text
		},

		// Status colors
		status: {
			success: "#10b981", // Green
			error: "#ef4444", // Red
			warning: "#f59e0b", // Amber
			info: "#3b82f6", // Blue
		},
	},

	// Border radius values
	borderRadius: {
		sm: "0.125rem", // 2px
		md: "0.375rem", // 6px
		lg: "0.5rem", // 8px
		xl: "0.75rem", // 12px
		full: "9999px", // Fully rounded (for circles/pills)
	},

	// Shadows
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
	},
};

// Helper function to use theme in components
export const getThemeValue = (path: string): any => {
	const keys = path.split(".");
	return keys.reduce((obj, key) => obj && obj[key], theme as any);
};

export default theme;
