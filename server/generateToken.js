require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const jwt = require("jsonwebtoken");

const user = {
	walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
	role: "user",
};

// Log the JWT secret being used
console.log("Using JWT_SECRET:", process.env.JWT_SECRET);

// Generate token with full user data
const token = jwt.sign(
	{
		id: "af3e3847-6c87-4f64-b94b-10d3e3c29dbd",
		name: "Victor Quaint",
		email: "kiruivictor097@gmail.com",
		walletAddress: user.walletAddress.toLowerCase(),
		blockchainTxHash:
			"0x2551584c3ccdb0d49d350cc17794fcd900b4f7af9dd05aeb42e4c0df27aefdac",
		ipfsUrl:
			"https://gateway.pinata.cloud/ipfs/bafkreigdvepjfypiesv4estloatgp6n2rdikq5as3gw4p7wewexfqo63q4",
		acceptBlockchainStorage: true,
		profileImage:
			"https://lh3.googleusercontent.com/a/ACg8ocKcyVbisFX9dDFOFGIwp88KBVQRW8_78F2EXZcr5znjhPot7JFyR=s64-c",
		gender: "male",
		dob: "2002-08-08",
		phoneNumber: "254716404137",
		location:
			"Kilimani, Kilimani division, Westlands, Nairobi, Nairobi County, 44847, Kenya",
		bio: "SasaTech Africa - Building the future of Web3",
		preferences: {
			theme: "dark",
			language: "en",
			notifications: {
				push: true,
				email: true,
				marketing: false,
			},
		},
		lastLogin: null,
		status: "active",
		role: "user",
		metadata: {
			businesses: [
				{
					id: "39e0d5f7-be2a-4f67-8b17-71e96a3ca9b3",
					name: "Tech Gadgets Store",
					role: "owner",
					joinedAt: "2025-03-17T16:20:50.111Z",
					permissions: {
						all: true,
						manageTeam: true,
						manageContent: true,
						viewAnalytics: true,
						manageFinances: true,
						manageProducts: true,
						manageServices: true,
						manageSettings: true,
					},
				},
			],
			lastIPFSUpdate: "2025-03-20T10:14:17.679Z",
		},
		createdAt: "2025-03-17T16:16:49.515Z",
		updatedAt: "2025-03-20T20:29:49.568Z",
	},
	process.env.JWT_SECRET,
	{
		algorithm: "HS256",
		expiresIn: "30d",
	}
);

console.log("\nGenerated token:", token);
