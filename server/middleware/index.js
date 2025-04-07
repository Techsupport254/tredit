const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { errorHandler } = require("./errorHandler");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const { corsConfig, sessionConfig } = require("../config/config");

const setupMiddleware = (app) => {
	// Security middleware
	app.use(helmet());

	// CORS configuration
	app.use(cors(corsConfig));

	// Logging middleware
	if (process.env.NODE_ENV === "development") {
		app.use(morgan("dev"));
	}

	// Compression middleware
	app.use(compression());

	// Basic middleware
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Session
	app.use(session(sessionConfig));

	// Error handling (should be last)
	app.use(errorHandler);
};

module.exports = setupMiddleware;
