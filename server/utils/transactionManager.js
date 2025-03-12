const {
	uploadToIPFS,
	saveProfileToBlockchain,
	unpinFromPinata,
} = require("./blockchainHelper");
const { sequelize } = require("../models");
const { ethers } = require("ethers");
const { blockchainConfig } = require("../config/config");

/**
 * Manages the complete flow of uploading to IPFS, blockchain, and database with rollback support
 * @param {Object} data - The data to be stored
 * @param {Function} dbOperation - The database operation to perform
 * @param {Function} blockchainOperation - The blockchain operation to perform
 * @param {Function} rollbackOperation - The database rollback operation
 * @param {Function} emitEvent - Function to emit events for real-time updates
 * @returns {Promise<Object>} The result of all operations
 */
async function manageTransaction(
	data,
	dbOperation,
	blockchainOperation,
	rollbackOperation,
	emitEvent = null
) {
	let ipfsResult = null;
	let blockchainResult = null;
	let dbResult = null;

	try {
		if (emitEvent) {
			emitEvent({
				type: "status",
				status: "started",
				message: "Starting transaction process...",
			});
		}

		// Validate input data
		if (!data) {
			throw new Error("No data provided for transaction");
		}

		// Step 1: IPFS Upload
		try {
			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "preparing",
					message: "Preparing data for IPFS storage...",
				});
			}

			console.log("Uploading to Pinata IPFS...");
			console.log("Data being uploaded:", JSON.stringify(data, null, 2));

			ipfsResult = await uploadToIPFS(data, (event) => {
				if (emitEvent) {
					emitEvent({
						...event,
						steps: [...(event.steps || [])],
					});
				}
			});

			if (!ipfsResult || !ipfsResult.ipfsCid) {
				throw new Error("IPFS upload failed - no CID returned");
			}

			if (emitEvent) {
				emitEvent({
					type: "ipfs",
					status: "success",
					message: "IPFS upload completed successfully",
					data: {
						cid: ipfsResult.ipfsCid,
						url: ipfsResult.ipfsUrl,
					},
					steps: [
						"Data validated successfully",
						"IPFS connection established",
						"Upload process completed",
						`Content stored with CID: ${ipfsResult.ipfsCid}`,
					],
				});
			}

			// Start database transaction
			const dbTransaction = await sequelize.transaction();

			try {
				// Add IPFS results to data
				const enrichedData = {
					...data,
					ipfsCid: ipfsResult.ipfsCid,
					ipfsUri: ipfsResult.ipfsUrl, // Store as ipfsUri for blockchain
					ipfsUrl: ipfsResult.ipfsUrl,
				};

				// Step 2: Blockchain Storage
				if (blockchainOperation) {
					if (emitEvent) {
						emitEvent({
							type: "blockchain",
							status: "preparing",
							message: "Preparing blockchain transaction...",
						});
					}

					blockchainResult = await blockchainOperation(enrichedData);

					if (!blockchainResult?.success) {
						throw new Error(
							blockchainResult?.error || "Blockchain operation failed"
						);
					}

					if (emitEvent) {
						emitEvent({
							type: "blockchain",
							status: "success",
							message: "Blockchain transaction completed",
							data: blockchainResult,
						});
					}

					// Add blockchain results to data
					enrichedData.blockchainTxHash = blockchainResult.hash;
					enrichedData.blockchainTimestamp = new Date().toISOString();
				}

				// Step 3: Database Operation
				if (emitEvent) {
					emitEvent({
						type: "database",
						status: "processing",
						message: "Executing database operation...",
					});
				}

				dbResult = await dbOperation(enrichedData, dbTransaction);

				// Commit transaction
				await dbTransaction.commit();

				if (emitEvent) {
					emitEvent({
						type: "status",
						status: "completed",
						message: "Transaction completed successfully",
						data: {
							ipfs: ipfsResult,
							blockchain: blockchainResult,
							database: dbResult,
						},
					});
				}

				return {
					success: true,
					data: dbResult,
					ipfs: ipfsResult,
					blockchain: blockchainResult,
				};
			} catch (error) {
				await dbTransaction.rollback();
				console.error("Transaction error:", error);

				// Attempt to unpin from IPFS
				if (ipfsResult?.ipfsCid) {
					if (emitEvent) {
						emitEvent({
							type: "ipfs",
							status: "rollback",
							message: "Rolling back IPFS storage...",
						});
					}

					try {
						await unpinFromPinata(ipfsResult.ipfsCid);
					} catch (unpinError) {
						console.error("Failed to unpin from IPFS:", unpinError);
					}
				}

				throw error;
			}
		} catch (error) {
			if (emitEvent) {
				emitEvent({
					type: "error",
					status: "failed",
					message: "Transaction failed",
					error: error.message,
				});
			}

			if (rollbackOperation) {
				await rollbackOperation(data);
			}

			throw error;
		}
	} catch (error) {
		console.error("Transaction management error:", error);
		return {
			success: false,
			error: error.message,
			code: error.code,
			details: {
				ipfs: ipfsResult,
				blockchain: blockchainResult,
				database: dbResult,
			},
		};
	}
}

module.exports = {
	manageTransaction,
};
