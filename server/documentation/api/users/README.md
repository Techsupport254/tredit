# User API Documentation

## Overview

This document outlines all user-related API endpoints, their request/response formats, and error handling.

## Base URL

```
http://localhost:8000/api/users
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Health Check

Check if the server is operational.

**Endpoint:** `GET /health`

**Authentication:** None

**Response:**

```json
{
	"success": true,
	"message": "Server is healthy",
	"data": {
		"timestamp": "2025-03-26T07:43:39.904Z",
		"database": "connected"
	}
}
```

### 2. User Registration

Register a new user with wallet address.

**Endpoint:** `POST /register`

**Authentication:** None

**Request Body:**

```json
{
	"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
	"name": "John Doe",
	"email": "john@example.com",
	"storeOnBlockchain": true
}
```

**Success Response (201):**

```json
{
	"success": true,
	"message": "User registered successfully",
	"data": {
		"token": "jwt_token_here",
		"user": {
			"id": "uuid",
			"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			"name": "John Doe",
			"email": "john@example.com",
			"role": "user"
		}
	}
}
```

**Error Responses:**

1. Wallet Address Already Registered (409):

```json
{
	"success": false,
	"message": "Wallet address already registered",
	"code": "RESOURCE_EXISTS",
	"details": null,
	"timestamp": "2025-03-26T07:59:36.527Z"
}
```

2. Email Already Registered (409):

```json
{
	"success": false,
	"message": "Email already registered",
	"code": "RESOURCE_EXISTS",
	"details": null,
	"timestamp": "2025-03-26T08:00:45.348Z"
}
```

3. Invalid Wallet Address Format (400):

```json
{
	"success": false,
	"message": "Invalid wallet address format",
	"code": "VALIDATION_ERROR",
	"details": null,
	"timestamp": "2025-03-26T08:00:29.025Z"
}
```

4. Missing Required Fields (400):

```json
{
	"success": false,
	"message": "Email is required",
	"code": "VALIDATION_ERROR",
	"details": null,
	"timestamp": "2025-03-26T08:00:57.345Z"
}
```

**Edge Cases:**

1. Wallet address already registered (409)
2. Email already registered (409)
3. Invalid wallet address format (400)
4. Missing required fields (400)
5. Invalid email format (400)
6. Empty name (400)
7. Invalid JSON body (400)
8. Blockchain storage failure (500)

**Validation Rules:**

- Wallet address must be a valid Ethereum address (42 characters, starting with "0x")
- Wallet address must be unique
- Email must be a valid email format
- Email must be unique
- Name is required and cannot be empty
- `storeOnBlockchain` is optional (defaults to false)
- Request body must be valid JSON

**Required Fields:**

- `walletAddress` (string)
- `name` (string)
- `email` (string)

**Optional Fields:**

- `storeOnBlockchain` (boolean)

### 3. Wallet Authentication

Authenticate user using wallet address.

**Endpoint:** `POST /wallet-auth`

**Authentication:** None

**Request Body:**

```json
{
	"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265"
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "Authentication successful",
	"data": {
		"token": "jwt_token_here",
		"user": {
			"id": "uuid",
			"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			"name": "John Doe",
			"email": "john@example.com",
			"profileImage": null,
			"role": "user",
			"createdAt": "2025-03-25T20:31:00.739Z",
			"updatedAt": "2025-03-25T20:31:11.644Z"
		}
	},
	"exists": true
}
```

**Error Responses:**

1. Non-existent Wallet Address (404):

```json
{
	"success": false,
	"error": "User not found",
	"code": "NOT_FOUND",
	"exists": false
}
```

2. Invalid Wallet Address Format (400):

```json
{
	"success": false,
	"error": "Invalid wallet address format",
	"code": "VALIDATION_ERROR"
}
```

3. Missing Wallet Address (400):

```json
{
	"success": false,
	"error": "Wallet address is required",
	"code": "VALIDATION_ERROR"
}
```

4. Invalid JSON Body (400):

```json
{
	"status": 400,
	"error": {
		"expose": true,
		"statusCode": 400,
		"status": 400,
		"body": "invalid-json",
		"type": "entity.parse.failed"
	},
	"message": "Unexpected token 'i', \"invalid-json\" is not valid JSON"
}
```

**Edge Cases:**

1. Non-existent wallet address (404)
2. Invalid wallet address format (400)
3. Empty wallet address (400)
4. Missing wallet address field (400)
5. Invalid JSON body (400)
6. Malformed wallet address (wrong length) (400)
7. Wallet address with invalid characters (400)
8. Wallet address without "0x" prefix (400)

**Validation Rules:**

- Wallet address must be a valid Ethereum address (42 characters, starting with "0x")
- Wallet address must contain only hexadecimal characters (0-9, a-f)
- Wallet address is required and cannot be empty
- Request body must be valid JSON

### 4. Get User Profile

Retrieve user profile by wallet address.

**Endpoint:** `GET /profile/:walletAddress`

**Authentication:** Required

**Success Response (200):**

```json
{
	"success": true,
	"message": "User profile retrieved successfully",
	"data": {
		"id": "uuid",
		"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
		"name": "John Doe",
		"email": "john@example.com",
		"profileImage": null,
		"role": "user",
		"createdAt": "2025-03-25T20:31:00.739Z",
		"updatedAt": "2025-03-25T20:31:11.644Z"
	}
}
```

**Error Responses:**

- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: Not authorized to access this profile
- 404 Not Found: User not found

### 5. Update User Profile

Update user profile information.

**Endpoint:** `PATCH /profile/:walletAddress`

**Authentication:** Required

**Request Body:**

```json
{
	"name": "John Doe Updated",
	"email": "john.updated@example.com",
	"profileImage": "https://example.com/image.jpg"
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "User profile updated successfully",
	"data": {
		"token": "new_jwt_token_here",
		"user": {
			"id": "uuid",
			"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			"name": "John Doe Updated",
			"email": "john.updated@example.com",
			"profileImage": "https://example.com/image.jpg",
			"role": "user",
			"updatedAt": "2025-03-25T20:31:11.644Z"
		}
	}
}
```

**Error Responses:**

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or missing token
- 403 Forbidden: Not authorized to update this profile
- 404 Not Found: User not found

### 6. Complete Profile with Google Data

Complete user profile using Google account data.

**Endpoint:** `POST /complete-profile`

**Authentication:** Required

**Request Body:**

```json
{
	"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
	"email": "john@gmail.com",
	"displayName": "John Doe",
	"photoURL": "https://example.com/photo.jpg",
	"uid": "google_uid"
}
```

**Success Response (200):**

```json
{
	"success": true,
	"message": "Profile completed successfully",
	"data": {
		"user": {
			"id": "uuid",
			"walletAddress": "0xe91388A436659f2c0b42BCea6f7a9B7004F2f265",
			"name": "John Doe",
			"email": "john@gmail.com",
			"profileImage": "https://example.com/photo.jpg",
			"role": "user"
		}
	}
}
```

**Error Responses:**

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or missing token
- 409 Conflict: User profile already exists
- 404 Not Found: User not found

### 7. Profile Setup Events

Stream profile setup events.

**Endpoint:** `GET /profile-setup-events`

**Authentication:** Required

**Response:**
Server-Sent Events (SSE) stream with events:

```json
{
	"event": "profile_setup",
	"data": {
		"status": "completed",
		"message": "Profile setup completed successfully"
	}
}
```

**Error Responses:**

- 401 Unauthorized: Invalid or missing token
- 500 Internal Server Error: Event stream error

## Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: User lacks required permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server internal error

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 30 days
- Wallet addresses must be valid Ethereum addresses
- Email addresses must be unique
