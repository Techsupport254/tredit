const { sequelize } = require("../../config/database");
const { User } = require("../../models/User");
const { Business } = require("../../models/Business");
const { BusinessTeamMember } = require("../../models/BusinessTeamMember");

describe("Business Model Tests", () => {
	beforeAll(async () => {
		await sequelize.sync({ force: true }); // This will drop and recreate tables
	});

	afterAll(async () => {
		await sequelize.close();
	});

	beforeEach(async () => {
		await User.destroy({ where: {} });
		await Business.destroy({ where: {} });
		await BusinessTeamMember.destroy({ where: {} });
	});

	describe("Business Creation", () => {
		let testUser;

		beforeEach(async () => {
			testUser = await User.create({
				walletAddress: "0x123456789abcdef",
				name: "Test User",
				email: "test@example.com",
			});
		});

		test("should create a business successfully", async () => {
			const businessData = {
				walletAddress: testUser.walletAddress,
				name: "Test Business",
				type: "product",
				category: "Electronics",
				businessModel: "B2C",
				operationMode: "online",
				currency: "USD",
			};

			const business = await Business.create(businessData);
			expect(business).toBeDefined();
			expect(business.name).toBe("Test Business");
			expect(business.walletAddress).toBe(testUser.walletAddress.toLowerCase());
		});

		test("should enforce required fields", async () => {
			const invalidBusiness = {
				walletAddress: testUser.walletAddress,
				// Missing required fields
			};

			await expect(Business.create(invalidBusiness)).rejects.toThrow();
		});

		test("should validate business type", async () => {
			const invalidType = {
				...validBusinessData,
				type: "invalid_type",
			};

			await expect(Business.create(invalidType)).rejects.toThrow();
		});

		test("should handle locations correctly", async () => {
			const businessWithLocations = {
				...validBusinessData,
				locations: [
					{
						name: "Main Store",
						address: "123 Test St",
						latitude: 1.234,
						longitude: 4.567,
						phoneNumber: "+1234567890",
						workingHours: {
							start: "09:00",
							end: "17:00",
						},
						isMainBranch: true,
					},
				],
			};

			const business = await Business.create(businessWithLocations);
			expect(business.locations).toHaveLength(1);
			expect(business.locations[0].name).toBe("Main Store");
		});
	});

	describe("Business Team Members", () => {
		let testUser, testBusiness;

		beforeEach(async () => {
			testUser = await User.create({
				walletAddress: "0x123456789abcdef",
				name: "Test User",
				email: "test@example.com",
			});

			testBusiness = await Business.create({
				walletAddress: testUser.walletAddress,
				name: "Test Business",
				type: "product",
				category: "Electronics",
				businessModel: "B2C",
				operationMode: "online",
				currency: "USD",
			});
		});

		test("should add team member successfully", async () => {
			const teamMember = await BusinessTeamMember.create({
				businessId: testBusiness.id,
				walletAddress: testUser.walletAddress,
				role: "owner",
				permissions: ["manage_products", "edit_settings"],
			});

			expect(teamMember).toBeDefined();
			expect(teamMember.role).toBe("owner");
			expect(teamMember.permissions).toContain("manage_products");
		});

		test("should prevent duplicate team members", async () => {
			await BusinessTeamMember.create({
				businessId: testBusiness.id,
				walletAddress: testUser.walletAddress,
				role: "owner",
			});

			await expect(
				BusinessTeamMember.create({
					businessId: testBusiness.id,
					walletAddress: testUser.walletAddress,
					role: "manager",
				})
			).rejects.toThrow();
		});

		test("should validate team member permissions", async () => {
			await expect(
				BusinessTeamMember.create({
					businessId: testBusiness.id,
					walletAddress: testUser.walletAddress,
					role: "owner",
					permissions: ["invalid_permission"],
				})
			).rejects.toThrow();
		});
	});

	describe("Business Relationships", () => {
		test("should fetch business with owner details", async () => {
			const owner = await User.create({
				walletAddress: "0x123456789abcdef",
				name: "Business Owner",
				email: "owner@example.com",
			});

			const business = await Business.create({
				walletAddress: owner.walletAddress,
				name: "Test Business",
				type: "product",
				category: "Electronics",
				businessModel: "B2C",
				operationMode: "online",
				currency: "USD",
			});

			const businessWithOwner = await Business.findOne({
				where: { id: business.id },
				include: [
					{
						model: User,
						as: "owner",
					},
				],
			});

			expect(businessWithOwner.owner).toBeDefined();
			expect(businessWithOwner.owner.walletAddress).toBe(owner.walletAddress);
		});

		test("should fetch business with team members", async () => {
			// Create business and add team members
			const business = await Business.create(validBusinessData);

			const teamMember1 = await User.create({
				walletAddress: "0xteammember1",
				name: "Team Member 1",
				email: "team1@example.com",
			});

			const teamMember2 = await User.create({
				walletAddress: "0xteammember2",
				name: "Team Member 2",
				email: "team2@example.com",
			});

			await BusinessTeamMember.bulkCreate([
				{
					businessId: business.id,
					walletAddress: teamMember1.walletAddress,
					role: "manager",
				},
				{
					businessId: business.id,
					walletAddress: teamMember2.walletAddress,
					role: "staff",
				},
			]);

			const businessWithTeam = await Business.findOne({
				where: { id: business.id },
				include: [
					{
						model: User,
						as: "teamMembers",
					},
				],
			});

			expect(businessWithTeam.teamMembers).toHaveLength(2);
		});
	});
});

const validBusinessData = {
	walletAddress: "0x123456789abcdef",
	name: "Test Business",
	type: "product",
	category: "Electronics",
	businessModel: "B2C",
	operationMode: "online",
	currency: "USD",
};
