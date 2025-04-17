/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [],
	},
	webpack: (config, { isServer, webpack }) => {
		if (!isServer) {
			// Provide fallbacks for Node.js built-ins used by some client-side packages
			config.resolve.fallback = {
				...config.resolve.fallback, // Spread existing fallbacks if any
				fs: false,
				net: false,
				tls: false,
				child_process: false,
				"fs/promises": false,
				os: false,
				path: false,
				process: false, // Consider setting to require.resolve('process/browser') if needed
				url: false,
				module: false,
				crypto: false, // Consider setting to require.resolve('crypto-browserify') if needed
			};

			// Ignore Prisma client runtime library on client-side
			config.plugins.push(
				new webpack.IgnorePlugin({
					resourceRegExp: /@prisma\/client\/runtime\/library/,
				})
			);
		}

		// Ensure bcrypt and potentially the prisma adapter are treated as external on the server
		if (isServer) {
			config.externals = [
				...(config.externals || []),
				"bcrypt",
				"@auth/prisma-adapter",
			];
		}

		return config;
	},
};

module.exports = nextConfig;
