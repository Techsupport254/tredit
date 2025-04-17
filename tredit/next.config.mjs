/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	poweredByHeader: false,
	reactStrictMode: true,
	images: {
		domains: ["localhost"],
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	experimental: {
		serverActions: {
			allowedOrigins:
				process.env.NODE_ENV === "production"
					? [process.env.FRONTEND_URL || "https://tredit.vercel.app"]
					: ["localhost:3000"],
		},
		typedRoutes: true,
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Ensure Node.js modules aren't included in client-side bundles
			config.resolve.fallback = {
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				os: false,
				path: false,
				stream: false,
				http: false,
				https: false,
				zlib: false,
			};

			// Handle node: protocol imports
			config.module.rules.push({
				test: /node:/,
				loader: "null-loader",
			});
		}

		return config;
	},
	// Enable these during development if needed
	typescript: {
		ignoreBuildErrors: false,
	},
	eslint: {
		ignoreDuringBuilds: false,
	},
};

export default nextConfig;
