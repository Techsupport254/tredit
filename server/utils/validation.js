const AppError = require("./appError");

const validateBusinessData = (data) => {
	const { name, description, category } = data;

	if (!name) {
		throw new AppError("Business name is required", 400);
	}

	if (!description) {
		throw new AppError("Business description is required", 400);
	}

	if (!category) {
		throw new AppError("Business category is required", 400);
	}

	return true;
};

module.exports = {
	validateBusinessData,
};
