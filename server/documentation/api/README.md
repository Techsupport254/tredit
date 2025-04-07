# Tredit API Documentation

Welcome to the Tredit API documentation. This documentation provides comprehensive information about the available endpoints, request/response formats, authentication mechanisms, and error handling.

## API Overview

The Tredit API is a RESTful API that allows clients to interact with the Tredit platform. It provides endpoints for user management, business operations, blockchain interactions, and more.

## Base URL

```
http://localhost:8000/api
```

For production:

```
https://api.tredit.io/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT). To authenticate:

1. Obtain a token through the authentication endpoints (`/users/wallet-auth`)
2. Include the token in the Authorization header of subsequent requests:

```
Authorization: Bearer <your_token>
```

## API Sections

The API is organized into several sections:

### [User API](/api/users/README.md)

Endpoints for user registration, authentication, profile management, and account operations.

### [Business API](/api/businesses/README.md)

Endpoints for creating, managing, and interacting with business profiles. These endpoints handle business data, team management, and blockchain storage.

### [Transaction API](/api/transactions/README.md)

Endpoints for managing blockchain transactions, including transaction status, history, and confirmation.

## General Response Format

All API responses follow a consistent format:

### Success Response

```json
{
	"success": true,
	"message": "Operation successful",
	"data": {
		// Response data goes here
	},
	"timestamp": "2025-03-26T15:00:27.204Z"
}
```

### Error Response

```json
{
	"success": false,
	"error": "Error message",
	"code": "ERROR_CODE",
	"details": {
		// Additional error details (optional)
	},
	"timestamp": "2025-03-26T15:00:27.204Z"
}
```

## Error Codes

| Code               | Description                            |
| ------------------ | -------------------------------------- |
| `BAD_REQUEST`      | Invalid request parameters or body     |
| `UNAUTHORIZED`     | Authentication required or failed      |
| `FORBIDDEN`        | Not permitted to perform the action    |
| `NOT_FOUND`        | Resource not found                     |
| `VALIDATION_ERROR` | Input validation failed                |
| `RESOURCE_EXISTS`  | Resource already exists                |
| `INTERNAL_ERROR`   | Server-side error                      |
| `BLOCKCHAIN_ERROR` | Error related to blockchain operations |
| `IPFS_ERROR`       | Error related to IPFS operations       |

## Rate Limiting

To ensure fair usage and system stability, the API implements rate limiting:

- General API endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per hour per IP
- Sensitive operations: 10 requests per hour per IP

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response.

## Pagination

For endpoints that return lists of items, pagination is supported using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

Example:

```
GET /api/businesses?page=2&limit=20
```

## Data Validation

All submitted data is validated before processing. If validation fails, the API returns a `400 Bad Request` response with details about the validation errors.

## Blockchain Integration

The API integrates with the Polygon blockchain for data storage and verification. Some operations may take longer due to blockchain confirmation times.

## WebSocket Events

Real-time updates are available through WebSocket connections for certain features:

- Transaction status updates
- Business verification status changes
- Team member invitations

## API Versioning

The current API version is v1. The version is not included in the URL path but will be in future releases when breaking changes are introduced.

## Further Documentation

For more detailed information about specific endpoints, refer to the documentation for each API section.
