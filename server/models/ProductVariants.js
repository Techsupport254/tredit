const ProductVariant = sequelize.define(
	"ProductVariant",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		product_id: { type: DataTypes.UUID, allowNull: false }, // Foreign key to Product
		variant_name: { type: DataTypes.STRING, allowNull: false },
		variant_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
		variant_stock: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		variant_sku: { type: DataTypes.STRING, allowNull: false, unique: true },
	},
	{
		indexes: [
			{ fields: ["product_id"] }, // Index for filtering by product
		],
	}
);
