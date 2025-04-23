import {
	PrismaClient,
	Product,
	ProductVariant,
	ProductStatus,
	Prisma,
} from "@prisma/client";
import { DatabaseService } from "./database.service";
import {
	ProductError,
	ProductValidationError,
	ProductCreationError,
	ProductUpdateError,
	ProductDeletionError,
	ProductNotFoundError,
	ProductDatabaseError,
	ProductMediaError,
} from "../errors/product.errors";

export class ProductService {
	private static instance: ProductService;
	private prisma: PrismaClient;

	private constructor() {
		this.prisma = DatabaseService.getInstance().getPrisma();
	}

	public static getInstance(): ProductService {
		if (!ProductService.instance) {
			ProductService.instance = new ProductService();
		}
		return ProductService.instance;
	}

	async createProduct(data: {
		businessId: string;
		name: string;
		description?: string;
		variants: Array<{
			name: string;
			value: string;
			price: number;
			stock: number;
		}>;
		status?: ProductStatus;
		youtubeVideoId?: string;
		ipfsHash?: string;
	}) {
		console.log("\n=== PRODUCT SERVICE: CREATE PRODUCT ===");
		console.log("Input Data:", JSON.stringify(data, null, 2));

		try {
			// Validate that there is at least one variant
			if (!data.variants || data.variants.length === 0) {
				console.log("Validation Error: No variants provided");
				throw new ProductValidationError(
					"Product must have at least one variant"
				);
			}

			// Validate variant data
			console.log("\n=== VALIDATING VARIANTS ===");
			data.variants.forEach((variant, index) => {
				if (!variant.name) {
					console.log(`Variant ${index + 1} Error: Name is required`);
					throw new ProductValidationError(
						`Variant ${index + 1} name is required`
					);
				}
				if (!variant.value) {
					console.log(`Variant ${index + 1} Error: Value is required`);
					throw new ProductValidationError(
						`Variant ${index + 1} value is required`
					);
				}
				if (variant.price <= 0) {
					console.log(`Variant ${index + 1} Error: Price must be positive`);
					throw new ProductValidationError(
						`Variant ${index + 1} price must be positive`
					);
				}
				if (variant.stock < 0) {
					console.log(`Variant ${index + 1} Error: Stock must be non-negative`);
					throw new ProductValidationError(
						`Variant ${index + 1} stock must be non-negative`
					);
				}
			});
			console.log("Variant validation successful");

			// Use the first variant's price and stock as the main product price/stock
			const firstVariant = data.variants[0];

			const productData = {
				businessId: data.businessId,
				name: data.name,
				description: data.description,
				price: firstVariant.price,
				stock: firstVariant.stock,
				status: data.status || "ACTIVE",
				youtubeVideoId: data.youtubeVideoId,
				ipfsHash: data.ipfsHash,
				variants: {
					create: data.variants.map((variant) => ({
						name: variant.name,
						value: variant.value,
						price: variant.price,
						stock: variant.stock,
					})),
				},
			} as const;

			console.log("\n=== CREATING PRODUCT IN DATABASE ===");
			console.log("Product Data:", JSON.stringify(productData, null, 2));

			const product = await this.prisma.product.create({
				data: productData,
				include: {
					variants: true,
				},
			});

			console.log("\n=== PRODUCT CREATED IN DATABASE ===");
			console.log("Product ID:", product.id);
			console.log("Product Name:", product.name);
			console.log("Variants:", product.variants.length);

			return product;
		} catch (error) {
			console.log("\n=== ERROR IN PRODUCT CREATION ===");
			if (error instanceof ProductError) {
				console.log("Product Error:", {
					message: error.message,
					code: error.code,
					details: error.details,
				});
				throw error;
			}
			console.error("Unexpected Error:", error);
			throw new ProductCreationError("Failed to create product", { error });
		}
	}

	async getProductById(id: string) {
		try {
			const product = await this.prisma.product.findUnique({
				where: { id },
				include: {
					variants: true,
					analytics: true,
					seo: true,
				},
			});

			if (!product) {
				throw new ProductNotFoundError();
			}

			return product;
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error fetching product:", error);
			throw new ProductDatabaseError("Failed to fetch product", { error });
		}
	}

	async getProductsByBusiness(businessId: string) {
		try {
			const products = await this.prisma.product.findMany({
				where: { businessId },
				include: {
					variants: true,
					analytics: true,
					seo: true,
				},
			});

			return products;
		} catch (error) {
			console.error("Error fetching business products:", error);
			throw new ProductDatabaseError("Failed to fetch business products", {
				error,
			});
		}
	}

	async updateProduct(
		id: string,
		data: {
			name?: string;
			description?: string;
			status?: ProductStatus;
			variants?: Array<{
				id?: string;
				name: string;
				value: string;
				price: number;
				stock: number;
			}>;
			youtubeVideoId?: string;
			ipfsHash?: string;
		}
	) {
		try {
			// Validate product exists
			const existingProduct = await this.prisma.product.findUnique({
				where: { id },
			});

			if (!existingProduct) {
				throw new ProductNotFoundError();
			}

			// Validate variant data if provided
			if (data.variants) {
				data.variants.forEach((variant, index) => {
					if (!variant.name) {
						throw new ProductValidationError(
							`Variant ${index + 1} name is required`
						);
					}
					if (!variant.value) {
						throw new ProductValidationError(
							`Variant ${index + 1} value is required`
						);
					}
					if (variant.price <= 0) {
						throw new ProductValidationError(
							`Variant ${index + 1} price must be positive`
						);
					}
					if (variant.stock < 0) {
						throw new ProductValidationError(
							`Variant ${index + 1} stock must be non-negative`
						);
					}
				});
			}

			const updateData = {
				name: data.name,
				description: data.description,
				status: data.status,
				youtubeVideoId: data.youtubeVideoId,
				variants: data.variants
					? {
							deleteMany: {},
							create: data.variants.map((variant) => ({
								name: variant.name,
								value: variant.value,
								price: variant.price,
								stock: variant.stock,
							})),
					  }
					: undefined,
			} as const;

			const product = await this.prisma.product.update({
				where: { id },
				data: updateData,
				include: {
					variants: true,
				},
			});

			// Handle media update if ipfsHash is provided
			if (data.ipfsHash) {
				try {
					await this.prisma.productMedia.deleteMany({
						where: { productId: id },
					});
					await this.prisma.productMedia.create({
						data: {
							product: { connect: { id } },
							type: "IMAGE",
							url: data.ipfsHash,
							order: 1,
						},
					});
				} catch (error) {
					console.error("Error updating product media:", error);
					throw new ProductMediaError("Failed to update product media", {
						error,
					});
				}
			}

			return product;
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error updating product:", error);
			throw new ProductUpdateError("Failed to update product", { error });
		}
	}

	async deleteProduct(id: string) {
		try {
			// Validate product exists
			const existingProduct = await this.prisma.product.findUnique({
				where: { id },
			});

			if (!existingProduct) {
				throw new ProductNotFoundError();
			}

			await this.prisma.product.delete({
				where: { id },
			});
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error deleting product:", error);
			throw new ProductDeletionError("Failed to delete product", { error });
		}
	}

	async addVariant(
		productId: string,
		variant: {
			name: string;
			value: string;
			price: number;
			stock: number;
		}
	) {
		try {
			// Validate product exists
			const existingProduct = await this.prisma.product.findUnique({
				where: { id: productId },
			});

			if (!existingProduct) {
				throw new ProductNotFoundError();
			}

			// Validate variant data
			if (!variant.name) {
				throw new ProductValidationError("Variant name is required");
			}
			if (!variant.value) {
				throw new ProductValidationError("Variant value is required");
			}
			if (variant.price <= 0) {
				throw new ProductValidationError("Variant price must be positive");
			}
			if (variant.stock < 0) {
				throw new ProductValidationError("Variant stock must be non-negative");
			}

			const newVariant = await this.prisma.productVariant.create({
				data: {
					product: { connect: { id: productId } },
					name: variant.name,
					value: variant.value,
					price: variant.price,
					stock: variant.stock,
				},
			});

			return newVariant;
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error adding variant:", error);
			throw new ProductCreationError("Failed to add variant", { error });
		}
	}

	async updateVariant(
		variantId: string,
		data: {
			name?: string;
			value?: string;
			price?: number;
			stock?: number;
		}
	) {
		try {
			// Validate variant exists
			const existingVariant = await this.prisma.productVariant.findUnique({
				where: { id: variantId },
			});

			if (!existingVariant) {
				throw new ProductNotFoundError("Variant not found");
			}

			// Validate data if provided
			if (data.price !== undefined && data.price <= 0) {
				throw new ProductValidationError("Price must be positive");
			}
			if (data.stock !== undefined && data.stock < 0) {
				throw new ProductValidationError("Stock must be non-negative");
			}

			const variant = await this.prisma.productVariant.update({
				where: { id: variantId },
				data,
			});

			return variant;
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error updating variant:", error);
			throw new ProductUpdateError("Failed to update variant", { error });
		}
	}

	async deleteVariant(variantId: string) {
		try {
			// Validate variant exists
			const existingVariant = await this.prisma.productVariant.findUnique({
				where: { id: variantId },
			});

			if (!existingVariant) {
				throw new ProductNotFoundError("Variant not found");
			}

			await this.prisma.productVariant.delete({
				where: { id: variantId },
			});
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error deleting variant:", error);
			throw new ProductDeletionError("Failed to delete variant", { error });
		}
	}

	async updateProductStock(
		productId: string,
		variantId: string,
		quantity: number
	) {
		try {
			// Validate product exists
			const existingProduct = await this.prisma.product.findUnique({
				where: { id: productId },
			});

			if (!existingProduct) {
				throw new ProductNotFoundError();
			}

			// Validate variant exists
			const existingVariant = await this.prisma.productVariant.findUnique({
				where: { id: variantId },
			});

			if (!existingVariant) {
				throw new ProductNotFoundError("Variant not found");
			}

			// Validate quantity
			if (quantity === 0) {
				throw new ProductValidationError("Quantity must not be zero");
			}

			const variant = await this.prisma.productVariant.update({
				where: { id: variantId },
				data: {
					stock: {
						increment: quantity,
					},
				},
			});

			return variant;
		} catch (error) {
			if (error instanceof ProductError) {
				throw error;
			}
			console.error("Error updating product stock:", error);
			throw new ProductUpdateError("Failed to update product stock", { error });
		}
	}
}
