const ProductMedia = sequelize.define("ProductMedia", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	productId: { type: DataTypes.UUID, allowNull: false },
	mediaType: { type: DataTypes.ENUM("image", "video"), allowNull: false },
	mediaUrl: { type: DataTypes.STRING, allowNull: false },
});

ProductMedia.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(ProductMedia, { foreignKey: "productId" });

module.exports = ProductMedia;
