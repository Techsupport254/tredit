module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			// Create enum types
			await queryInterface.sequelize.query(
				`CREATE TYPE "enum_Users_role" AS ENUM ('user', 'admin');
         CREATE TYPE "enum_Users_gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
         CREATE TYPE "enum_UserLoginHistories_deviceType" AS ENUM ('desktop', 'mobile', 'tablet', 'other');
         CREATE TYPE "enum_UserLoginHistories_status" AS ENUM ('success', 'failed');`,
				{ transaction }
			);

			// Create Users table
			await queryInterface.createTable(
				"Users",
				{
					walletAddress: {
						type: Sequelize.STRING,
						primaryKey: true,
						allowNull: false,
					},
					name: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					email: {
						type: Sequelize.STRING,
						unique: true,
						allowNull: true,
					},
					profileImage: {
						type: Sequelize.STRING(1024),
						allowNull: true,
					},
					gender: {
						type: "enum_Users_gender",
						allowNull: true,
					},
					dob: {
						type: Sequelize.DATEONLY,
						allowNull: true,
					},
					phoneNumber: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					location: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					role: {
						type: "enum_Users_role",
						allowNull: false,
						defaultValue: "user",
					},
					isVerified: {
						type: Sequelize.BOOLEAN,
						allowNull: false,
						defaultValue: false,
					},
					verificationToken: {
						type: Sequelize.STRING,
						allowNull: true,
						unique: true,
					},
					lastLogin: {
						type: Sequelize.DATE,
						allowNull: true,
					},
					preferences: {
						type: Sequelize.JSONB,
						allowNull: true,
						defaultValue: {
							theme: "light",
							notifications: {
								email: true,
								push: true,
							},
							language: "en",
						},
					},
					bio: {
						type: Sequelize.TEXT,
						allowNull: true,
					},
					ipfsCid: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					ipfsUrl: {
						type: Sequelize.STRING(1024),
						allowNull: true,
					},
					blockchainTxHash: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					lastBlockchainUpdate: {
						type: Sequelize.DATE,
						allowNull: true,
					},
					metadata: {
						type: Sequelize.JSONB,
						allowNull: true,
						defaultValue: {},
					},
					uid: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					acceptBlockchainStorage: {
						type: Sequelize.BOOLEAN,
						allowNull: false,
						defaultValue: true,
					},
					createdAt: {
						type: Sequelize.DATE,
						allowNull: false,
					},
					updatedAt: {
						type: Sequelize.DATE,
						allowNull: false,
					},
				},
				{ transaction }
			);

			// Create UserLoginHistories table
			await queryInterface.createTable(
				"UserLoginHistories",
				{
					id: {
						type: Sequelize.UUID,
						defaultValue: Sequelize.UUIDV4,
						primaryKey: true,
					},
					userAddress: {
						type: Sequelize.STRING,
						allowNull: false,
						references: {
							model: "Users",
							key: "walletAddress",
						},
					},
					ipAddress: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					userAgent: {
						type: Sequelize.STRING(1024),
						allowNull: true,
					},
					browser: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					browserVersion: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					os: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					osVersion: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					device: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					deviceType: {
						type: "enum_UserLoginHistories_deviceType",
						allowNull: true,
					},
					status: {
						type: "enum_UserLoginHistories_status",
						allowNull: false,
						defaultValue: "success",
					},
					failureReason: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					loginMethod: {
						type: Sequelize.STRING,
						allowNull: false,
						defaultValue: "wallet",
					},
					location: {
						type: Sequelize.JSON,
						allowNull: true,
					},
					createdAt: {
						type: Sequelize.DATE,
						allowNull: false,
					},
					updatedAt: {
						type: Sequelize.DATE,
						allowNull: false,
					},
				},
				{ transaction }
			);

			// Add indexes
			await queryInterface.addIndex("Users", ["walletAddress"], {
				unique: true,
				transaction,
			});
			await queryInterface.addIndex("Users", ["email"], {
				unique: true,
				transaction,
			});
			await queryInterface.addIndex("UserLoginHistories", ["userAddress"], {
				transaction,
			});
			await queryInterface.addIndex("UserLoginHistories", ["createdAt"], {
				transaction,
			});
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			// Drop tables
			await queryInterface.dropTable("UserLoginHistories", { transaction });
			await queryInterface.dropTable("Users", { transaction });

			// Drop enum types
			await queryInterface.sequelize.query(
				`DROP TYPE IF EXISTS "enum_Users_role" CASCADE;
         DROP TYPE IF EXISTS "enum_Users_gender" CASCADE;
         DROP TYPE IF EXISTS "enum_UserLoginHistories_deviceType" CASCADE;
         DROP TYPE IF EXISTS "enum_UserLoginHistories_status" CASCADE;`,
				{ transaction }
			);
		});
	},
};
