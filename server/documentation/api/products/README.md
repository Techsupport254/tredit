# Product API Documentation

## Overview

This document outlines all product-related API endpoints, their request/response formats, and error handling.

## Base URL

```
http://localhost:8000/api/products
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Product

Create a new product for a business.

**Endpoint:** `POST /`

**Authentication:** Required

**Request Body:**

```json
{
	"businessId": "uuid",
	"name": "Premium Laptop",
	"description": "High-performance laptop with latest specifications",
	"shortDescription": "Latest Intel i7 laptop",
	"category": "Electronics",
	"price": 129999,
	"currency": "KES",
	"stockQuantity": 10,
	"sellerAddress": "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
	"variants": [
		{
			"name": "Silver",
			"price": 129999,
			"currency": "KES",
			"stockQuantity": 5,
			"sku": "LAP-SIL-001"
		},
		{
			"name": "Space Gray",
			"price": 129999,
			"currency": "KES",
			"stockQuantity": 5,
			"sku": "LAP-SPG-001"
		}
	]
}
```

**Success Response (201):**

```json
{
	"success": true,
	"message": "Product created successfully",
	"data": {
		"id": "uuid",
		"name": "Premium Laptop",
		"category": "Electronics",
		"price": "129999.00",
		"stockQuantity": 10,
		"variants": [
			{
				"id": "uuid",
				"name": "Silver",
				"price": "129999.00",
				"stockQuantity": 5,
				"sku": "LAP-SIL-001"
			}
		]
	}
}
```

**Error Responses:**

1. Validation Error (400):

```json
{
	"success": false,
	"message": "Validation error",
	"errors": [
		{
			"field": "variants.0.currency",
			"message": "\"variants[0].currency\" is required"
		}
	]
}
```

2. Business Not Found (404):

```json
{
	"success": false,
	"message": "Business not found",
	"code": "NOT_FOUND"
}
```

3. Invalid Category (400):

```json
{
	"success": false,
	"message": "Invalid product category",
	"code": "VALIDATION_ERROR"
}
```

### 2. Get All Products

Retrieve all products for a business.

**Endpoint:** `GET /?businessId=uuid`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": [
		{
			"id": "uuid",
			"name": "Premium Laptop",
			"description": "High-performance laptop with latest specifications",
			"shortDescription": "Latest Intel i7 laptop",
			"category": "Electronics",
			"price": "129999.00",
			"stockQuantity": 10,
			"variants": [
				{
					"id": "uuid",
					"name": "Silver",
					"price": "129999.00",
					"stockQuantity": 5,
					"sku": "LAP-SIL-001"
				}
			]
		}
	]
}
```

### 3. Get Single Product

Retrieve details of a specific product.

**Endpoint:** `GET /:productId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "Premium Laptop",
		"description": "High-performance laptop with latest specifications",
		"shortDescription": "Latest Intel i7 laptop",
		"category": "Electronics",
		"price": "129999.00",
		"stockQuantity": 10,
		"variants": [
			{
				"id": "uuid",
				"name": "Silver",
				"price": "129999.00",
				"stockQuantity": 5,
				"sku": "LAP-SIL-001"
			}
		]
	}
}
```

### 4. Update Product

Update product details.

**Endpoint:** `PATCH /:productId`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "Updated Product Name",
	"price": 139999,
	"stockQuantity": 15
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "Product updated successfully",
	"data": {
		"id": "uuid",
		"name": "Updated Product Name",
		"price": "139999.00",
		"stockQuantity": 15
	}
}
```

### 5. Delete Product

Delete a product.

**Endpoint:** `DELETE /:productId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"message": "Product deleted successfully"
}
```

## Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: User lacks required permissions
- `NOT_FOUND`: Resource not found
- `RESOURCE_EXISTS`: Resource already exists
- `INTERNAL_ERROR`: Server internal error

## Edge Cases

1. Product Creation:

   - Missing required fields
   - Invalid category
   - Invalid currency
   - Invalid variant data
   - Duplicate SKUs
   - Negative stock quantity
   - Price less than 0

2. Product Updates:

   - Updating non-existent product
   - Unauthorized updates
   - Invalid field values
   - Updating stock below 0
   - Concurrent updates

3. Product Deletion:
   - Deleting non-existent product
   - Unauthorized deletion
   - Deleting product with active orders
   - Deleting product with active cart items

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 30 days
- Product categories must be valid according to BUSINESS_CONSTANTS
- Each product must have at least one variant
- SKUs must be unique within a business
- Stock quantity cannot be negative
- Price must be greater than 0
