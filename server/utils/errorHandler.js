const AppError = require("./appError");

const handleError = (err) => {
	if (err instanceof AppError) {
		return err;
	}

	// Handle Sequelize validation errors
	if (err.name === "SequelizeValidationError") {
		const message = err.errors.map((e) => e.message).join(", ");
		return new AppError(message, 400);
	}

	// Handle Sequelize unique constraint errors
	if (err.name === "SequelizeUniqueConstraintError") {
		const message = "Duplicate field value entered";
		return new AppError(message, 400);
	}

	// Handle other database errors
	if (err.name === "SequelizeDatabaseError") {
		return new AppError("Database error occurred", 500);
	}

	// For all other errors
	return new AppError("Something went wrong", 500);
};

module.exports = {
	handleError,
};
