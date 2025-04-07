const crypto = require("crypto");

// Generate a unique order number
const generateOrderNumber = () => {
	const timestamp = Date.now().toString();
	const random = crypto.randomBytes(4).toString("hex");
	return `ORD-${timestamp}-${random}`;
};

// Calculate estimated delivery date based on shipping method and location
const calculateEstimatedDelivery = (shippingMethod, location) => {
	const baseDate = new Date();
	let daysToAdd = 7; // Default to 7 days

	switch (shippingMethod.toLowerCase()) {
		case "express":
			daysToAdd = 2;
			break;
		case "priority":
			daysToAdd = 4;
			break;
		case "standard":
			daysToAdd = 7;
			break;
		case "economy":
			daysToAdd = 10;
			break;
	}

	// Add extra days for international shipping
	if (location.country !== "US") {
		daysToAdd += 5;
	}

	baseDate.setDate(baseDate.getDate() + daysToAdd);
	return baseDate;
};

// Calculate tax based on location and product type
const calculateTax = (subtotal, location, productType) => {
	let taxRate = 0;

	// Example tax rates (should be replaced with actual tax rates from a tax service)
	const taxRates = {
		US: {
			standard: 0.08, // 8%
			digital: 0.05, // 5%
			service: 0.06, // 6%
		},
		CA: {
			standard: 0.13, // 13%
			digital: 0.13, // 13%
			service: 0.13, // 13%
		},
	};

	if (taxRates[location.country]) {
		taxRate =
			taxRates[location.country][productType] ||
			taxRates[location.country].standard;
	}

	return (subtotal * taxRate).toFixed(2);
};

// Calculate shipping cost based on weight, dimensions, and destination
const calculateShippingCost = (weight, dimensions, destination) => {
	// Base rate
	let cost = 10;

	// Add cost based on weight (example calculation)
	cost += weight * 0.5; // $0.50 per pound

	// Add cost based on dimensions (example calculation)
	const volume = dimensions.length * dimensions.width * dimensions.height;
	cost += volume * 0.001; // $0.001 per cubic inch

	// Add cost based on destination (example calculation)
	if (destination.country !== "US") {
		cost *= 2; // Double cost for international shipping
	}

	return cost.toFixed(2);
};

// Validate address format
const validateAddress = (address) => {
	if (!address || typeof address !== "string" || address.trim() === "") {
		throw new Error("Address is required and must be a non-empty string");
	}

	if (address.length < 10) {
		throw new Error("Address is too short, please provide a complete address");
	}

	return true;
};

// Format currency amount
const formatCurrency = (amount, currency = "USD") => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
};

module.exports = {
	generateOrderNumber,
	calculateEstimatedDelivery,
	calculateTax,
	calculateShippingCost,
	validateAddress,
	formatCurrency,
};
