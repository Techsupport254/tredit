import {
	PrismaClient,
	Gender,
	UserStatus,
	VerificationStatus,
	Prisma,
} from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Authentic Kenyan names with their tribes, genders, and wallet addresses
const kenyanUsers = [
	{
		firstName: "Nia",
		lastName: "Wambui",
		tribe: "Kikuyu",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
	},
	{
		firstName: "Juma",
		lastName: "Baraka",
		tribe: "Swahili",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44f",
	},
	{
		firstName: "Amina",
		lastName: "Abdi",
		tribe: "Somali",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f450",
	},
	{
		firstName: "Ken",
		lastName: "Okoth",
		tribe: "Luo",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f451",
	},
	{
		firstName: "Mwende",
		lastName: "Mutheu",
		tribe: "Kamba",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f452",
	},
	{
		firstName: "Kipchirchir",
		lastName: "Ruto",
		tribe: "Kalenjin",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f453",
	},
	{
		firstName: "Zawadi",
		lastName: "Muthoni",
		tribe: "Kikuyu",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f454",
	},
	{
		firstName: "Abdul",
		lastName: "Aziz",
		tribe: "Coast",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f455",
	},
	{
		firstName: "Wairimu",
		lastName: "Njoki",
		tribe: "Kikuyu",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f456",
	},
	{
		firstName: "Otieno",
		lastName: "Odero",
		tribe: "Luo",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f457",
	},
	{
		firstName: "Siti",
		lastName: "Alhuda",
		tribe: "Somali",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f458",
	},
	{
		firstName: "Moses",
		lastName: "Ochieng",
		tribe: "Luo",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f459",
	},
	{
		firstName: "Ngina",
		lastName: "Mutua",
		tribe: "Kamba",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45a",
	},
	{
		firstName: "Nashit",
		lastName: "Mumin",
		tribe: "Somali",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45b",
	},
	{
		firstName: "Kendi",
		lastName: "Chebet",
		tribe: "Kalenjin",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45c",
	},
	{
		firstName: "David",
		lastName: "Mwai",
		tribe: "Kikuyu",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45d",
	},
	{
		firstName: "Faith",
		lastName: "Oloo",
		tribe: "Luo",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45e",
	},
	{
		firstName: "Penda",
		lastName: "Mburu",
		tribe: "Kikuyu",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f45f",
	},
	{
		firstName: "Jemimah",
		lastName: "Mumo",
		tribe: "Kamba",
		gender: Gender.FEMALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f460",
	},
	{
		firstName: "Omari",
		lastName: "Juma",
		tribe: "Swahili",
		gender: Gender.MALE,
		walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f461",
	},
];

// Kenyan cities by region
const kenyanCities = {
	central: ["Nairobi", "Thika", "Nyeri", "Muranga", "Kiambu"],
	coast: ["Mombasa", "Malindi", "Lamu", "Kilifi", "Diani"],
	eastern: ["Machakos", "Meru", "Embu", "Kitui", "Garissa"],
	nyanza: ["Kisumu", "Homa Bay", "Kisii", "Migori", "Siaya"],
	riftValley: ["Nakuru", "Eldoret", "Kitale", "Kericho", "Bomet"],
	western: ["Kakamega", "Bungoma", "Busia", "Vihiga", "Webuye"],
};

// Map tribes to regions for more accurate city selection
const tribeToRegion = {
	Kikuyu: "central",
	Luo: "nyanza",
	Kamba: "eastern",
	Somali: "eastern",
	Kalenjin: "riftValley",
	Swahili: "coast",
	Coast: "coast",
};

// Kenyan phone prefixes
const phonePrefixes = ["7", "1"];

async function generateKenyanUser(index: number) {
	const user = kenyanUsers[index];
	const name = `${user.firstName} ${user.lastName}`;

	// Generate email using the selected names
	const email = faker.internet
		.email({ firstName: user.firstName, lastName: user.lastName })
		.toLowerCase();
	const password = await hash("Password123!", 10);

	// Generate date of birth between 18 and 65 years ago
	const dob = faker.date.between({
		from: new Date(1958, 0, 1),
		to: new Date(2005, 11, 31),
	});

	// Generate phone number with Kenyan format
	const prefix = faker.helpers.arrayElement(phonePrefixes);
	const phoneNumber = `+254${prefix}${faker.string.numeric(8)}`;

	// Select city based on tribe's region
	const region =
		tribeToRegion[user.tribe as keyof typeof tribeToRegion] || "central";
	const city = faker.helpers.arrayElement(
		kenyanCities[region as keyof typeof kenyanCities]
	);

	// Generate shipping address
	const shippingAddress = `${faker.location.streetAddress()}, ${city}, Kenya`;

	// Generate bio
	const bio = faker.lorem.paragraph();

	// Generate profile image URL (placeholder)
	const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
		name
	)}&background=random`;

	const userData: Prisma.UserCreateInput = {
		name,
		email,
		password,
		walletAddress: user.walletAddress,
		gender: user.gender,
		dob,
		phoneNumber,
		shippingAddress,
		bio,
		profileImage,
		acceptBlockchainStorage: true,
		status: UserStatus.ACTIVE,
		role: "USER",
		verificationStatus: VerificationStatus.PENDING,
		preferences: {
			notifications: {
				types: [],
				channels: ["EMAIL"],
				smsNotifications: false,
				pushNotifications: true,
				emailNotifications: true,
				inAppNotifications: true,
				webhookNotifications: false,
			},
		},
		metadata: {
			tribe: user.tribe,
			region: region,
			registrationDate: new Date().toISOString(),
		},
	};

	return userData;
}

async function seedKenyanUsers() {
	try {
		console.log("Starting to seed Kenyan users...");

		for (let i = 0; i < kenyanUsers.length; i++) {
			const userData = await generateKenyanUser(i);

			try {
				const user = await prisma.user.create({
					data: userData,
				});
				const metadata = user.metadata as {
					tribe: string;
					region: string;
					registrationDate: string;
				};
				console.log(
					`Created user: ${user.name} (${user.email}) - ${metadata.tribe} from ${metadata.region} - Wallet: ${user.walletAddress}`
				);
			} catch (error) {
				console.error(`Error creating user ${i + 1}:`, error);
			}
		}

		console.log("Finished seeding Kenyan users!");
	} catch (error) {
		console.error("Error in seedKenyanUsers:", error);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the seeding function
seedKenyanUsers();
