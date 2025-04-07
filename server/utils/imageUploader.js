const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { blockchainConfig } = require("../config/config");
const multer = require("multer");

// Get Pinata config with fallbacks
const {
	PINATA_API_KEY = process.env.PINATA_API_KEY,
	PINATA_API_SECRET = process.env.PINATA_API_SECRET,
	PINATA_BASE_URL = process.env.PINATA_BASE_URL || "https://api.pinata.cloud",
	PINATA_JWT = process.env.PINATA_JWT,
	PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL ||
		"https://gateway.pinata.cloud/ipfs",
} = blockchainConfig;

// Configure multer storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, "../uploads");
		// Create uploads directory if it doesn't exist
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix + ext);
	},
});

// Configure file filter to only accept images
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed!"), false);
	}
};

// Create multer upload instance
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB
	},
});

// Helper to delete temporary file
const unlinkAsync = promisify(fs.unlink);

/**
 * Upload a single image file to Pinata IPFS
 * @param {Object} file - The file object from multer (req.file)
 * @param {string} name - Optional name for the file
 * @returns {Promise<{success: boolean, ipfsCid: string, ipfsUrl: string, message?: string}>}
 */
const uploadImageToPinata = async (file, name = "") => {
	try {
		if (!file) {
			return {
				success: false,
				message: "No file provided",
			};
		}

		const formData = new FormData();

		// Add the file to form data
		const fileStream = fs.createReadStream(file.path);
		formData.append("file", fileStream);

		// Add metadata
		const metadata = JSON.stringify({
			name: name || `${file.originalname}_${Date.now()}`,
			keyvalues: {
				uploadedAt: new Date().toISOString(),
				originalName: file.originalname,
				mimeType: file.mimetype,
				size: file.size,
			},
		});
		formData.append("pinataMetadata", metadata);

		// Add pinata options
		const pinataOptions = JSON.stringify({
			cidVersion: 1,
		});
		formData.append("pinataOptions", pinataOptions);

		// Upload to Pinata
		const response = await axios.post(
			`${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
			formData,
			{
				maxBodyLength: "Infinity",
				headers: {
					"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);

		// Clean up the temporary file
		await unlinkAsync(file.path);

		return {
			success: true,
			ipfsCid: response.data.IpfsHash,
			ipfsUrl: `${PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`,
		};
	} catch (error) {
		// Clean up the temporary file if it exists
		if (file && file.path && fs.existsSync(file.path)) {
			await unlinkAsync(file.path).catch((err) =>
				console.error("Error deleting temp file:", err)
			);
		}

		console.error(
			"Error uploading to Pinata:",
			error.response?.data || error.message
		);
		return {
			success: false,
			message:
				"Failed to upload image to Pinata: " +
				(error.response?.data?.error || error.message),
		};
	}
};

/**
 * Upload multiple image files to Pinata IPFS
 * @param {Array<Object>} files - Array of file objects from multer (req.files)
 * @param {string} prefix - Optional prefix for the file names
 * @returns {Promise<{success: boolean, images?: Array<{ipfsCid: string, ipfsUrl: string}>, message?: string}>}
 */
const uploadMultipleImagesToPinata = async (files, prefix = "") => {
	try {
		if (!files || !Array.isArray(files) || files.length === 0) {
			return {
				success: false,
				message: "No files provided",
			};
		}

		const uploadPromises = files.map((file) => {
			const name = prefix
				? `${prefix}_${file.originalname}`
				: file.originalname;
			return uploadImageToPinata(file, name);
		});

		const results = await Promise.all(uploadPromises);

		// Check if any uploads failed
		const failedUploads = results.filter((result) => !result.success);
		if (failedUploads.length > 0) {
			return {
				success: false,
				message: `${failedUploads.length} out of ${files.length} uploads failed`,
				images: results
					.filter((result) => result.success)
					.map((result) => ({
						ipfsCid: result.ipfsCid,
						ipfsUrl: result.ipfsUrl,
					})),
				errors: failedUploads.map((result) => result.message),
			};
		}

		return {
			success: true,
			images: results.map((result) => ({
				ipfsCid: result.ipfsCid,
				ipfsUrl: result.ipfsUrl,
			})),
		};
	} catch (error) {
		console.error("Error uploading multiple images to Pinata:", error);
		return {
			success: false,
			message: "Failed to upload images to Pinata: " + error.message,
		};
	}
};

// Middleware for handling single image upload
const singleImageUpload = (fieldName = "image") => {
	return upload.single(fieldName);
};

// Middleware for handling multiple image uploads
const multipleImageUpload = (fieldName = "images", maxCount = 10) => {
	return upload.array(fieldName, maxCount);
};

module.exports = {
	uploadImageToPinata,
	uploadMultipleImagesToPinata,
	singleImageUpload,
	multipleImageUpload,
};
