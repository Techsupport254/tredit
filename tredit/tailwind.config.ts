import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"!./src/lib/**/*",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"primary-dark": "#0B1B3A",
				"secondary-bg": "#f8f9fa",
				"accent-teal": "#00A99D",
				"accent-red": "#e63946",
				"light-text": "#ffffff",
				navy: {
					dark: "#0f172a",
					middle: "#172033",
					light: "#334155",
				},
			},
			backgroundImage: {
				"auth-gradient":
					"linear-gradient(to bottom right, var(--tw-gradient-stops))",
			},
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
			},
			spacing: {
				"0": "0px",
				"1": "0.25rem",
				"2": "0.5rem",
				"3": "0.75rem",
				"4": "1rem",
				"5": "1.25rem",
				"6": "1.5rem",
				"8": "2rem",
				"10": "2.5rem",
				"12": "3rem",
				"16": "4rem",
				"20": "5rem",
				"24": "6rem",
			},
			animation: {
				float: "float 3s ease-in-out infinite",
				"spin-slow": "spin 8s linear infinite",
			},
			keyframes: {
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

export default config;
