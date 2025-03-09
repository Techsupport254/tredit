const request = require("supertest");
const { sequelize } = require("../../config/database");
const app = require("../../server");
const { createTestUser } = require("../createTestUser");
const Business = require("../../models/businessModel");

let testUser;
let authToken;
let testBusiness;

beforeAll(async () => {
	// Create a test user and get auth token
	const userData = await createTestUser();
	testUser = userData.user;
	authToken = userData.token;
});

beforeEach(async () => {
	// Clear business table before each test
	await Business.destroy({ where: {} });
});

afterAll(async () => {
	// Close database connection
	await sequelize.close();
});

describe("Business Endpoints", () => {
	describe("POST /businesses", () => {
		it("should create a new business", async () => {
			const businessData = {
				name: "Test Business",
				description: "A test business",
				category: "Technology",
				address: "123 Test St",
				phone: "1234567890",
				email: "test@business.com",
			};

			const response = await request(app)
				.post("/api/businesses")
				.set("Authorization", `Bearer ${authToken}`)
				.send(businessData);

			expect(response.status).toBe(201);
			expect(response.body.data.name).toBe(businessData.name);
			testBusiness = response.body.data;
		});

		it("should not create business without authentication", async () => {
			const response = await request(app).post("/api/businesses").send({
				name: "Test Business",
			});

			expect(response.status).toBe(401);
		});
	});

	describe("GET /businesses", () => {
		it("should get all businesses", async () => {
			const response = await request(app)
				.get("/api/businesses")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.data)).toBe(true);
		});
	});

	describe("GET /businesses/my-businesses", () => {
		it("should get businesses owned by the user", async () => {
			const response = await request(app)
				.get("/api/businesses/my-businesses")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body.data)).toBe(true);
		});
	});

	describe("GET /businesses/:businessId", () => {
		it("should get a business by ID", async () => {
			// First create a business
			const businessData = {
				name: "Test Business",
				description: "A test business",
				category: "Technology",
			};

			const createResponse = await request(app)
				.post("/api/businesses")
				.set("Authorization", `Bearer ${authToken}`)
				.send(businessData);

			const businessId = createResponse.body.data.id;

			const response = await request(app)
				.get(`/api/businesses/${businessId}`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data.id).toBe(businessId);
		});

		it("should return 404 for non-existent business", async () => {
			const response = await request(app)
				.get("/api/businesses/999999")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(404);
		});
	});

	describe("Team Management", () => {
		let businessId;

		beforeEach(async () => {
			// Create a test business for team management tests
			const businessData = {
				name: "Team Test Business",
				description: "A test business for team management",
				category: "Technology",
			};

			const response = await request(app)
				.post("/api/businesses")
				.set("Authorization", `Bearer ${authToken}`)
				.send(businessData);

			businessId = response.body.data.id;
		});

		describe("POST /businesses/:businessId/team", () => {
			it("should add a team member", async () => {
				const teamMemberData = {
					email: "team@member.com",
					role: "manager",
				};

				const response = await request(app)
					.post(`/api/businesses/${businessId}/team`)
					.set("Authorization", `Bearer ${authToken}`)
					.send(teamMemberData);

				expect(response.status).toBe(201);
				expect(response.body.data.email).toBe(teamMemberData.email);
			});
		});

		describe("GET /businesses/:businessId/team", () => {
			it("should get all team members", async () => {
				const response = await request(app)
					.get(`/api/businesses/${businessId}/team`)
					.set("Authorization", `Bearer ${authToken}`);

				expect(response.status).toBe(200);
				expect(Array.isArray(response.body.data)).toBe(true);
			});
		});
	});

	describe("Business Verification", () => {
		let businessId;

		beforeEach(async () => {
			// Create a test business for verification tests
			const businessData = {
				name: "Verification Test Business",
				description: "A test business for verification",
				category: "Technology",
			};

			const response = await request(app)
				.post("/api/businesses")
				.set("Authorization", `Bearer ${authToken}`)
				.send(businessData);

			businessId = response.body.data.id;
		});

		describe("POST /businesses/:businessId/verify", () => {
			it("should request business verification", async () => {
				const verificationData = {
					documents: ["doc1.pdf", "doc2.pdf"],
					businessLicense: "license.pdf",
				};

				const response = await request(app)
					.post(`/api/businesses/${businessId}/verify`)
					.set("Authorization", `Bearer ${authToken}`)
					.send(verificationData);

				expect(response.status).toBe(200);
				expect(response.body.message).toBeTruthy();
			});
		});

		describe("GET /businesses/:businessId/verification-status", () => {
			it("should get verification status", async () => {
				const response = await request(app)
					.get(`/api/businesses/${businessId}/verification-status`)
					.set("Authorization", `Bearer ${authToken}`);

				expect(response.status).toBe(200);
				expect(response.body.data.status).toBeTruthy();
			});
		});
	});

	describe("Categories", () => {
		describe("GET /businesses/categories/products", () => {
			it("should get product categories", async () => {
				const response = await request(app)
					.get("/api/businesses/categories/products")
					.set("Authorization", `Bearer ${authToken}`);

				expect(response.status).toBe(200);
				expect(Array.isArray(response.body.data)).toBe(true);
			});
		});

		describe("GET /businesses/categories/services", () => {
			it("should get service categories", async () => {
				const response = await request(app)
					.get("/api/businesses/categories/services")
					.set("Authorization", `Bearer ${authToken}`);

				expect(response.status).toBe(200);
				expect(Array.isArray(response.body.data)).toBe(true);
			});
		});
	});
});
