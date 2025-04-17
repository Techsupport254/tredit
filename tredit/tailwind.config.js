/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Custom colors from our theme
				navy: {
					dark: "#0f172a", // Very dark navy blue (background)
					medium: "#172033", // Medium navy blue
					light: "#334155", // Lighter navy blue
				},
				// Standard blue color shades - using Tailwind's default blue palette
				// These are already available in Tailwind by default
			},
			backgroundImage: {
				"auth-gradient":
					"linear-gradient(to bottom right, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};
