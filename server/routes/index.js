const express = require("express");
const userRoutes = require("./userRoutes");
const googleRoutes = require("./googleRoutes");
const authRoutes = require("./auth.routes");
const businessRoutes = require("./businessRoutes");
const youtubeRoutes = require("./youtube");
const teamMemberRoutes = require("./teamMemberRoutes");
const AppError = require("../utils/appError");

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
	res.json({
		status: "success",
		message: "Server is healthy",
		timestamp: new Date().toISOString(),
	});
});

// API routes
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/google", googleRoutes);
router.use("/businesses", businessRoutes);
router.use("/youtube", youtubeRoutes);
router.use("/team-members", teamMemberRoutes);

// 404 handler for undefined routes
router.use("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = router;
