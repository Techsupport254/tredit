const { StoreUser, Store, User } = require("../models");
const { ValidationError } = require("sequelize");

const storeUserController = {
	// Add a user to store with roles
	async addUserToStore(req, res) {
		try {
			const { storeId, userAddress, roles } = req.body;
			const invitedBy = req.user.walletAddress;

			// Validate store exists
			const store = await Store.findOne({ where: { name: storeId } });
			if (!store) {
				return res.status(404).json({ error: "Store not found" });
			}

			// Validate user exists
			const user = await User.findOne({
				where: { walletAddress: userAddress },
			});
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			// Check if user is already in store
			const existingStoreUser = await StoreUser.findOne({
				where: { storeId, userAddress },
			});

			if (existingStoreUser) {
				return res.status(400).json({ error: "User already exists in store" });
			}

			// Create store user with roles
			const storeUser = await StoreUser.create({
				storeId,
				userAddress,
				roles,
				invitedBy,
				invitedAt: new Date(),
				status: "pending",
			});

			res.status(201).json(storeUser);
		} catch (error) {
			if (error instanceof ValidationError) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: "Failed to add user to store" });
			}
		}
	},

	// Update user roles in store
	async updateUserRoles(req, res) {
		try {
			const { storeId, userAddress, roles } = req.body;

			const storeUser = await StoreUser.findOne({
				where: { storeId, userAddress },
			});

			if (!storeUser) {
				return res.status(404).json({ error: "Store user not found" });
			}

			// Update roles
			await storeUser.update({ roles });

			res.json(storeUser);
		} catch (error) {
			if (error instanceof ValidationError) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: "Failed to update user roles" });
			}
		}
	},

	// Get all users in a store
	async getStoreUsers(req, res) {
		try {
			const { storeId } = req.params;

			const storeUsers = await StoreUser.findAll({
				where: { storeId },
				include: [
					{
						model: User,
						attributes: ["name", "email", "profileImage"],
					},
				],
			});

			res.json(storeUsers);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch store users" });
		}
	},

	// Get user roles in a store
	async getUserRoles(req, res) {
		try {
			const { storeId, userAddress } = req.params;

			const storeUser = await StoreUser.findOne({
				where: { storeId, userAddress },
			});

			if (!storeUser) {
				return res.status(404).json({ error: "Store user not found" });
			}

			res.json({
				roles: storeUser.roles,
				permissions: storeUser.permissions,
			});
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch user roles" });
		}
	},

	// Remove user from store
	async removeUserFromStore(req, res) {
		try {
			const { storeId, userAddress } = req.params;

			const storeUser = await StoreUser.findOne({
				where: { storeId, userAddress },
			});

			if (!storeUser) {
				return res.status(404).json({ error: "Store user not found" });
			}

			// Don't allow removing store owner
			const store = await Store.findOne({ where: { name: storeId } });
			if (store.ownerAddress === userAddress) {
				return res.status(403).json({ error: "Cannot remove store owner" });
			}

			await storeUser.destroy();
			res.json({ message: "User removed from store" });
		} catch (error) {
			res.status(500).json({ error: "Failed to remove user from store" });
		}
	},

	// Update user status in store
	async updateUserStatus(req, res) {
		try {
			const { storeId, userAddress, status } = req.body;

			const storeUser = await StoreUser.findOne({
				where: { storeId, userAddress },
			});

			if (!storeUser) {
				return res.status(404).json({ error: "Store user not found" });
			}

			await storeUser.update({ status });
			res.json(storeUser);
		} catch (error) {
			if (error instanceof ValidationError) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: "Failed to update user status" });
			}
		}
	},
};

module.exports = storeUserController;
