module.exports = {
	type: "object",
	properties: {
		facebook: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				tokenExpiry: { type: "string", format: "date-time", nullable: true },
				isConnected: { type: "boolean" },
				metadata: { type: "object" },
			},
			required: ["isConnected"],
			additionalProperties: true,
		},
		instagram: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				tokenExpiry: { type: "string", format: "date-time", nullable: true },
				isConnected: { type: "boolean" },
				metadata: { type: "object" },
			},
			required: ["isConnected"],
			additionalProperties: true,
		},
		tiktok: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				tokenExpiry: { type: "string", format: "date-time", nullable: true },
				isConnected: { type: "boolean" },
				metadata: { type: "object" },
			},
			required: ["isConnected"],
			additionalProperties: true,
		},
		youtube: {
			type: "object",
			properties: {
				accessToken: { type: "string", nullable: true },
				refreshToken: { type: "string", nullable: true },
				tokenExpiry: { type: "string", format: "date-time", nullable: true },
				isConnected: { type: "boolean" },
				metadata: { type: "object" },
			},
			required: ["isConnected"],
			additionalProperties: true,
		},
	},
	additionalProperties: false,
};
