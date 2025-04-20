import { PrismaClient, User } from "@prisma/client";
import { hash, compare } from "bcrypt";
import { CreateUserRequest, UpdateUserRequest } from "@/types/api";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import {
	createUserSchema,
	updateUserSchema,
	validateData,
} from "@/lib/validations";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export class UserService {
	// Create a new user
	async createUser(data: CreateUserRequest): Promise<Omit<User, "password">> {
		// Validate data
		const validatedData = await validateData(createUserSchema, data);

		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});

		if (existingUser) {
			throw new ConflictError("Email already registered");
		}

		// Check if wallet address already exists
		const existingWallet = await prisma.user.findUnique({
			where: { walletAddress: validatedData.walletAddress },
		});

		if (existingWallet) {
			throw new ConflictError("Wallet address already registered");
		}

		// Hash password
		const hashedPassword = await hash(validatedData.password, SALT_ROUNDS);

		// Create user
		const user = await prisma.user.create({
			data: {
				...validatedData,
				password: hashedPassword,
			},
		});

		// Remove password from response
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	// Get user by ID
	async getUserById(id: string): Promise<Omit<User, "password">> {
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundError("User", id);
		}

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	// Update user
	async updateUser(
		id: string,
		data: UpdateUserRequest
	): Promise<Omit<User, "password">> {
		// Validate data
		const validatedData = await validateData(updateUserSchema, { ...data, id });

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			throw new NotFoundError("User", id);
		}

		// If email is being updated, check if new email is available
		if (validatedData.email && validatedData.email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email: validatedData.email },
			});

			if (emailExists) {
				throw new ConflictError("Email already registered");
			}
		}

		// If wallet address is being updated, check if new address is available
		if (
			validatedData.walletAddress &&
			validatedData.walletAddress !== existingUser.walletAddress
		) {
			const walletExists = await prisma.user.findUnique({
				where: { walletAddress: validatedData.walletAddress },
			});

			if (walletExists) {
				throw new ConflictError("Wallet address already registered");
			}
		}

		// Hash new password if provided
		let updateData = { ...validatedData };
		if (validatedData.password) {
			updateData.password = await hash(validatedData.password, SALT_ROUNDS);
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
		});

		// Remove password from response
		const { password, ...userWithoutPassword } = updatedUser;
		return userWithoutPassword;
	}

	// Delete user
	async deleteUser(id: string): Promise<void> {
		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new NotFoundError("User", id);
		}

		// Delete user
		await prisma.user.delete({
			where: { id },
		});
	}

	// Authenticate user
	async authenticateUser(
		email: string,
		password: string
	): Promise<Omit<User, "password">> {
		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new ValidationError("Invalid email or password");
		}

		// Verify password
		const isPasswordValid = await compare(password, user.password);
		if (!isPasswordValid) {
			throw new ValidationError("Invalid email or password");
		}

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	// Get users with pagination and search
	async getUsers({
		page = 1,
		limit = 10,
		search,
	}: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<{
		users: Omit<User, "password">[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		const skip = (page - 1) * limit;

		// Build where clause for search
		const where = search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ email: { contains: search, mode: "insensitive" } },
					],
			  }
			: {};

		// Get total count
		const total = await prisma.user.count({ where });

		// Get users
		const users = await prisma.user.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		});

		// Remove passwords from response
		const usersWithoutPassword = users.map((user) => {
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		});

		return {
			users: usersWithoutPassword,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		};
	}
}
