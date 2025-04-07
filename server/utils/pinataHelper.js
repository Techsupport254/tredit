const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { blockchainConfig } = require("../config/config");

const PINATA_API_KEY = blockchainConfig.PINATA_API_KEY;
const PINATA_API_SECRET = blockchainConfig.PINATA_API_SECRET;
const PINATA_BASE_URL =
	blockchainConfig.PINATA_BASE_URL || "https://api.pinata.cloud";
const PINATA_GATEWAY_URL =
	blockchainConfig.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";

/**
 * Upload data to Pinata
 * @param {string|Buffer} data - The data to upload (can be string, Buffer, or file path)
 * @param {Object} options - Additional options
 * @param {string} [options.name] - Name for the file
 * @param {string} [options.type] - MIME type of the data
 * @returns {Promise<Object>} - Pinata response with CID
 */
async function uploadToPinata(data, options = {}) {
	try {
		const formData = new FormData();

		// Handle different types of data
		if (typeof data === "string") {
			// If it's a file path
			if (fs.existsSync(data)) {
				formData.append("file", fs.createReadStream(data));
			} else {
				// If it's a string content
				formData.append("file", Buffer.from(data), {
					filename: options.name || "data.txt",
					contentType: options.type || "text/plain",
				});
			}
		} else if (Buffer.isBuffer(data)) {
			formData.append("file", data, {
				filename: options.name || "data.bin",
				contentType: options.type || "application/octet-stream",
			});
		} else {
			throw new Error(
				"Invalid data type. Must be string, Buffer, or file path."
			);
		}

		// Add metadata if provided
		if (options.metadata) {
			formData.append("pinataMetadata", JSON.stringify(options.metadata));
		}

		const response = await axios.post(
			`${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
			formData,
			{
				maxBodyLength: Infinity,
				headers: {
					"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);

		return {
			cid: response.data.IpfsHash,
			url: `${PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`,
			size: response.data.PinSize,
			timestamp: response.data.Timestamp,
		};
	} catch (error) {
		console.error("Error uploading to Pinata:", error);
		throw new Error(`Failed to upload to Pinata: ${error.message}`);
	}
}

/**
 * Get data from Pinata using CID
 * @param {string} cid - The CID of the data
 * @returns {Promise<Buffer>} - The data as Buffer
 */
async function getFromPinata(cid) {
	try {
		const response = await axios.get(`${PINATA_GATEWAY_URL}/ipfs/${cid}`, {
			responseType: "arraybuffer",
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching from Pinata:", error);
		throw new Error(`Failed to fetch from Pinata: ${error.message}`);
	}
}

/**
 * Delete data from Pinata using CID
 * @param {string} cid - The CID of the data to delete
 * @returns {Promise<Object>} - Pinata response
 */
async function deleteFromPinata(cid) {
	try {
		const response = await axios.delete(
			`${PINATA_BASE_URL}/pinning/unpin/${cid}`,
			{
				headers: {
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error deleting from Pinata:", error);
		throw new Error(`Failed to delete from Pinata: ${error.message}`);
	}
}

/**
 * Upload JSON data to Pinata
 * @param {Object} jsonData - The JSON data to upload
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Pinata response with CID
 */
async function uploadJsonToPinata(jsonData, options = {}) {
	try {
		const response = await axios.post(
			`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
			{
				pinataContent: jsonData,
				pinataMetadata: options.metadata || {},
			},
			{
				headers: {
					"Content-Type": "application/json",
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			}
		);

		return {
			cid: response.data.IpfsHash,
			url: `${PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`,
			size: response.data.PinSize,
			timestamp: response.data.Timestamp,
		};
	} catch (error) {
		console.error("Error uploading JSON to Pinata:", error);
		throw new Error(`Failed to upload JSON to Pinata: ${error.message}`);
	}
}

module.exports = {
	uploadToPinata,
	getFromPinata,
	deleteFromPinata,
	uploadJsonToPinata,
};
