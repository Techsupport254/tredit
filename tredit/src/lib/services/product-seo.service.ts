import { PrismaClient } from "@prisma/client";
import { DatabaseService } from "./database.service";

export class ProductSEOService {
	private static instance: ProductSEOService;
	private prisma: PrismaClient;

	private constructor() {
		this.prisma = DatabaseService.getInstance().getPrisma();
	}

	public static getInstance(): ProductSEOService {
		if (!ProductSEOService.instance) {
			ProductSEOService.instance = new ProductSEOService();
		}
		return ProductSEOService.instance;
	}

	async updateProductSEO(
		productId: string,
		data: {
			title?: string;
			description?: string;
			keywords?: string[];
		}
	) {
		try {
			const seo = await this.prisma.productSEO.upsert({
				where: { productId },
				update: {
					title: data.title,
					description: data.description,
					keywords: data.keywords,
				},
				create: {
					productId,
					title: data.title,
					description: data.description,
					keywords: data.keywords || [],
				},
			});

			return seo;
		} catch (error) {
			console.error("Error updating product SEO:", error);
			throw new Error("Failed to update product SEO");
		}
	}

	async getProductSEO(productId: string) {
		try {
			const seo = await this.prisma.productSEO.findUnique({
				where: { productId },
			});

			if (!seo) {
				return {
					title: null,
					description: null,
					keywords: [],
				};
			}

			return seo;
		} catch (error) {
			console.error("Error fetching product SEO:", error);
			throw new Error("Failed to fetch product SEO");
		}
	}

	async deleteProductSEO(productId: string) {
		try {
			await this.prisma.productSEO.delete({
				where: { productId },
			});
		} catch (error) {
			console.error("Error deleting product SEO:", error);
			throw new Error("Failed to delete product SEO");
		}
	}
}
