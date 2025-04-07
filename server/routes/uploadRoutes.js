const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
	uploadImageToPinata,
	uploadMultipleImagesToPinata,
	singleImageUpload,
	multipleImageUpload,
} = require("../utils/imageUploader");
const {
	errorResponse,
	successResponse,
	ResponseCodes,
} = require("../utils/responseHelper");

/**
 * @route POST /api/upload/image
 * @desc Upload a single image to Pinata IPFS
 * @access Private
 */
router.post("/image", protect, singleImageUpload("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res
				.status(400)
				.json(errorResponse("No image uploaded", ResponseCodes.BAD_REQUEST));
		}

		const result = await uploadImageToPinata(req.file);

		if (!result.success) {
			return res
				.status(500)
				.json(
					errorResponse(
						result.message || "Failed to upload image",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}

		return res
			.status(200)
			.json(successResponse(result, "Image uploaded successfully"));
	} catch (error) {
		console.error("Image upload error:", error);
		return res
			.status(500)
			.json(
				errorResponse(
					error.message || "Error uploading image",
					ResponseCodes.INTERNAL_SERVER_ERROR
				)
			);
	}
});

/**
 * @route POST /api/upload/images
 * @desc Upload multiple images to Pinata IPFS (max 10)
 * @access Private
 */
router.post(
	"/images",
	protect,
	multipleImageUpload("images", 10),
	async (req, res) => {
		try {
			if (!req.files || req.files.length === 0) {
				return res
					.status(400)
					.json(errorResponse("No images uploaded", ResponseCodes.BAD_REQUEST));
			}

			const result = await uploadMultipleImagesToPinata(req.files);

			if (!result.success) {
				return res.status(500).json(
					errorResponse(
						result.message || "Failed to upload images",
						ResponseCodes.INTERNAL_SERVER_ERROR,
						{
							partialSuccess: result.images || [],
						}
					)
				);
			}

			return res.status(200).json(
				successResponse(
					{
						count: result.images.length,
						images: result.images,
					},
					"Images uploaded successfully"
				)
			);
		} catch (error) {
			console.error("Multiple images upload error:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Error uploading images",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}
);

/**
 * @route POST /api/upload/business/:businessId/logo
 * @desc Upload a business logo
 * @access Private
 */
router.post(
	"/business/:businessId/logo",
	protect,
	singleImageUpload("logo"),
	async (req, res) => {
		try {
			const { businessId } = req.params;

			if (!req.file) {
				return res
					.status(400)
					.json(
						errorResponse("No logo image uploaded", ResponseCodes.BAD_REQUEST)
					);
			}

			const result = await uploadImageToPinata(
				req.file,
				`business_logo_${businessId}`
			);

			if (!result.success) {
				return res
					.status(500)
					.json(
						errorResponse(
							result.message || "Failed to upload logo",
							ResponseCodes.INTERNAL_SERVER_ERROR
						)
					);
			}

			// You could update the business with the logo URL here if needed
			// Update the business in the database with the new logo URL
			/*
    const business = await Business.findByPk(businessId);
    if (business) {
      await business.update({
        logo: result.ipfsUrl
      });
    }
    */

			return res.status(200).json(
				successResponse(
					{
						businessId,
						logo: {
							ipfsCid: result.ipfsCid,
							ipfsUrl: result.ipfsUrl,
						},
					},
					"Business logo uploaded successfully"
				)
			);
		} catch (error) {
			console.error("Business logo upload error:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Error uploading business logo",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}
);

/**
 * @route POST /api/upload/product/:productId/images
 * @desc Upload product images (max 10)
 * @access Private
 */
router.post(
	"/product/:productId/images",
	protect,
	multipleImageUpload("images", 10),
	async (req, res) => {
		try {
			const { productId } = req.params;

			if (!req.files || req.files.length === 0) {
				return res
					.status(400)
					.json(
						errorResponse(
							"No product images uploaded",
							ResponseCodes.BAD_REQUEST
						)
					);
			}

			const result = await uploadMultipleImagesToPinata(
				req.files,
				`product_${productId}`
			);

			if (!result.success) {
				return res.status(500).json(
					errorResponse(
						result.message || "Failed to upload product images",
						ResponseCodes.INTERNAL_SERVER_ERROR,
						{
							partialSuccess: result.images || [],
						}
					)
				);
			}

			// Update the product in the database with the new images if needed
			/*
    const product = await Product.findByPk(productId);
    if (product) {
      // Get existing media array or initialize empty array
      const existingMedia = product.media || [];
      
      // Add new image URLs
      const updatedMedia = [
        ...existingMedia,
        ...result.images.map(img => img.ipfsUrl)
      ];
      
      await product.update({
        media: updatedMedia
      });
    }
    */

			return res.status(200).json(
				successResponse(
					{
						productId,
						count: result.images.length,
						images: result.images,
					},
					"Product images uploaded successfully"
				)
			);
		} catch (error) {
			console.error("Product images upload error:", error);
			return res
				.status(500)
				.json(
					errorResponse(
						error.message || "Error uploading product images",
						ResponseCodes.INTERNAL_SERVER_ERROR
					)
				);
		}
	}
);

module.exports = router;
