module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("BusinessTeamMembers", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "Businesses",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			walletAddress: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: "Users",
					key: "walletAddress",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			role: {
				type: Sequelize.ENUM(
					"owner",
					"manager",
					"staff",
					"accountant",
					"support"
				),
				allowNull: false,
			},
			permissions: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
				defaultValue: [],
			},
			status: {
				type: Sequelize.ENUM("active", "inactive"),
				allowNull: false,
				defaultValue: "active",
			},
			metadata: {
				type: Sequelize.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		// Add indexes
		await queryInterface.addIndex(
			"BusinessTeamMembers",
			["businessId", "walletAddress"],
			{
				unique: true,
			}
		);
		await queryInterface.addIndex("BusinessTeamMembers", ["role"]);
		await queryInterface.addIndex("BusinessTeamMembers", ["status"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("BusinessTeamMembers");
	},
};
