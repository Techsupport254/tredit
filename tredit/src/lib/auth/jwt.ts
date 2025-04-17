import jwt from "jsonwebtoken";

interface JwtPayload {
	id: string;
	email: string;
	role?: string;
	iat?: number;
	exp?: number;
}

export function signJwtToken(payload: JwtPayload): Promise<string> {
	const secret = process.env.JWT_SECRET;
	const expiresIn = process.env.JWT_EXPIRE || "1d";

	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}

	return new Promise((resolve, reject) => {
		jwt.sign(payload, secret, { expiresIn }, (err, token) => {
			if (err || !token) {
				reject(err || new Error("Failed to sign JWT token"));
			} else {
				resolve(token);
			}
		});
	});
}

export function verifyJwtToken(token: string): Promise<JwtPayload> {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}

	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, (err, decoded) => {
			if (err || !decoded) {
				reject(err || new Error("Failed to verify JWT token"));
			} else {
				resolve(decoded as JwtPayload);
			}
		});
	});
}
