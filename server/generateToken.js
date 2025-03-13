require("dotenv").config();
const jwt = require("jsonwebtoken");

const user = {
	walletAddress: "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
	role: "user",
};

const token = jwt.sign(
	{
		walletAddress: user.walletAddress.toLowerCase(),
		role: user.role,
	},
	process.env.JWT_SECRET,
	{
		algorithm: "HS256",
		expiresIn: "30d",
	}
);

console.log("Generated token:", token);
