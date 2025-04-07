import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	css: {
		modules: {
			localsConvention: "camelCase",
			generateScopedName: "[name]__[local]___[hash:base64:5]",
		},
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@components": path.resolve(__dirname, "./src/Components"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@context": path.resolve(__dirname, "./src/Context"),
		},
	},
	server: {
		host: true, // Allow external network access
		port: 5173,
		hmr: {
			overlay: false, // Disable the error overlay temporarily
		},
	},
});
