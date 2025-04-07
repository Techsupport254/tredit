const { db } = require("../models");
const { Service, Business } = db;
const { checkBusinessOwnership } = require("../middleware/business");
const { Op } = require("sequelize");
const { DataTypes } = require("sequelize");

class ServiceController {
	// Create a new service
	async create(req, res) {
		try {
			const { businessId } = req.params;
			const serviceData = req.body;

			const service = await Service.create({
				...serviceData,
				businessId,
			});

			res.status(201).json({
				success: true,
				data: service,
			});
		} catch (error) {
			console.error("Error creating service:", error);
			res.status(500).json({
				success: false,
				message: "Failed to create service",
				error: error.message,
			});
		}
	}

	// Get all services for a business
	async getAllByBusiness(req, res) {
		try {
			const { businessId } = req.params;
			const services = await Service.findAll({
				where: { businessId },
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: services,
			});
		} catch (error) {
			console.error("Error fetching services:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch services",
				error: error.message,
			});
		}
	}

	// Get a single service
	async getOne(req, res) {
		try {
			const { serviceId } = req.params;

			// Find service with business association
			const service = await Service.findOne({
				where: { id: serviceId },
				include: [
					{
						model: Business,
						as: "business",
						attributes: ["id", "name", "description"],
					},
				],
			});

			if (!service) {
				return res.status(404).json({
					success: false,
					message: "Service not found",
					error: "Service with the specified ID does not exist",
				});
			}

			res.status(200).json({
				success: true,
				data: service,
			});
		} catch (error) {
			console.error("Error fetching service:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch service",
				error: error.message,
			});
		}
	}

	// Update a service
	async update(req, res) {
		try {
			const { businessId, serviceId } = req.params;
			const updateData = req.body;

			const service = await Service.findOne({
				where: { id: serviceId, businessId },
			});

			if (!service) {
				return res.status(404).json({
					success: false,
					message: "Service not found",
				});
			}

			await service.update(updateData);

			res.status(200).json({
				success: true,
				data: service,
			});
		} catch (error) {
			console.error("Error updating service:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update service",
				error: error.message,
			});
		}
	}

	// Delete a service
	async delete(req, res) {
		try {
			const { businessId, serviceId } = req.params;
			const service = await Service.findOne({
				where: { id: serviceId, businessId },
			});

			if (!service) {
				return res.status(404).json({
					success: false,
					message: "Service not found",
				});
			}

			await service.destroy();

			res.status(200).json({
				success: true,
				message: "Service deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting service:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete service",
				error: error.message,
			});
		}
	}
}

// Create a single instance and bind all methods
const serviceController = new ServiceController();

module.exports = serviceController;
