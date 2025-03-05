import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useAuth } from "./AuthContext";

const ProductContext = createContext();

export const useProduct = () => {
	const context = useContext(ProductContext);
	if (!context) {
		throw new Error("useProduct must be used within a ProductProvider");
	}
	return context;
};

export const ProductProvider = ({ children }) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [products, setProducts] = useState([]);
	const [currentProduct, setCurrentProduct] = useState(null);

	const addProduct = async (productData) => {
		try {
			setLoading(true);
			const formData = new FormData();

			// Handle basic product info
			Object.keys(productData).forEach((key) => {
				if (key !== "images" && key !== "videos" && key !== "variants") {
					formData.append(
						key,
						typeof productData[key] === "object"
							? JSON.stringify(productData[key])
							: productData[key]
					);
				}
			});

			// Handle images
			if (productData.images) {
				productData.images.forEach((image) => {
					formData.append("images", image.originFileObj);
				});
			}

			// Handle videos with social media details
			if (productData.videos) {
				formData.append("videos", JSON.stringify(productData.videos));
			}

			// Handle variants
			if (productData.variants) {
				formData.append("variants", JSON.stringify(productData.variants));
			}

			const response = await axios.post("/api/products", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setProducts((prev) => [...prev, response.data.product]);
			message.success("Product added successfully");
			return response.data.product;
		} catch (error) {
			message.error(error.response?.data?.message || "Failed to add product");
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const updateProduct = async (productId, updateData) => {
		try {
			setLoading(true);
			const response = await axios.put(
				`/api/products/${productId}`,
				updateData
			);
			setProducts((prev) =>
				prev.map((p) => (p.id === productId ? response.data.product : p))
			);
			message.success("Product updated successfully");
			return response.data.product;
		} catch (error) {
			message.error(
				error.response?.data?.message || "Failed to update product"
			);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const deleteProduct = async (productId) => {
		try {
			setLoading(true);
			await axios.delete(`/api/products/${productId}`);
			setProducts((prev) => prev.filter((p) => p.id !== productId));
			message.success("Product deleted successfully");
		} catch (error) {
			message.error(
				error.response?.data?.message || "Failed to delete product"
			);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const getProduct = async (productId) => {
		try {
			setLoading(true);
			const response = await axios.get(`/api/products/${productId}`);
			setCurrentProduct(response.data.product);
			return response.data.product;
		} catch (error) {
			message.error(error.response?.data?.message || "Failed to fetch product");
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const getAllProducts = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/products");
			setProducts(response.data.products);
			return response.data.products;
		} catch (error) {
			message.error(
				error.response?.data?.message || "Failed to fetch products"
			);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		loading,
		products,
		currentProduct,
		addProduct,
		updateProduct,
		deleteProduct,
		getProduct,
		getAllProducts,
	};

	return (
		<ProductContext.Provider value={value}>{children}</ProductContext.Provider>
	);
};
