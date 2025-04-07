# Service API Documentation

## Overview

This document outlines all service-related API endpoints, their request/response formats, and error handling.

## Base URL

```
http://localhost:8000/api/services
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Service

Create a new service for a business.

**Endpoint:** `POST /business/:businessId`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "Custom Website Development",
	"description": "Professional custom website development service with modern technologies and responsive design",
	"shortDescription": "Custom website development",
	"category": "Web Development",
	"basePrice": 150000,
	"price": 150000,
	"currency": "KES",
	"duration": 30,
	"sellerAddress": "0xe91388a436659f2c0b42bcea6f7a9b7004f2f265",
	"variants": [
		{
			"name": "Basic",
			"price": 150000,
			"currency": "KES",
			"duration": 28,
			"description": "Basic website development package"
		},
		{
			"name": "Premium",
			"price": 250000,
			"currency": "KES",
			"duration": 42,
			"description": "Premium website development package with advanced features"
		}
	]
}
```

**Success Response (201):**

```json
{
	"success": true,
	"message": "Service created successfully",
	"data": {
		"id": "uuid",
		"name": "Custom Website Development",
		"description": "Professional custom website development service with modern technologies and responsive design",
		"category": "Web Development",
		"basePrice": "150000.00",
		"currency": "KES",
		"duration": 30,
		"variants": [
			{
				"id": "uuid",
				"name": "Basic",
				"price": "150000.00",
				"duration": 28,
				"description": "Basic website development package"
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
			"field": "basePrice",
			"message": "Service.basePrice cannot be null"
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
	"message": "Invalid service category",
	"code": "VALIDATION_ERROR"
}
```

### 2. Get All Services

Retrieve all services for a business.

**Endpoint:** `GET /business/:businessId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": [
		{
			"id": "uuid",
			"name": "Custom Website Development",
			"description": "Professional custom website development service with modern technologies and responsive design",
			"category": "Web Development",
			"basePrice": "150000.00",
			"currency": "KES",
			"duration": 30,
			"variants": [
				{
					"id": "uuid",
					"name": "Basic",
					"price": "150000.00",
					"duration": 28,
					"description": "Basic website development package"
				}
			]
		}
	]
}
```

### 3. Get Single Service

Retrieve details of a specific service.

**Endpoint:** `GET /:serviceId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "Custom Website Development",
		"description": "Professional custom website development service with modern technologies and responsive design",
		"category": "Web Development",
		"basePrice": "150000.00",
		"currency": "KES",
		"duration": 30,
		"variants": [
			{
				"id": "uuid",
				"name": "Basic",
				"price": "150000.00",
				"duration": 28,
				"description": "Basic website development package"
			}
		]
	}
}
```

### 4. Update Service

Update service details.

**Endpoint:** `PATCH /business/:businessId/:serviceId`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "Updated Service Name",
	"basePrice": 160000,
	"duration": 35
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "Service updated successfully",
	"data": {
		"id": "uuid",
		"name": "Updated Service Name",
		"basePrice": "160000.00",
		"duration": 35
	}
}
```

### 5. Delete Service

Delete a service.

**Endpoint:** `DELETE /business/:businessId/:serviceId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"message": "Service deleted successfully"
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

1. Service Creation:

   - Missing required fields
   - Invalid category
   - Invalid currency
   - Invalid variant data
   - Duration must be a positive integer
   - Price less than 0
   - Invalid seller address

2. Service Updates:

   - Updating non-existent service
   - Unauthorized updates
   - Invalid field values
   - Updating duration to invalid value
   - Concurrent updates

3. Service Deletion:
   - Deleting non-existent service
   - Unauthorized deletion
   - Deleting service with active orders
   - Deleting service with active bookings

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 30 days
- Service categories must be valid according to BUSINESS_CONSTANTS
- Each service must have at least one variant
- Duration is specified in minutes
- Base price must be greater than 0
- Variant prices must be greater than 0
- Variant durations must be positive integers
