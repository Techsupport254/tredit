import { PrismaClient } from "@prisma/client";
import { DatabaseService } from "./database.service";

export class ProductAnalyticsService {
	private static instance: ProductAnalyticsService;
	private prisma: PrismaClient;

	private constructor() {
		this.prisma = DatabaseService.getInstance().getPrisma();
	}

	public static getInstance(): ProductAnalyticsService {
		if (!ProductAnalyticsService.instance) {
			ProductAnalyticsService.instance = new ProductAnalyticsService();
		}
		return ProductAnalyticsService.instance;
	}

	async trackProductView(productId: string) {
		try {
			const analytics = await this.prisma.productAnalytics.upsert({
				where: { productId },
				update: {
					views: {
						increment: 1,
					},
				},
				create: {
					productId,
					views: 1,
					purchases: 0,
					revenue: 0,
				},
			});

			return analytics;
		} catch (error) {
			console.error("Error tracking product view:", error);
			throw new Error("Failed to track product view");
		}
	}

	async trackProductPurchase(productId: string, amount: number) {
		try {
			const analytics = await this.prisma.productAnalytics.upsert({
				where: { productId },
				update: {
					purchases: {
						increment: 1,
					},
					revenue: {
						increment: amount,
					},
				},
				create: {
					productId,
					views: 0,
					purchases: 1,
					revenue: amount,
				},
			});

			return analytics;
		} catch (error) {
			console.error("Error tracking product purchase:", error);
			throw new Error("Failed to track product purchase");
		}
	}

	async getProductAnalytics(productId: string) {
		try {
			const analytics = await this.prisma.productAnalytics.findUnique({
				where: { productId },
			});

			if (!analytics) {
				return {
					views: 0,
					purchases: 0,
					revenue: 0,
				};
			}

			return analytics;
		} catch (error) {
			console.error("Error fetching product analytics:", error);
			throw new Error("Failed to fetch product analytics");
		}
	}

	async getTopProducts(businessId: string, limit: number = 10) {
		try {
			const products = await this.prisma.product.findMany({
				where: { businessId },
				include: {
					analytics: true,
				},
				orderBy: {
					analytics: {
						revenue: "desc",
					},
				},
				take: limit,
			});

			return products;
		} catch (error) {
			console.error("Error fetching top products:", error);
			throw new Error("Failed to fetch top products");
		}
	}
}
