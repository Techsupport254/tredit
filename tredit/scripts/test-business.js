#!/usr/bin/env node

const axios = require("axios");
require("dotenv").config();

const API_URL = "http://localhost:3000/api";

// Test data for a product-based business
const productBusiness = {
	name: "Tech Gadgets Store",
	description: "Your one-stop shop for all tech gadgets and accessories",
	bio: "Founded in 2024, we bring the latest tech gadgets to Kenya",
	type: "PRODUCT",
	category: "Electronics",
	productCategories: ["Smartphones", "Laptops", "Accessories"],
	email: "store@techgadgets.com",
	phone: "+254700000000",
	address: "123 Tech Street, Nairobi",
	businessModel: "B2C",
	operationMode: "HYBRID",
	paymentMethods: ["MPESA", "CARD", "BANK_TRANSFER"],
	businessHours: {
		monday: { open: "09:00", close: "18:00" },
		tuesday: { open: "09:00", close: "18:00" },
		wednesday: { open: "09:00", close: "18:00" },
		thursday: { open: "09:00", close: "18:00" },
		friday: { open: "09:00", close: "18:00" },
		saturday: { open: "10:00", close: "15:00" },
		sunday: "CLOSED",
	},
	socialMedia: {
		facebook: "https://facebook.com/techgadgets",
		instagram: "https://instagram.com/techgadgets",
		twitter: "https://twitter.com/techgadgets",
	},
};

// Test data for a service-based business
const serviceBusiness = {
	name: "Tech Consulting Services",
	description: "Professional IT consulting and software development services",
	bio: "Expert tech consultants with over 10 years of experience",
	type: "SERVICE",
	category: "Technology",
	serviceCategories: [
		"Software Development",
		"IT Consulting",
		"Cloud Services",
	],
	email: "info@techconsulting.com",
	phone: "+254711111111",
	address: "456 Business Park, Nairobi",
	businessModel: "B2B",
	operationMode: "HYBRID",
	paymentMethods: ["MPESA", "BANK_TRANSFER"],
	businessHours: {
		monday: { open: "09:00", close: "17:00" },
		tuesday: { open: "09:00", close: "17:00" },
		wednesday: { open: "09:00", close: "17:00" },
		thursday: { open: "09:00", close: "17:00" },
		friday: { open: "09:00", close: "17:00" },
		saturday: "BY_APPOINTMENT",
		sunday: "CLOSED",
	},
	socialMedia: {
		linkedin: "https://linkedin.com/company/techconsulting",
		twitter: "https://twitter.com/techconsulting",
	},
};

async function testCreateBusiness(businessData) {
	try {
		// 1. Create business on blockchain
		console.log("Creating business on blockchain...");
		const blockchainResponse = await axios.post(
			`${API_URL}/business/blockchain`,
			businessData
		);
		const { businessId, txHash } = blockchainResponse.data;

		// 2. Upload to IPFS
		console.log("Uploading to IPFS...");
		const ipfsResponse = await axios.post(`${API_URL}/business/ipfs`, {
			...businessData,
			businessId,
			txHash,
		});
		const { ipfsUrl } = ipfsResponse.data;

		// 3. Create business in database
		console.log("Creating business in database...");
		const dbResponse = await axios.post(`${API_URL}/business`, {
			...businessData,
			businessId,
			blockchainTxHash: txHash,
			ipfsUrl,
		});

		console.log("Business created successfully:", dbResponse.data);
		return dbResponse.data;
	} catch (error) {
		console.error(
			"Error creating business:",
			error.response?.data || error.message
		);
		throw error;
	}
}

// Test both business types
async function runTests() {
	console.log("Testing product-based business creation...");
	await testCreateBusiness(productBusiness);

	console.log("\nTesting service-based business creation...");
	await testCreateBusiness(serviceBusiness);
}

// Run the tests
runTests().catch(console.error);
