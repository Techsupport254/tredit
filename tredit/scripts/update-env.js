import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	// Read the artifacts
	const businessArtifact = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, "../artifacts/contracts/Business.sol/Business.json"),
			"utf8"
		)
	);
	const userProfileArtifact = JSON.parse(
		fs.readFileSync(
			path.join(
				__dirname,
				"../artifacts/contracts/UserProfile.sol/UserProfile.json"
			),
			"utf8"
		)
	);
	const disputeArtifact = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, "../artifacts/contracts/Dispute.sol/Dispute.json"),
			"utf8"
		)
	);
	const paymentArtifact = JSON.parse(
		fs.readFileSync(
			path.join(__dirname, "../artifacts/contracts/Payment.sol/Payment.json"),
			"utf8"
		)
	);
	const escrowArtifact = JSON.parse(
		fs.readFileSync(
			path.join(
				__dirname,
				"../artifacts/contracts/Escrow.sol/GoodsEscrow.json"
			),
			"utf8"
		)
	);

	// Update env.js
	const envPath = path.join(__dirname, "../env.js");
	let envContent = fs.readFileSync(envPath, "utf8");

	// Update contract addresses
	const updates = {
		USER_PROFILE_CONTRACT_ADDRESS: "0x5F38f390DEFdB6E010BD2EF8a8BA9308f8DBFbFd",
		BUSINESS_CONTRACT_ADDRESS: "0x806cfb5813E9175e17629C6c77C9b5664379bD7e",
		DISPUTE_CONTRACT_ADDRESS: "0xf36E0724240FA98eD3845768C756b16f20616f8C",
		PAYMENT_CONTRACT_ADDRESS: "0x6b1D3cA8EfB032AF33EaB7B5c0Cfb49309147C33",
		ESCROW_CONTRACT_ADDRESS: "0x7a9B12382DA052cBa86415a0d6F04397906B7CA5",
		BUSINESS_CONTRACT_ABI: JSON.stringify(businessArtifact.abi),
		USER_PROFILE_CONTRACT_ABI: JSON.stringify(userProfileArtifact.abi),
		DISPUTE_CONTRACT_ABI: JSON.stringify(disputeArtifact.abi),
		PAYMENT_CONTRACT_ABI: JSON.stringify(paymentArtifact.abi),
		ESCROW_CONTRACT_ABI: JSON.stringify(escrowArtifact.abi),
	};

	// Update each variable
	Object.entries(updates).forEach(([key, value]) => {
		const regex = new RegExp(`${key}=.*`, "g");
		const newLine = `${key}=${value}`;
		envContent = envContent.replace(regex, newLine);
	});

	// Write back to env.js
	fs.writeFileSync(envPath, envContent);
	console.log("Updated env.js with new contract addresses and ABIs");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
