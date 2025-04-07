# Tredit API Documentation

## Overview

This documentation provides comprehensive information about the Tredit API endpoints, including request/response formats, authentication, error handling, and best practices.

## Table of Contents

1. [User API](./api/users/README.md)

   - User registration and authentication
   - Profile management
   - Google integration
   - Profile setup events

2. [Business API](./api/businesses/README.md)

   - Business creation and management
   - Business profile
   - Business verification
   - Business analytics

3. [Services API](./api/services/README.md)

   - Service creation and management
   - Service categories
   - Service pricing
   - Service availability

4. [Orders API](./api/orders/README.md)

   - Order creation and management
   - Order status updates
   - Payment processing
   - Order history

5. [Chat API](./api/chat/README.md)

   - Chat sessions
   - Message handling
   - Real-time communication
   - Chat history

6. [Analytics API](./api/analytics/README.md)

   - Business analytics
   - User analytics
   - Performance metrics
   - Reporting

7. [Admin API](./api/admin/README.md)
   - User management
   - System configuration
   - Monitoring
   - Maintenance

## Getting Started

### Base URL

```
http://localhost:8000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per user

### Error Handling

All endpoints follow a consistent error response format:

```json
{
	"success": false,
	"message": "Error description",
	"code": "ERROR_CODE",
	"details": null
}
```

### Common HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

### Best Practices

1. Always include proper error handling
2. Use appropriate HTTP methods
3. Validate input data
4. Handle rate limiting
5. Implement proper authentication
6. Use pagination for large datasets
7. Cache responses when appropriate
8. Follow RESTful conventions

## Development

### Local Development

1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Run the development server

### Testing

- Unit tests
- Integration tests
- API tests
- Load tests

### Deployment

- Staging environment
- Production environment
- Monitoring and logging
- Backup and recovery

## Support

For API support, please contact:

- Email: support@tredit.com
- Documentation: https://docs.tredit.com
- GitHub Issues: https://github.com/tredit/server/issues
