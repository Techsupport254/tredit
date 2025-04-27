/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	poweredByHeader: false,
	reactStrictMode: true,
	images: {
		domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
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
		serverComponentsExternalPackages: ["socket.io", "socket.io-client"],
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Ensure Node.js modules aren't included in client-side bundles
			config.resolve.fallback = {
				...config.resolve.fallback,
				net: false,
				tls: false,
				fs: false,
				child_process: false,
				// Allow these modules for Socket.IO
				http: "stream-http",
				https: "https-browserify",
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
	// Add WebSocket support
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value:
							"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Upgrade, Connection",
					},
					{
						key: "Access-Control-Allow-Headers",
						value:
							"Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Protocol",
					},
				],
			},
		];
	},
};

export default nextConfig;
