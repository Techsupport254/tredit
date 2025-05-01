export interface Config {
	server: {
		port: number;
		env: string;
		enableRateLimiting: boolean;
	};
	urls: {
		frontend: string;
		backend: string;
	};
	database: {
		host: string;
		port: number;
		user: string;
		password: string;
		name: string;
		ssl: boolean;
		forceSync: boolean;
	};
	ipfs: {
		apiKey: string;
		apiSecret: string;
		jwt: string;
		baseUrl: string;
		gatewayUrl: string;
	};
	blockchain: {
		userProfileContract: string;
		userProfileAbi: any[];
		businessContract: string;
		businessAbi: any[];
		paymentContract: string;
		paymentAbi: any[];
		escrowContract: string;
		escrowAbi: any[];
		tokenAddress: string;
		tokenAbi: any[];
		biconomyForwarder: string;
		rpcUrl: string;
		chainId: number;
		mnemonic: string;
		privateKey: string;
		polygonscanApiKey: string;
		usdcToken?: string;
		paymentAbi?: string;
		escrowAbi?: string;
	};
	jwt: {
		secret: string;
		expire: string;
	};
	session: {
		secret: string;
	};
	email: {
		host: string;
		port: number;
		user: string;
		pass: string;
		from: {
			email: string;
			name: string;
		};
	};
	oauth: {
		youtube: {
			apiKey: string;
			clientId: string;
			clientSecret: string;
			redirectUri: string;
		};
		google: {
			clientId: string;
			clientSecret: string;
			redirectUri: string;
		};
		facebook: {
			appId: string;
			appSecret: string;
		};
		instagram: {
			clientId: string;
			clientSecret: string;
		};
		tiktok: {
			clientKey: string;
			clientSecret: string;
		};
	};
	firebase: {
		apiKey: string;
		authDomain: string;
		projectId: string;
		storageBucket: string;
		messagingSenderId: string;
		appId: string;
	};
	security: {
		corsOrigin: string;
		rateLimitWindow: number;
		rateLimitMax: number;
		requireAuth: boolean;
	};
	youtube: {
		clientId: string;
		clientSecret: string;
		redirectUri: string;
		refreshToken: string;
	};
	paystack: {
		secretKey: string;
	};
	appUrl: string;
}
