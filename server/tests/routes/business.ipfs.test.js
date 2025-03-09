const request = require("supertest");
const app = require("../../app");
const Business = require("../../models/Business");
const pinata = require("../../utils/ipfs");
const { generateToken } = require("../../utils/auth");

describe("Business IPFS Routes", () => {
	let testBusiness;
	let authToken;
	let testUser;

	beforeEach(async () => {
		// Create test user
		testUser = {
			walletAddress: "0x1234567890abcdef",
			role: "owner",
		};

		// Generate auth token
		authToken = generateToken(testUser);

		// Create test business
		testBusiness = await Business.create({
			name: "Test Business",
			type: "retail",
			description: "Test Description",
			walletAddress: testUser.walletAddress,
			category: "general",
			status: "active",
		});
	});

	afterEach(async () => {
		await Business.destroy({ where: {} });
		jest.clearAllMocks();
	});

	describe("POST /:businessId/ipfs/sync", () => {
		it("should sync business data to IPFS successfully", async () => {
			const mockIpfsResponse = {
				cid: "test-cid-123",
				url: "https://gateway.pinata.cloud/ipfs/test-cid-123",
			};

			jest.spyOn(pinata, "uploadContent").mockResolvedValue(mockIpfsResponse);

			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/sync`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({});

			expect(response.status).toBe(200);
			expect(response.body.status).toBe("success");
			expect(response.body.data.cid).toBe(mockIpfsResponse.cid);
			expect(response.body.data.url).toBe(mockIpfsResponse.url);
		});

		it("should update existing IPFS content with merge", async () => {
			const existingCid = "existing-cid-123";
			const mockIpfsResponse = {
				cid: "new-cid-123",
				url: "https://gateway.pinata.cloud/ipfs/new-cid-123",
			};

			jest.spyOn(pinata, "updateWithMerge").mockResolvedValue(mockIpfsResponse);

			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/sync`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					existingCid,
					updateType: "merge",
				});

			expect(response.status).toBe(200);
			expect(response.body.data.cid).toBe(mockIpfsResponse.cid);
		});

		it("should update existing IPFS content with replace", async () => {
			const existingCid = "existing-cid-123";
			const mockIpfsResponse = {
				cid: "new-cid-123",
				url: "https://gateway.pinata.cloud/ipfs/new-cid-123",
			};

			jest.spyOn(pinata, "replaceData").mockResolvedValue(mockIpfsResponse);

			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/sync`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					existingCid,
					updateType: "replace",
				});

			expect(response.status).toBe(200);
			expect(response.body.data.cid).toBe(mockIpfsResponse.cid);
		});
	});

	describe("POST /:businessId/ipfs/user", () => {
		it("should update user data while preserving business data", async () => {
			const mockIpfsResponse = {
				cid: "new-cid-123",
				url: "https://gateway.pinata.cloud/ipfs/new-cid-123",
			};

			// Set initial IPFS CID
			await testBusiness.update({ ipfsCid: "existing-cid-123" });

			jest.spyOn(pinata, "replaceData").mockResolvedValue(mockIpfsResponse);

			const userData = {
				preferences: { theme: "dark" },
				settings: { notifications: true },
			};

			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/user`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ userData });

			expect(response.status).toBe(200);
			expect(response.body.data.cid).toBe(mockIpfsResponse.cid);
		});

		it("should fail if business has no IPFS CID", async () => {
			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/user`)
				.set("Authorization", `Bearer ${authToken}`)
				.send({ userData: {} });

			expect(response.status).toBe(404);
			expect(response.body.status).toBe("error");
		});
	});

	describe("GET /:businessId/ipfs/status", () => {
		it("should return IPFS sync status when content exists", async () => {
			const mockIpfsContent = {
				business: { name: "Test Business" },
				user: { preferences: {} },
			};

			await testBusiness.update({
				ipfsCid: "test-cid-123",
				ipfsUrl: "https://gateway.pinata.cloud/ipfs/test-cid-123",
			});

			jest.spyOn(pinata, "getContent").mockResolvedValue(mockIpfsContent);

			const response = await request(app)
				.get(`/api/businesses/${testBusiness.id}/ipfs/status`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.synced).toBe(true);
			expect(response.body.data.content).toEqual(mockIpfsContent);
		});

		it("should return not synced status when no IPFS content exists", async () => {
			const response = await request(app)
				.get(`/api/businesses/${testBusiness.id}/ipfs/status`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.synced).toBe(false);
		});
	});

	describe("GET /:businessId/ipfs/user", () => {
		it("should return only user data from IPFS", async () => {
			const mockUserData = { preferences: { theme: "dark" } };

			await testBusiness.update({ ipfsCid: "test-cid-123" });
			jest.spyOn(pinata, "getSpecificData").mockResolvedValue(mockUserData);

			const response = await request(app)
				.get(`/api/businesses/${testBusiness.id}/ipfs/user`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.userData).toEqual(mockUserData);
		});
	});

	describe("GET /:businessId/ipfs/business", () => {
		it("should return only business data from IPFS", async () => {
			const mockBusinessData = {
				name: "Test Business",
				type: "retail",
			};

			await testBusiness.update({ ipfsCid: "test-cid-123" });
			jest.spyOn(pinata, "getSpecificData").mockResolvedValue(mockBusinessData);

			const response = await request(app)
				.get(`/api/businesses/${testBusiness.id}/ipfs/business`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.businessData).toEqual(mockBusinessData);
		});
	});

	describe("Authentication and Authorization", () => {
		it("should reject requests without auth token", async () => {
			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/sync`)
				.send({});

			expect(response.status).toBe(401);
		});

		it("should reject requests from non-team members", async () => {
			const unauthorizedUser = {
				walletAddress: "0xunauthorized",
				role: "user",
			};
			const unauthorizedToken = generateToken(unauthorizedUser);

			const response = await request(app)
				.post(`/api/businesses/${testBusiness.id}/ipfs/sync`)
				.set("Authorization", `Bearer ${unauthorizedToken}`)
				.send({});

			expect(response.status).toBe(403);
		});
	});
});
