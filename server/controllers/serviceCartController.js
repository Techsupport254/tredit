const { db } = require("../models");
const { ServiceCart, Service, Business, User } = db;
const { Op } = require("sequelize");

class ServiceCartController {
	// Create or get service cart
	async getOrCreate(req, res) {
		try {
			const { userId } = req;
			const { serviceId } = req.body;

			let cart = await ServiceCart.findOne({
				where: {
					userId,
					serviceId,
					status: "active",
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
				],
			});

			if (!cart) {
				const service = await Service.findByPk(serviceId, {
					include: [{ model: Business, as: "business" }],
				});

				if (!service) {
					return res.status(404).json({
						success: false,
						message: "Service not found",
					});
				}

				cart = await ServiceCart.create({
					userId,
					serviceId,
					totalAmount: service.basePrice,
					currency: service.currency,
				});

				// Reload cart with associations
				cart = await ServiceCart.findByPk(cart.id, {
					include: [
						{
							model: Service,
							as: "service",
							include: [
								{
									model: Business,
									as: "business",
								},
							],
						},
					],
				});
			}

			res.status(200).json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error in getOrCreate service cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to get or create service cart",
				error: error.message,
			});
		}
	}

	// Update service cart
	async update(req, res) {
		try {
			const { cartId } = req.params;
			const updateData = req.body;
			const { userId } = req;

			const cart = await ServiceCart.findOne({
				where: {
					id: cartId,
					userId,
					status: "active",
				},
			});

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Service cart not found",
				});
			}

			// Update cart with new data
			await cart.update(updateData);

			// Reload cart with associations
			const updatedCart = await ServiceCart.findByPk(cart.id, {
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
				],
			});

			res.status(200).json({
				success: true,
				data: updatedCart,
			});
		} catch (error) {
			console.error("Error updating service cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update service cart",
				error: error.message,
			});
		}
	}

	// Add milestone to cart
	async addMilestone(req, res) {
		try {
			const { cartId } = req.params;
			const { milestoneOrder } = req.body;
			const { userId } = req;

			const cart = await ServiceCart.findOne({
				where: {
					id: cartId,
					userId,
					status: "active",
				},
				include: [
					{
						model: Service,
						as: "service",
					},
				],
			});

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Service cart not found",
				});
			}

			const milestone = cart.service.milestones.find(
				(m) => m.order === milestoneOrder
			);
			if (!milestone) {
				return res.status(404).json({
					success: false,
					message: "Milestone not found",
				});
			}

			// Calculate milestone amount
			const milestoneAmount =
				(cart.service.basePrice * milestone.percentagePayment) / 100;

			// Add milestone to selected milestones
			const selectedMilestones = [...cart.selectedMilestones];
			if (!selectedMilestones.some((m) => m.order === milestoneOrder)) {
				selectedMilestones.push({
					order: milestone.order,
					name: milestone.name,
					percentagePayment: milestone.percentagePayment,
					amount: milestoneAmount,
				});
			}

			// Update cart
			await cart.update({
				selectedMilestones,
				totalAmount: selectedMilestones.reduce((sum, m) => sum + m.amount, 0),
			});

			res.status(200).json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error adding milestone to cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add milestone to cart",
				error: error.message,
			});
		}
	}

	// Remove milestone from cart
	async removeMilestone(req, res) {
		try {
			const { cartId } = req.params;
			const { milestoneOrder } = req.body;
			const { userId } = req;

			const cart = await ServiceCart.findOne({
				where: {
					id: cartId,
					userId,
					status: "active",
				},
			});

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Service cart not found",
				});
			}

			// Remove milestone from selected milestones
			const selectedMilestones = cart.selectedMilestones.filter(
				(m) => m.order !== milestoneOrder
			);

			// Update cart
			await cart.update({
				selectedMilestones,
				totalAmount: selectedMilestones.reduce((sum, m) => sum + m.amount, 0),
			});

			res.status(200).json({
				success: true,
				data: cart,
			});
		} catch (error) {
			console.error("Error removing milestone from cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to remove milestone from cart",
				error: error.message,
			});
		}
	}

	// Get user's service carts
	async getUserCarts(req, res) {
		try {
			const { userId } = req;

			const carts = await ServiceCart.findAll({
				where: {
					userId,
					status: "active",
				},
				include: [
					{
						model: Service,
						as: "service",
						include: [
							{
								model: Business,
								as: "business",
							},
						],
					},
				],
				order: [["updatedAt", "DESC"]],
			});

			res.status(200).json({
				success: true,
				data: carts,
			});
		} catch (error) {
			console.error("Error fetching user service carts:", error);
			res.status(500).json({
				success: false,
				message: "Failed to fetch service carts",
				error: error.message,
			});
		}
	}

	// Delete service cart
	async delete(req, res) {
		try {
			const { cartId } = req.params;
			const { userId } = req;

			const cart = await ServiceCart.findOne({
				where: {
					id: cartId,
					userId,
				},
			});

			if (!cart) {
				return res.status(404).json({
					success: false,
					message: "Service cart not found",
				});
			}

			await cart.destroy();

			res.status(200).json({
				success: true,
				message: "Service cart deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting service cart:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete service cart",
				error: error.message,
			});
		}
	}
}

module.exports = new ServiceCartController();
