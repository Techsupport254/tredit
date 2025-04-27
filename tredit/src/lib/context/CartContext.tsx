"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { message } from "antd";
import debounce from "lodash/debounce";
import { Product, ProductVariant } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Export the CartItem interface
export interface CartItem {
	id?: string; // Add optional ID - expected from API
	product: Product;
	quantity: number;
	variantId?: string;
	variant?: ProductVariant;
}

export interface ShippingAddress {
	address: string;
}

interface CartContextType {
	cartId: string | null;
	items: CartItem[];
	shippingAddress: string | null;
	addToCart: (
		product: Product,
		variantId?: string,
		quantity?: number
	) => Promise<void>;
	removeFromCart: (cartItemId: string) => void;
	updateQuantity: (cartItemId: string, quantity: number) => void;
	updateShippingAddress: (address: string) => void;
	clearCart: () => void;
	getCartTotal: () => number;
	isLoading: boolean;
	total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const router = useRouter();
	const [cartId, setCartId] = useState<string | null>(null);
	const [items, setItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [shippingAddress, setShippingAddress] = useState<string | null>(null);
	const [total, setTotal] = useState<number>(0);

	// Fetch cart and shipping address on initial load
	useEffect(() => {
		fetchCart();
		fetchShippingAddress();
	}, []);

	const fetchShippingAddress = useCallback(async () => {
		try {
			const response = await fetch("/api/user/shipping-address");
			if (response.ok) {
				const data = await response.json();
				setShippingAddress(data.shippingAddress);
			} else {
				console.error(
					"Failed to fetch shipping address, status:",
					response.status
				);
				setShippingAddress(null); // Ensure state is null on failure
			}
		} catch (error) {
			console.error("Error fetching shipping address:", error);
			setShippingAddress(null); // Ensure state is null on error
		}
	}, []);

	const fetchCart = useCallback(async () => {
		try {
			setIsLoading(true);
			setCartId(null);
			setItems([]);
			setTotal(0);
			const response = await fetch("/api/cart");
			if (response.ok) {
				const data = await response.json();
				// if (data.cart) {
				// 	data.cart.forEach((item: any) => {
				// 		console.log("Cart item:", {
				// 			id: item.id,
				// 			product: item.product,
				// 			variant: item.variant,
				// 			quantity: item.quantity,
				// 		});
				// 	});
				// }
				setItems(data.cart || []);
				setCartId(data.cartId || null);
				setTotal(data.total || 0);

				// Show message if there were deleted items
				if (data.deletedItems > 0) {
					message.warning(
						`${data.deletedItems} item(s) were removed from your cart because they are no longer available.`
					);
				}
			} else {
				console.error("Failed to fetch cart:", response.statusText);
				setItems([]);
				setCartId(null);
				setTotal(0);
			}
		} catch (error) {
			console.error("Error fetching cart:", error);
			setItems([]);
			setCartId(null);
			setTotal(0);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const addToCart = useCallback(
		async (product: Product, variantId?: string, quantity: number = 1) => {
			try {
				if (!session) {
					const callbackUrl = encodeURIComponent(window.location.pathname);
					router.push(`/login?callbackUrl=${callbackUrl}`);
					return;
				}

				const response = await fetch("/api/cart", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						productId: product.id,
						quantity,
						variantId,
					}),
				});

				if (response.ok) {
					await fetchCart();
				} else {
					const errorData = await response.json();
					message.error(errorData.error || "Failed to add item to cart");
					throw new Error(errorData.error || "Failed to add item to cart");
				}
			} catch (error) {
				console.error("Error adding to cart (from context):", error);
				if (
					!(error instanceof Error && error.message.includes("Failed to add"))
				) {
					message.error("An unexpected error occurred while adding to cart.");
				}
				throw error;
			}
		},
		[fetchCart, session, router]
	);

	// Update removeFromCart signature and logic
	const removeFromCart = useCallback(
		async (cartItemId: string) => {
			try {
				// API call needs to target item by cartItemId
				// Example: DELETE /api/cart/{cartItemId} or pass in body/query
				const response = await fetch(`/api/cart`, {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					// Send cartItemId in the body for DELETE
					body: JSON.stringify({ cartItemId }),
				});

				if (response.ok) {
					await fetchCart(); // Refetch cart
				} else {
					message.error("Failed to remove item from cart");
				}
			} catch (error) {
				console.error("Error removing from cart:", error);
				message.error("Failed to remove item from cart");
			}
		},
		[fetchCart]
	); // Added fetchCart dependency

	// Update updateQuantity signature and logic
	const updateQuantity = useCallback(
		async (cartItemId: string, quantity: number) => {
			try {
				// API call needs to target item by cartItemId
				const response = await fetch("/api/cart", {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					// Send cartItemId in the body for PATCH
					body: JSON.stringify({ cartItemId, quantity }),
				});

				if (response.ok) {
					await fetchCart(); // Refetch cart
				} else {
					message.error("Failed to update quantity");
				}
			} catch (error) {
				console.error("Error updating quantity:", error);
				message.error("Failed to update quantity");
			}
		},
		[fetchCart] // Added fetchCart dependency
	);

	// Debounced update quantity function (needs update for variantId)
	// const debouncedUpdateQuantity = useMemo(...);

	// Memoize the clearCart function
	const clearCart = useCallback(async () => {
		try {
			const response = await fetch("/api/cart", {
				method: "DELETE",
			});

			if (response.ok) {
				setItems([]);
			} else {
				message.error("Failed to clear cart");
			}
		} catch (error) {
			console.error("Error clearing cart:", error);
			message.error("Failed to clear cart");
		}
	}, []);

	// Update getCartTotal to use the total from state
	const getCartTotal = useCallback(() => {
		return total;
	}, [total]);

	const updateShippingAddress = useCallback(async (address: string) => {
		try {
			const response = await fetch("/api/user/shipping-address", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ shippingAddress: address }),
			});

			if (response.ok) {
				setShippingAddress(address);
			} else {
				const errorData = await response.json();
				message.error(errorData.error || "Failed to save shipping address");
				throw new Error(errorData.error || "Failed to save shipping address");
			}
		} catch (error) {
			console.error("Error saving shipping address:", error);
			message.error("Failed to save shipping address");
			throw error;
		}
	}, []);

	// Memoize the context value
	const contextValue = useMemo(
		() => ({
			cartId,
			items,
			shippingAddress,
			addToCart,
			removeFromCart,
			updateQuantity,
			updateShippingAddress,
			clearCart,
			getCartTotal,
			isLoading,
			total,
		}),
		[
			cartId,
			items,
			shippingAddress,
			addToCart,
			removeFromCart,
			updateQuantity,
			updateShippingAddress,
			clearCart,
			getCartTotal,
			isLoading,
			total,
		]
	);

	return (
		<CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
