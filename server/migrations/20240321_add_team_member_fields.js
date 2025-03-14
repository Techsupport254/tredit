"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("BusinessTeamMembers", "shift", {
			type: Sequelize.ENUM("morning", "afternoon", "night", "flexible"),
			allowNull: true,
		});

		await queryInterface.addColumn("BusinessTeamMembers", "employmentType", {
			type: Sequelize.ENUM(
				"full_time",
				"part_time",
				"contract",
				"temporary",
				"intern",
				"consultant"
			),
			allowNull: true,
		});

		await queryInterface.addColumn("BusinessTeamMembers", "salary", {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: {},
		});

		await queryInterface.addColumn("BusinessTeamMembers", "skills", {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: true,
			defaultValue: [],
		});

		await queryInterface.addColumn("BusinessTeamMembers", "certifications", {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: true,
			defaultValue: [],
		});

		await queryInterface.addColumn("BusinessTeamMembers", "emergencyContact", {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: {},
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("BusinessTeamMembers", "shift");
		await queryInterface.removeColumn("BusinessTeamMembers", "employmentType");
		await queryInterface.removeColumn("BusinessTeamMembers", "salary");
		await queryInterface.removeColumn("BusinessTeamMembers", "skills");
		await queryInterface.removeColumn("BusinessTeamMembers", "certifications");
		await queryInterface.removeColumn(
			"BusinessTeamMembers",
			"emergencyContact"
		);
	},
};
