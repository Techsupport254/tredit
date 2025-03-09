const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { errorHandler } = require("./errorHandler");
const config = require("../config/app.config");

const setupMiddleware = (app) => {
	// Basic middleware
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// CORS
	app.use(cors(config.cors));

	// Session
	app.use(session(config.session));

	// Error handling (should be last)
	app.use(errorHandler);
};

module.exports = setupMiddleware;
