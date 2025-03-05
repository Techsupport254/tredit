import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	css: {
		postcss: "./postcss.config.js",
	},
	server: {
		https: {
			key: readFileSync(path.resolve(__dirname, "localhost-key.pem")),
			cert: readFileSync(path.resolve(__dirname, "localhost.pem")),
		},
		host: true, // Allow external network access
		port: 5173,
	},
});
