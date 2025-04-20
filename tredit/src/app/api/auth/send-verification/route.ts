import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

// Validate SMTP configuration
const requiredEnvVars = [
	"SMTP_HOST",
	"SMTP_PORT",
	"SMTP_USER",
	"SMTP_PASS",
	"FROM_EMAIL",
	"FROM_NAME",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
	console.error("Missing required environment variables:", missingEnvVars);
}

// Create SMTP transporter
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	tls: {
		rejectUnauthorized: false, // For development only
	},
});

// Verify SMTP connection
transporter.verify((error, success) => {
	if (error) {
		console.error("SMTP connection error:", error);
	} else {
		console.log("SMTP connection successful");
	}
});

export async function POST(req: Request) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Check if all required environment variables are set
		if (missingEnvVars.length > 0) {
			return NextResponse.json(
				{ error: "Email service is not properly configured" },
				{ status: 500 }
			);
		}

		// Generate a 6-character verification code
		const verificationCode = randomBytes(3).toString("hex").toUpperCase();

		try {
			// Delete any existing verification codes for this email
			await prisma.verificationCode.deleteMany({
				where: { email },
			});

			// Store the verification code in the database with 30-minute expiry
			const verificationRecord = await prisma.verificationCode.create({
				data: {
					email,
					code: verificationCode,
					expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
				},
			});

			if (!verificationRecord) {
				throw new Error("Failed to create verification code");
			}
		} catch (dbError) {
			console.error("Database error:", dbError);
			return NextResponse.json(
				{ error: "Failed to process verification code" },
				{ status: 500 }
			);
		}

		try {
			// Send verification email
			const mailOptions = {
				from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
				to: email,
				subject: "Verify Your Email Address",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #1a56db; margin-bottom: 20px;">Email Verification</h2>
						<p style="color: #374151; font-size: 16px; line-height: 24px;">
							Thank you for registering! Please use the following code to verify your email address:
						</p>
						<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
							<span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #1a56db; letter-spacing: 4px;">
								${verificationCode}
							</span>
						</div>
						<p style="color: #374151; font-size: 14px; line-height: 20px;">
							This code will expire in 30 minutes. If you did not request this verification, please ignore this email.
						</p>
						<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
							<p>This is an automated message, please do not reply to this email.</p>
						</div>
					</div>
				`,
			};

			await transporter.sendMail(mailOptions);
		} catch (emailError) {
			console.error("Email sending error:", emailError);
			return NextResponse.json(
				{ error: "Failed to send verification email" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			message: "Verification email sent successfully",
		});
	} catch (error) {
		console.error("Error in verification process:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
