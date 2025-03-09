const {
	uploadToIPFS,
	saveProfileToBlockchain,
	unpinFromPinata,
} = require("./blockchainHelper");
const { sequelize } = require("../config/database");

/**
 * Manages the complete flow of uploading to IPFS, blockchain, and database with rollback support
 * @param {Object} data - The data to be stored
 * @param {Function} dbOperation - The database operation to perform
 * @param {Function} rollbackOperation - The database rollback operation
 * @param {boolean} skipBlockchain - Whether to skip blockchain operations
 * @param {Function} emitEvent - Function to emit events for real-time updates
 * @returns {Promise<Object>} The result of all operations
 */
async function manageTransaction(
	data,
	dbOperation,
	rollbackOperation,
	skipBlockchain = false,
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
				message: "Starting profile creation process...",
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
					steps: ["Validating data format", "Initializing IPFS upload"],
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
				if (!skipBlockchain) {
					if (emitEvent) {
						emitEvent({
							type: "blockchain",
							status: "preparing",
							message: "Preparing blockchain transaction...",
							steps: [
								"Initializing blockchain connection",
								"Preparing transaction data",
							],
						});
					}

					// Add IPFS URI to the data for blockchain storage
					const blockchainData = {
						...enrichedData,
						ipfsUri: ipfsResult.ipfsUrl, // Ensure IPFS URI is passed
					};

					blockchainResult = await saveProfileToBlockchain(
						blockchainData,
						(event) => {
							if (emitEvent) {
								emitEvent({
									...event,
									steps: [...(event.steps || [])],
								});
							}
						}
					);

					if (emitEvent) {
						emitEvent({
							type: "blockchain",
							status: "success",
							message: "Blockchain transaction completed",
							data: {
								txHash: blockchainResult.txHash,
								blockNumber: blockchainResult.blockNumber,
								gasUsed: blockchainResult.gasUsed,
							},
							steps: [
								"Transaction prepared",
								"Transaction signed and sent",
								`Transaction confirmed in block ${blockchainResult.blockNumber}`,
								`Gas used: ${blockchainResult.gasUsed}`,
							],
						});
					}

					// Add blockchain results to data
					enrichedData.blockchainTxHash = blockchainResult.txHash;
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

				if (emitEvent) {
					emitEvent({
						type: "database",
						status: "success",
						message: "Database operation completed successfully",
					});
				}

				// Commit transaction
				await dbTransaction.commit();

				if (emitEvent) {
					emitEvent({
						type: "status",
						status: "completed",
						message: "Profile creation completed successfully",
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
					blockchain: skipBlockchain ? null : blockchainResult,
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
						if (emitEvent) {
							emitEvent({
								type: "ipfs",
								status: "rollback_success",
								message: "Successfully unpinned content from IPFS",
							});
						}
					} catch (unpinError) {
						console.error("Failed to unpin from IPFS:", unpinError);
						if (emitEvent) {
							emitEvent({
								type: "ipfs",
								status: "rollback_error",
								message: "Failed to unpin content from IPFS",
								error: unpinError.message,
							});
						}
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
					details: {
						code: error.code,
						type: error.name,
						...(error.info && { info: error.info }),
					},
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
