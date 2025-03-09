const axios = require("axios");
const FormData = require("form-data");

class PinataManager {
	constructor() {
		this.apiKey = process.env.PINATA_API_KEY;
		this.apiSecret = process.env.PINATA_API_SECRET;
		this.baseURL = "https://api.pinata.cloud";
		this.headers = {
			pinata_api_key: this.apiKey,
			pinata_secret_api_key: this.apiSecret,
		};
	}

	/**
	 * Upload content to Pinata
	 * @param {Object} data - The data to upload
	 * @param {string} name - Name for the file
	 * @returns {Promise<{cid: string, url: string}>}
	 */
	async uploadContent(data, name) {
		try {
			const response = await axios.post(
				`${this.baseURL}/pinning/pinJSONToIPFS`,
				{
					pinataContent: data,
					pinataMetadata: {
						name: `${name}_${Date.now()}`,
					},
					pinataOptions: {
						cidVersion: 1,
					},
				},
				{ headers: this.headers }
			);

			return {
				cid: response.data.IpfsHash,
				url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
			};
		} catch (error) {
			console.error(
				"Pinata Upload Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to upload to Pinata");
		}
	}

	/**
	 * Get content from Pinata and merge with new data
	 * @param {string} cid - The CID of the content
	 * @param {Object} newData - New data to merge
	 * @param {string} dataKey - Key under which to store the new data
	 * @returns {Promise<Object>}
	 */
	async mergeWithExisting(cid, newData, dataKey) {
		try {
			// Get existing content
			const existingContent = await this.getContent(cid);

			// Create merged content
			const mergedContent = {
				...existingContent,
				[dataKey]: newData,
			};

			return mergedContent;
		} catch (error) {
			console.error(
				"Content Merge Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to merge content");
		}
	}

	/**
	 * Update existing content while preserving data
	 * @param {string} existingCid - The existing CID
	 * @param {Object} newData - New data to add
	 * @param {string} dataKey - Key under which to store the new data
	 * @param {string} name - Name for the file
	 * @returns {Promise<{cid: string, url: string}>}
	 */
	async updateWithMerge(existingCid, newData, dataKey, name) {
		try {
			// Merge existing content with new data
			const mergedContent = await this.mergeWithExisting(
				existingCid,
				newData,
				dataKey
			);

			// Upload merged content
			return await this.uploadContent(mergedContent, name);
		} catch (error) {
			console.error(
				"Update Merge Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to update and merge content");
		}
	}

	/**
	 * Get content from Pinata
	 * @param {string} cid - The CID of the content
	 * @returns {Promise<Object>}
	 */
	async getContent(cid) {
		try {
			const response = await axios.get(
				`https://gateway.pinata.cloud/ipfs/${cid}`
			);
			return response.data;
		} catch (error) {
			console.error(
				"Pinata Get Content Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to get content from Pinata");
		}
	}

	/**
	 * Unpin content from Pinata
	 * @param {string} cid - The CID to unpin
	 * @returns {Promise<void>}
	 */
	async unpinContent(cid) {
		try {
			await axios.delete(`${this.baseURL}/pinning/unpin/${cid}`, {
				headers: this.headers,
			});
		} catch (error) {
			console.error(
				"Pinata Unpin Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to unpin content from Pinata");
		}
	}

	/**
	 * List all pinned content
	 * @returns {Promise<Array>}
	 */
	async listContent() {
		try {
			const response = await axios.get(
				`${this.baseURL}/data/pinList?status=pinned`,
				{ headers: this.headers }
			);
			return response.data.rows;
		} catch (error) {
			console.error(
				"Pinata List Error:",
				error.response?.data || error.message
			);
			throw new Error("Failed to list Pinata content");
		}
	}

	/**
	 * Test Pinata connection
	 * @returns {Promise<boolean>}
	 */
	async testAuthentication() {
		try {
			await axios.get(`${this.baseURL}/data/testAuthentication`, {
				headers: this.headers,
			});
			return true;
		} catch (error) {
			console.error(
				"Pinata Auth Error:",
				error.response?.data || error.message
			);
			return false;
		}
	}

	/**
	 * Replace specific data in existing content
	 * @param {string} cid - The CID of the content
	 * @param {Object} newData - New data to replace
	 * @param {string} dataKey - Key to replace
	 * @param {string} name - Name for the file
	 * @returns {Promise<{cid: string, url: string}>}
	 */
	async replaceData(cid, newData, dataKey, name) {
		try {
			// Get existing content
			const existingContent = await this.getContent(cid);

			// Create new content object with all existing data
			const updatedContent = { ...existingContent };

			// Replace only the specified data key
			updatedContent[dataKey] = newData;

			// Upload the updated content
			return await this.uploadContent(updatedContent, name);
		} catch (error) {
			console.error(
				"Data Replace Error:",
				error.response?.data || error.message
			);
			throw new Error(`Failed to replace ${dataKey} data`);
		}
	}

	/**
	 * Get specific data from content
	 * @param {string} cid - The CID of the content
	 * @param {string} dataKey - Key to retrieve
	 * @returns {Promise<Object>}
	 */
	async getSpecificData(cid, dataKey) {
		try {
			const content = await this.getContent(cid);
			return content[dataKey];
		} catch (error) {
			console.error(
				"Get Specific Data Error:",
				error.response?.data || error.message
			);
			throw new Error(`Failed to get ${dataKey} data`);
		}
	}
}

// Mock IPFS utility for testing
const pinata = {
	pinFileToIPFS: async (file) => {
		return {
			IpfsHash: "QmTest123",
			PinSize: 1234,
			Timestamp: new Date().toISOString(),
		};
	},

	pinJSONToIPFS: async (json) => {
		return {
			IpfsHash: "QmTest456",
			PinSize: 567,
			Timestamp: new Date().toISOString(),
		};
	},
};

module.exports = pinata;
