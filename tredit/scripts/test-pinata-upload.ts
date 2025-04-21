const axios = require("axios");
const FormDataLib = require("form-data");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

async function uploadToPinata(filePath: string) {
	try {
		// Read file
		const file = fs.readFileSync(filePath);
		const fileName = path.basename(filePath);

		// Create form data
		const formData = new FormDataLib();
		formData.append("file", file, {
			filename: fileName,
			contentType: `image/${path.extname(fileName).slice(1)}`,
			knownLength: file.length,
		});

		// Add metadata
		formData.append(
			"pinataMetadata",
			JSON.stringify({
				name: `Test_Upload_${fileName}`,
				keyvalues: {
					type: "test_image",
					timestamp: new Date().toISOString(),
				},
			})
		);

		console.log(`Uploading ${fileName} to Pinata...`);

		// Upload to Pinata
		const response = await axios.post(PINATA_API_URL, formData, {
			headers: {
				Authorization: `Bearer ${PINATA_JWT}`,
				...formData.getHeaders(),
				"Content-Length": formData.getLengthSync(),
			},
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
		});

		const ipfsHash = response.data.IpfsHash;
		const ipfsUrl = `ipfs://${ipfsHash}`;
		const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

		console.log(`Successfully uploaded ${fileName}:`);
		console.log(`- IPFS Hash: ${ipfsHash}`);
		console.log(`- IPFS URL: ${ipfsUrl}`);
		console.log(`- Gateway URL: ${gatewayUrl}`);
		console.log("---");

		return {
			hash: ipfsHash,
			ipfsUrl,
			gatewayUrl,
		};
	} catch (error: any) {
		if (error.response) {
			console.error(
				"Failed to upload to Pinata:",
				error.response.data || error.message
			);
		} else {
			console.error("Failed to upload to Pinata:", error);
		}
		throw error;
	}
}

async function main() {
	const imagePaths = [
		"/Users/Quaint/Downloads/download (5).jpeg",
		"/Users/Quaint/Downloads/download (4).jpeg",
	];

	console.log("Starting test uploads to Pinata...\n");

	try {
		const results = await Promise.all(
			imagePaths.map((path) => uploadToPinata(path))
		);

		console.log("\nAll uploads completed successfully!");
		console.log("\nSummary:");
		results.forEach((result, index) => {
			console.log(`\nImage ${index + 1}:`);
			console.log(`- IPFS Hash: ${result.hash}`);
			console.log(`- IPFS URL: ${result.ipfsUrl}`);
			console.log(`- Gateway URL: ${result.gatewayUrl}`);
		});
	} catch (error: any) {
		if (error.response) {
			console.error(
				"\nFailed to complete all uploads:",
				error.response.data || error.message
			);
		} else {
			console.error("\nFailed to complete all uploads:", error);
		}
		process.exit(1);
	}
}

main();
