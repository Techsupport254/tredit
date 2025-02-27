const ProductShipping = sequelize.define(
	"ProductShipping",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		product_id: { type: DataTypes.UUID, allowNull: false }, // Foreign key to Product
		shipping_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
		shipping_time: { type: DataTypes.STRING, allowNull: true },
		free_shipping: { type: DataTypes.BOOLEAN, defaultValue: false },
		return_policy: { type: DataTypes.TEXT, allowNull: true },
		warranty: { type: DataTypes.TEXT, allowNull: true },
	},
	{
		indexes: [
			{ fields: ["product_id"] }, // Index for filtering by product
		],
	}
);
