## User Analytics

### Get User Analytics Dashboard

- **URL**: `/api/users/analytics`
- **Method**: `GET`
- **Auth required**: Yes (JWT Token)
- **Query Parameters**:
  - `timeframe` (optional): Filter data by timeframe - 'week', 'month', 'year', 'all' (default: 'all')
- **Success Response**:
  - **Code**: 200
  - **Content**:
  ```json
  {
    "success": true,
    "message": "User analytics retrieved successfully",
    "data": {
      "accountSummary": {
        "userId": "uuid",
        "name": "User Name",
        "email": "user@example.com",
        "walletAddress": "0x...",
        "profileImage": "url",
        "accountAge": 120,
        "profileCompletion": 85,
        "lastLogin": "2023-05-01T10:00:00Z",
        "status": "active",
        "role": "user"
      },
      "orderActivity": {
        "totalOrders": 15,
        "ordersByStatus": [...],
        "totalSpending": 1250.50,
        "averageOrderValue": 83.37,
        "recentOrders": [...]
      },
      "serviceActivity": {
        "totalServiceOrders": 8,
        "serviceOrdersByStatus": [...],
        "totalServiceSpending": 750.00,
        "upcomingAppointments": [...]
      },
      "businessEngagement": {
        "teamMemberships": [...],
        "ownedBusinesses": [...]
      },
      "supportActivity": {
        "openDisputes": 1,
        "disputesByStatus": [...]
      },
      "communication": {
        "totalChatSessions": 10,
        "unreadMessages": 3,
        "activeChats": [...]
      },
      "shoppingBehavior": {
        "productsInCart": [...],
        "servicesInCart": [...],
        "favoriteBusinesses": [...]
      },
      "timeframe": "all"
    }
  }
  ```
- **Error Response**:
  - **Code**: 401
    - **Content**: `{ "success": false, "message": "Not authorized" }`
  - **Code**: 404
    - **Content**: `{ "success": false, "message": "User not found" }`
  - **Code**: 500
    - **Content**: `{ "success": false, "message": "Failed to fetch user analytics" }`
