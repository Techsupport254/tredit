const { PinataManager } = require("./ipfs");

class IPFSHelper {
	constructor() {
		this.pinataManager = new PinataManager();
	}

	/**
	 * Pin JSON data to IPFS via Pinata
	 * @param {Object} data - The data to pin
	 * @returns {Promise<{ipfsCid: string, ipfsUrl: string}>}
	 */
	async pinJSONToIPFS(data) {
		const result = await this.pinataManager.pinJSONToIPFS(data);
		return {
			ipfsCid: result.cid,
			ipfsUrl: `${process.env.PINATA_GATEWAY_URL}/ipfs/${result.cid}`,
		};
	}

	/**
	 * Unpin data from IPFS via Pinata
	 * @param {string} cid - The CID to unpin
	 * @returns {Promise<void>}
	 */
	async unpinFromIPFS(cid) {
		await this.pinataManager.unpin(cid);
	}
}
