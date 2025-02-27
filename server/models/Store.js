const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Store = sequelize.define("Store", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	ownerAddress: { type: DataTypes.STRING, allowNull: false },
	storeData: { type: DataTypes.STRING, allowNull: false }, // IPFS hash or metadata URL
});

module.exports = Store;
