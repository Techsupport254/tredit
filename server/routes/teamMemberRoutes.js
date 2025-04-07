const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
	Business,
	BusinessTeamMember,
	User,
	sequelize,
	Sequelize,
} = require("../models");
const { protect } = require("../middleware/authMiddleware");
const {
	errorResponse,
	successResponse,
	ResponseCodes,
} = require("../utils/responseHelper");

// Add a team member to a business
router.post("/:businessId/members", protect, async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { businessId } = req.params;
		const { email, role } = req.body;

		// Validate required fields
		if (!email) {
			await transaction.rollback();
			return res
				.status(400)
				.json(errorResponse("Email is required", ResponseCodes.BAD_REQUEST));
		}

		if (!role) {
			await transaction.rollback();
			return res
				.status(400)
				.json(errorResponse("Role is required", ResponseCodes.BAD_REQUEST));
		}

		// Check if business exists
		const business = await Business.findByPk(businessId);
		if (!business) {
			await transaction.rollback();
			return res
				.status(404)
				.json(
					errorResponse(
						"Business not found or has been deleted",
						ResponseCodes.NOT_FOUND
					)
				);
		}

		// Check if user has permission to add team members
		const isOwnerOrAdmin = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId: req.user.id,
				role: {
					[Op.in]: ["owner", "admin"],
				},
			},
		});

		if (!isOwnerOrAdmin && business.userId !== req.user.id) {
			await transaction.rollback();
			return res
				.status(403)
				.json(
					errorResponse(
						"You don't have permission to add team members. Only owners and admins can add team members.",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		// Check if the user exists in the database
		const user = await User.findOne({
			where: {
				email: email.toLowerCase().trim(),
			},
		});

		if (!user) {
			await transaction.rollback();
			return res
				.status(404)
				.json(
					errorResponse(
						`No user found with email ${email}. Please ensure the user has registered first.`,
						ResponseCodes.NOT_FOUND
					)
				);
		}

		// Check if user is already a team member
		const existingMember = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId: user.id,
			},
			paranoid: false, // Check even soft-deleted records
		});

		if (existingMember) {
			if (existingMember.deletedAt) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"This user was previously removed from the team. Please contact support to restore their access.",
							ResponseCodes.BAD_REQUEST
						)
					);
			}

			await transaction.rollback();
			return res
				.status(400)
				.json(
					errorResponse(
						`${email} is already a member of this business with role: ${existingMember.role}`,
						ResponseCodes.BAD_REQUEST
					)
				);
		}

		// Validate role
		const validRoles = [
			"owner",
			"admin",
			"manager",
			"accountant",
			"inventory_manager",
			"sales_representative",
			"marketing_specialist",
			"customer_service",
			"hr_manager",
			"content_creator",
			"logistics_coordinator",
			"quality_control",
			"procurement_specialist",
			"social_media_manager",
			"financial_analyst",
			"staff",
		];

		if (!validRoles.includes(role)) {
			await transaction.rollback();
			return res
				.status(400)
				.json(
					errorResponse(
						`Invalid role: ${role}. Valid roles are: ${validRoles.join(", ")}`,
						ResponseCodes.BAD_REQUEST
					)
				);
		}

		// Don't allow adding another owner if one exists
		if (role === "owner") {
			const existingOwner = await BusinessTeamMember.findOne({
				where: {
					businessId,
					role: "owner",
				},
			});

			if (existingOwner) {
				await transaction.rollback();
				return res
					.status(400)
					.json(
						errorResponse(
							"This business already has an owner. Please choose a different role.",
							ResponseCodes.BAD_REQUEST
						)
					);
			}
		}

		// Create team member
		const teamMember = await BusinessTeamMember.create(
			{
				businessId,
				userId: user.id,
				walletAddress: user.walletAddress,
				role,
				status: "pending",
				invitedBy: req.user.id,
				invitedAt: new Date(),
			},
			{ transaction }
		);

		await transaction.commit();

		// Fetch the created team member with user details
		const createdTeamMember = await BusinessTeamMember.findOne({
			where: { id: teamMember.id },
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage", "walletAddress"],
				},
			],
		});

		return res.status(201).json(
			successResponse({
				message: `Successfully added ${
					user.name || email
				} as a ${role} to the team`,
				teamMember: createdTeamMember,
			})
		);
	} catch (error) {
		await transaction.rollback();
		console.error("Error adding team member:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					"An unexpected error occurred while adding the team member. Please try again.",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Get all team members for a business
router.get("/:businessId/members", protect, async (req, res) => {
	try {
		const { businessId } = req.params;

		// Check if business exists and user has permission
		const business = await Business.findByPk(businessId);
		if (!business) {
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
		}

		// Check if user has permission to view team members
		const isTeamMember = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId: req.user.id,
			},
		});

		if (!isTeamMember && business.userId !== req.user.id) {
			return res
				.status(403)
				.json(
					errorResponse(
						"You don't have permission to view team members",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		// Get all team members
		const teamMembers = await BusinessTeamMember.findAll({
			where: { businessId },
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		return res.json(
			successResponse({
				message: "Team members retrieved successfully",
				teamMembers,
			})
		);
	} catch (error) {
		console.error("Error fetching team members:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Failed to fetch team members",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Update team member
router.put("/:businessId/members/:memberId", protect, async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { businessId, memberId } = req.params;
		const { role, position, department, permissions, status } = req.body;

		// Check if business exists
		const business = await Business.findByPk(businessId);
		if (!business) {
			await transaction.rollback();
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
		}

		// Check if user has permission to update team members
		const isOwnerOrAdmin = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId: req.user.id,
				role: {
					[sequelize.Op.in]: ["owner", "admin"],
				},
			},
		});

		if (!isOwnerOrAdmin && business.userId !== req.user.id) {
			await transaction.rollback();
			return res
				.status(403)
				.json(
					errorResponse(
						"You don't have permission to update team members",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		// Update team member
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				id: memberId,
				businessId,
			},
		});

		if (!teamMember) {
			await transaction.rollback();
			return res
				.status(404)
				.json(errorResponse("Team member not found", ResponseCodes.NOT_FOUND));
		}

		await teamMember.update(
			{
				role,
				position,
				department,
				permissions,
				status,
				updatedBy: req.user.id,
			},
			{ transaction }
		);

		await transaction.commit();

		// Fetch updated team member with user details
		const updatedTeamMember = await BusinessTeamMember.findOne({
			where: { id: memberId },
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "name", "email", "profileImage"],
				},
			],
		});

		return res.json(
			successResponse({
				message: "Team member updated successfully",
				teamMember: updatedTeamMember,
			})
		);
	} catch (error) {
		await transaction.rollback();
		console.error("Error updating team member:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Failed to update team member",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

// Remove team member
router.delete("/:businessId/members/:memberId", protect, async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
		const { businessId, memberId } = req.params;

		// Check if business exists
		const business = await Business.findByPk(businessId);
		if (!business) {
			await transaction.rollback();
			return res
				.status(404)
				.json(errorResponse("Business not found", ResponseCodes.NOT_FOUND));
		}

		// Check if user has permission to remove team members
		const isOwnerOrAdmin = await BusinessTeamMember.findOne({
			where: {
				businessId,
				userId: req.user.id,
				role: {
					[Op.in]: ["owner", "admin"],
				},
			},
		});

		if (!isOwnerOrAdmin && business.userId !== req.user.id) {
			await transaction.rollback();
			return res
				.status(403)
				.json(
					errorResponse(
						"You don't have permission to remove team members",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		// Find and remove team member
		const teamMember = await BusinessTeamMember.findOne({
			where: {
				id: memberId,
				businessId,
			},
		});

		if (!teamMember) {
			await transaction.rollback();
			return res
				.status(404)
				.json(errorResponse("Team member not found", ResponseCodes.NOT_FOUND));
		}

		// Don't allow removing the owner
		if (teamMember.role === "owner") {
			await transaction.rollback();
			return res
				.status(403)
				.json(
					errorResponse(
						"Cannot remove the business owner",
						ResponseCodes.FORBIDDEN
					)
				);
		}

		await teamMember.destroy({ transaction });

		await transaction.commit();

		return res.json(
			successResponse({
				message: "Team member removed successfully",
				memberId,
			})
		);
	} catch (error) {
		await transaction.rollback();
		console.error("Error removing team member:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Failed to remove team member",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

module.exports = router;
