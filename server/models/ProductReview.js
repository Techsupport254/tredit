const ProductReview = sequelize.define(
	"ProductReview",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		product_id: { type: DataTypes.UUID, allowNull: false }, // Foreign key to Product
		reviewer_name: { type: DataTypes.STRING, allowNull: false },
		reviewer_email: { type: DataTypes.STRING, allowNull: false },
		review_rating: { type: DataTypes.INTEGER, allowNull: false },
		review_title: { type: DataTypes.STRING, allowNull: true },
		review_content: { type: DataTypes.TEXT, allowNull: false },
		review_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		review_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
	},
	{
		indexes: [
			{ fields: ["product_id"] }, // Index for filtering by product
		],
	}
);
