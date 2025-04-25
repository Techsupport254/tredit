import { Product } from "@prisma/client";

export interface CartItem {
	product: Product;
	quantity: number;
}

export class CartService {
	private static instance: CartService;
	private cart: Map<string, CartItem> = new Map();

	private constructor() {}

	static getInstance(): CartService {
		if (!CartService.instance) {
			CartService.instance = new CartService();
		}
		return CartService.instance;
	}

	addToCart(product: Product, quantity: number = 1) {
		const existingItem = this.cart.get(product.id);
		if (existingItem) {
			existingItem.quantity += quantity;
			this.cart.set(product.id, existingItem);
		} else {
			this.cart.set(product.id, { product, quantity });
		}
	}

	removeFromCart(productId: string) {
		this.cart.delete(productId);
	}

	updateQuantity(productId: string, quantity: number) {
		const item = this.cart.get(productId);
		if (item) {
			item.quantity = quantity;
			this.cart.set(productId, item);
		}
	}

	getCart(): CartItem[] {
		return Array.from(this.cart.values());
	}

	getCartTotal(): number {
		return Array.from(this.cart.values()).reduce(
			(total, item) => total + item.product.price * item.quantity,
			0
		);
	}

	clearCart() {
		this.cart.clear();
	}
}
