# Business API Documentation

## Overview

This document outlines all business-related API endpoints, their request/response formats, and error handling.

## Base URL

```
http://localhost:8000/api/businesses
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Business

Create a new business.

**Endpoint:** `POST /`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "Tech Solutions Ltd",
	"description": "Professional technology solutions provider",
	"shortDescription": "Tech solutions provider",
	"category": "Technology",
	"address": "123 Tech Street, Nairobi",
	"phone": "+254700000000",
	"email": "contact@techsolutions.com",
	"website": "https://techsolutions.com",
	"logo": "https://techsolutions.com/logo.png",
	"currency": "KES",
	"timezone": "Africa/Nairobi",
	"socialMedia": {
		"facebook": "https://facebook.com/techsolutions",
		"twitter": "https://twitter.com/techsolutions",
		"instagram": "https://instagram.com/techsolutions"
	}
}
```

**Success Response (201):**

```json
{
	"success": true,
	"message": "Business created successfully",
	"data": {
		"id": "uuid",
		"name": "Tech Solutions Ltd",
		"description": "Professional technology solutions provider",
		"category": "Technology",
		"currency": "KES",
		"timezone": "Africa/Nairobi"
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
			"field": "name",
			"message": "Business name is required"
		}
	]
}
```

2. Duplicate Business (409):

```json
{
	"success": false,
	"message": "Business with this name already exists",
	"code": "RESOURCE_EXISTS"
}
```

### 2. Get All Businesses

Retrieve all businesses for the authenticated user.

**Endpoint:** `GET /`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": [
		{
			"id": "uuid",
			"name": "Tech Solutions Ltd",
			"description": "Professional technology solutions provider",
			"category": "Technology",
			"currency": "KES",
			"timezone": "Africa/Nairobi"
		}
	]
}
```

### 3. Get Single Business

Retrieve details of a specific business.

**Endpoint:** `GET /:businessId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "Tech Solutions Ltd",
		"description": "Professional technology solutions provider",
		"category": "Technology",
		"currency": "KES",
		"timezone": "Africa/Nairobi",
		"address": "123 Tech Street, Nairobi",
		"phone": "+254700000000",
		"email": "contact@techsolutions.com",
		"website": "https://techsolutions.com",
		"logo": "https://techsolutions.com/logo.png",
		"socialMedia": {
			"facebook": "https://facebook.com/techsolutions",
			"twitter": "https://twitter.com/techsolutions",
			"instagram": "https://instagram.com/techsolutions"
		}
	}
}
```

### 4. Update Business

Update business details.

**Endpoint:** `PATCH /:businessId`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "Updated Business Name",
	"description": "Updated business description",
	"currency": "USD"
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "Business updated successfully",
	"data": {
		"id": "uuid",
		"name": "Updated Business Name",
		"description": "Updated business description",
		"currency": "USD"
	}
}
```

### 5. Delete Business

Delete a business.

**Endpoint:** `DELETE /:businessId`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"message": "Business deleted successfully"
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

1. Business Creation:

   - Missing required fields
   - Invalid category
   - Invalid currency
   - Invalid email format
   - Invalid phone number format
   - Invalid website URL
   - Duplicate business name

2. Business Updates:

   - Updating non-existent business
   - Unauthorized updates
   - Invalid field values
   - Updating business name to existing one
   - Concurrent updates

3. Business Deletion:
   - Deleting non-existent business
   - Unauthorized deletion
   - Deleting business with active products
   - Deleting business with active services
   - Deleting business with active orders

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 30 days
- Business categories must be valid according to BUSINESS_CONSTANTS
- Currency must be a valid ISO 4217 code
- Timezone must be a valid IANA timezone identifier
- Phone numbers should be in E.164 format
- Website URLs must be valid and accessible
- Social media URLs must be valid
