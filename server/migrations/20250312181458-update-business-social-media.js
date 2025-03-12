"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// First, update existing rows to have the new default structure
		await queryInterface.sequelize.query(`
      UPDATE "Businesses"
      SET "socialMedia" = '{
        "facebook": {
          "isConnected": false,
          "permissions": [],
          "metadata": {}
        },
        "instagram": {
          "isConnected": false,
          "permissions": [],
          "metadata": {}
        },
        "tiktok": {
          "isConnected": false,
          "permissions": [],
          "metadata": {}
        },
        "youtube": {
          "isConnected": false,
          "permissions": [],
          "metadata": {}
        }
      }'::jsonb
      WHERE "socialMedia" IS NULL OR "socialMedia" = '{}'::jsonb;
    `);

		// Then, ensure the column is JSONB type with the default value
		await queryInterface.changeColumn("Businesses", "socialMedia", {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: {
				facebook: {
					isConnected: false,
					permissions: [],
					metadata: {},
				},
				instagram: {
					isConnected: false,
					permissions: [],
					metadata: {},
				},
				tiktok: {
					isConnected: false,
					permissions: [],
					metadata: {},
				},
				youtube: {
					isConnected: false,
					permissions: [],
					metadata: {},
				},
			},
		});
	},

	async down(queryInterface, Sequelize) {
		// Revert to original state (keeping the column but removing default value)
		await queryInterface.changeColumn("Businesses", "socialMedia", {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: null,
		});
	},
};
