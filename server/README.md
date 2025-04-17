# Tredit Platform - System Analysis and Design Documentation

## 1. System Overview

Tredit is a comprehensive blockchain-enabled e-commerce and services platform that facilitates business management, product/service listings, orders, and customer interactions. The system integrates with the Polygon blockchain network for data storage, verification, and dispute resolution.

### 1.1 Core Features

- User management with blockchain wallet authentication
- Business profile creation and management
- Product and service listings with variants
- Order processing and tracking
- Shopping cart functionality (both for products and services)
- Dispute resolution with blockchain integration
- Team member management for businesses
- Chat functionality
- Social media integration
- Real-time notifications via WebSockets
- Payment processing
- Analytics for users and businesses

## 2. Technology Stack

### 2.1 Backend Technologies

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Blockchain**: Ethereum/Polygon with Ethers.js
- **Smart Contracts**: Solidity (v0.8.20)
- **IPFS Storage**: Pinata API
- **Real-time Communication**: Socket.IO
- **API Testing**: Mocha, Chai, Sinon
- **Security**: CORS, Helmet, Rate limiting

### 2.2 Blockchain & Smart Contracts

- **Network**: Polygon Amoy (Testnet)
- **Smart Contracts**:
  - UserProfile: Manages user profiles on the blockchain
  - Business: Handles business data
  - Dispute: Manages dispute resolution

## 3. Architecture

### 3.1 System Architecture

The system follows a modular architecture with clearly separated concerns:

1. **API Layer**: Express routes and controllers
2. **Business Logic**: Service modules
3. **Data Access Layer**: Sequelize models
4. **Integration Layer**: Blockchain and IPFS interaction
5. **Utilities & Helpers**: Common functionality

### 3.2 Database Design

The database design follows a relational model with well-defined relationships and associations:

### Core Entities and Their Relationships

#### 1. User Model

- **Primary Key**: `id`
- **Relationships**:
  - Has many `Business` (as owner)
  - Has many `Order` (as customer)
  - Has many `Cart` (as customer)
  - Has many `ServiceCart` (as customer)
  - Has many `ServiceOrder` (as customer)
  - Has many `ChatSession` (as participant)
  - Has many `Message` (as sender)
  - Has many `Dispute` (as initiator)
  - Has many `BusinessTeamMember` (as member)
  - Has one `UserProfile` (on blockchain)
  - Has many `SocialMediaAccount` (linked accounts)

#### 2. Business Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (owner)
  - Has many `Product` (products)
  - Has many `Service` (services)
  - Has many `Order` (orders)
  - Has many `BusinessTeamMember` (team members)
  - Has many `ChatSession` (as business)
  - Has many `Dispute` (as business)
  - Has one `BusinessProfile` (on blockchain)
  - Has many `SocialMediaAccount` (linked accounts)
  - Has many `Analytics` (business metrics)

#### 3. BusinessTeamMember Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (member)
  - Belongs to `Business` (business)
  - Has many `Permission` (role-based permissions)

#### 4. Product Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Business` (owner)
  - Has many `ProductVariant` (variants)
  - Has many `OrderItem` (ordered items)
  - Has many `CartItem` (cart items)
  - Has many `Category` (categories)
  - Has many `Media` (product media)
  - Has many `Analytics` (product metrics)

#### 5. ProductVariant Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Product` (parent product)
  - Has many `OrderItem` (ordered variants)
  - Has many `CartItem` (cart items)
  - Has many `Inventory` (stock levels)

#### 6. Service Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Business` (owner)
  - Has many `ServiceOrder` (orders)
  - Has many `ServiceCart` (cart items)
  - Has many `Category` (categories)
  - Has many `Media` (service media)
  - Has many `Analytics` (service metrics)

#### 7. Order Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (customer)
  - Belongs to `Business` (seller)
  - Has many `OrderItem` (items)
  - Has one `ShippingAddress` (delivery)
  - Has one `BillingAddress` (billing)
  - Has one `Payment` (payment details)
  - Has one `Dispute` (if disputed)
  - Has many `OrderStatus` (status history)

#### 8. OrderItem Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Order` (parent order)
  - Belongs to `Product` (product)
  - Belongs to `ProductVariant` (variant)

#### 9. Cart Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (owner)
  - Has many `CartItem` (items)

#### 10. CartItem Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Cart` (parent cart)
  - Belongs to `Product` (product)
  - Belongs to `ProductVariant` (variant)

#### 11. ServiceCart Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (owner)
  - Has many `ServiceCartItem` (items)

#### 12. ServiceOrder Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (customer)
  - Belongs to `Business` (provider)
  - Belongs to `Service` (service)
  - Has one `ServiceSchedule` (scheduling)
  - Has one `Payment` (payment details)
  - Has one `Dispute` (if disputed)

#### 13. ChatSession Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (participant)
  - Belongs to `Business` (business)
  - Has many `Message` (messages)

#### 14. Message Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `ChatSession` (session)
  - Belongs to `User` (sender)
  - Has many `Media` (attachments)

#### 15. Dispute Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `User` (initiator)
  - Belongs to `Business` (business)
  - Belongs to `Order` (order)
  - Has many `DisputeEvidence` (evidence)
  - Has many `DisputeResolution` (resolutions)
  - Has one `DisputeContract` (on blockchain)

#### 16. Category Model

- **Primary Key**: `id`
- **Relationships**:
  - Has many `Product` (products)
  - Has many `Service` (services)
  - Belongs to `Category` (parent category)
  - Has many `Category` (subcategories)

#### 17. Media Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Product` (product media)
  - Belongs to `Service` (service media)
  - Belongs to `Message` (message attachments)
  - Has one `IPFSRecord` (IPFS storage)

#### 18. Analytics Model

- **Primary Key**: `id`
- **Relationships**:
  - Belongs to `Business` (business metrics)
  - Belongs to `Product` (product metrics)
  - Belongs to `Service` (service metrics)
  - Belongs to `User` (user metrics)

### Association Types

1. **One-to-One Relationships**:

   - User ↔ UserProfile (blockchain)
   - Business ↔ BusinessProfile (blockchain)
   - Order ↔ ShippingAddress
   - Order ↔ BillingAddress
   - Order ↔ Payment
   - ServiceOrder ↔ ServiceSchedule

2. **One-to-Many Relationships**:

   - User → Business (owner)
   - User → Order (customer)
   - User → Cart (owner)
   - Business → Product (products)
   - Business → Service (services)
   - Product → ProductVariant (variants)
   - Order → OrderItem (items)
   - ChatSession → Message (messages)

3. **Many-to-Many Relationships**:
   - User ↔ Business (through BusinessTeamMember)
   - Product ↔ Category
   - Service ↔ Category
   - User ↔ ChatSession (participants)
   - Business ↔ ChatSession (business chats)

### Database Constraints

1. **Foreign Key Constraints**:

   - All relationships are enforced with foreign key constraints
   - Cascade delete rules for dependent records
   - Null constraints for required fields

2. **Unique Constraints**:

   - User email addresses
   - Business names within a category
   - Product SKUs within a business
   - Service names within a business

3. **Indexes**:
   - User email and wallet address
   - Business name and category
   - Product name and SKU
   - Order status and dates
   - Chat session participants

## 4. Module Breakdown

### 4.1 User Management

- Registration with wallet address authentication
- Profile management
- Role-based permissions
- Google OAuth integration
- Blockchain profile storage

### 4.2 Business Management

- Business creation and profile management
- Team management with role-based permissions
- Business verification
- Blockchain data storage

### 4.3 Product & Service Management

- Product/service creation with variants
- Inventory management
- Category organization
- Media handling
- SEO optimization
- Analytics tracking

### 4.4 Order Processing

- Cart management
- Order creation and tracking
- Payment processing
- Order status updates
- Shipping information

### 4.5 Dispute Resolution

- Dispute creation and tracking
- Evidence submission
- Resolution process
- Blockchain verification

### 4.6 Communication

- Chat system between users and businesses
- Real-time messaging
- Notification system
- Social media integration

## 5. API Structure

The API follows RESTful principles with a clear endpoint structure:

### Core Endpoints:

- `/api/users`: User management
- `/api/businesses`: Business management
- `/api/products`: Product management
- `/api/services`: Service management
- `/api/orders`: Order management
- `/api/cart`: Cart management
- `/api/service-orders`: Service order management
- `/api/service-carts`: Service cart management
- `/api/chat`: Chat functionality
- `/api/team-members`: Team member management
- `/api/google`: Google integration
- `/api/upload`: File uploads
- `/api/social-media`: Social media management

### Authentication & Security:

- JWT-based authentication
- Rate limiting on sensitive endpoints
- Proper error handling
- Input validation

## 6. Blockchain Integration

### 6.1 Smart Contracts

1. **UserProfile Contract**:

   - Stores user profile data on the blockchain
   - Maps wallet addresses to IPFS URIs containing profile data
   - Handles profile updates and status changes

2. **Business Contract**:

   - Manages business entity data
   - Handles creation, updates, and deletion of businesses
   - Links businesses to owner wallet addresses

3. **Dispute Contract**:
   - Manages dispute processes
   - Handles evidence submission
   - Tracks dispute resolution status

### 6.2 IPFS Integration

- User profiles stored on IPFS with Pinata
- Business profiles stored on IPFS
- Product/service data stored on IPFS
- Dispute evidence stored on IPFS

## 7. Data Models

### 7.1 User Model

- Core fields: id, walletAddress, name, email, role, status
- Profile fields: gender, dob, phoneNumber, location, bio
- Preferences and settings
- Blockchain transaction records

### 7.2 Business Model

- Core fields: id, name, description, category, currency
- Address and contact information
- Social media links
- Team members and permissions
- Blockchain records

### 7.3 Product/Service Models

- Core fields: id, name, description, price, currency
- Variants with pricing and inventory
- Categories and tags
- Media attachments
- Analytics tracking

### 7.4 Order Model

- Order details: id, userId, businessId, status
- Financial information: subtotal, tax, shipping, total
- Items: linked products with quantity and pricing
- Shipping and billing addresses
- Payment details

## 8. Security Considerations

- JWT-based authentication
- Rate limiting to prevent abuse
- Input validation for all endpoints
- CORS configuration
- Environment variable protection
- Error handling without leaking sensitive information

## 9. Deployment Architecture

The system is designed to be deployed in various environments:

- Development: Local environment for development
- Testing: Staging environment for testing
- Production: Production environment with proper scaling

## 10. Integration Points

- **Google OAuth**: For user authentication
- **YouTube API**: For video integration
- **Polygon Blockchain**: For data verification and storage
- **Pinata IPFS**: For decentralized storage
- **Social Media Platforms**: For content management

## 11. Monitoring and Logging

- Console logging for development
- Server logs for production debugging
- Transaction tracking for blockchain operations
- Error monitoring and reporting

## 12. Future Considerations

- Enhanced analytics and reporting
- Mobile application integration
- Additional payment methods
- Expanded blockchain functionality
- AI-powered recommendations
- Advanced search capabilities

## 13. Installation and Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Polygon wallet with Amoy testnet configuration
- Pinata IPFS account

### Installation Steps

1. Clone the repository

```bash
git clone https://github.com/yourusername/tredit-server.git
cd tredit-server
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up PostgreSQL database

```bash
# Create database
createdb tredit_dev

# Run migrations
npm run migrate
```

5. Compile and deploy smart contracts (if needed)

```bash
npm run compile
npm run deploy
```

6. Start development server

```bash
npm run dev
```

## 14. Directory Structure

```
tredit/server/
├── admin/                   # Admin functionality
├── artifacts/               # Smart contract artifacts
├── cache/                   # Solidity cache
├── config/                  # Configuration files
├── contracts/               # Smart contracts
├── controllers/             # API controllers
├── DBStructure/             # Database schema documentation
├── documentation/           # API documentation
├── logs/                    # Log files
├── middleware/              # Express middleware
├── migrations/              # Database migrations
├── models/                  # Sequelize models
├── routes/                  # API routes
├── schemas/                 # Validation schemas
├── scripts/                 # Utility scripts
├── services/                # Business logic services
├── utils/                   # Helper utilities
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── .sequelizerc             # Sequelize configuration
├── app.js                   # Express application setup
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Project dependencies
├── README.md                # Project documentation
└── server.js                # Server entry point
```

## 15. API Documentation

For detailed API documentation, please refer to the `/documentation` directory or visit our [API documentation site](https://docs.tredit.com).

## 16. Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 17. License

This project is licensed under the MIT License - see the LICENSE file for details.

## 18. Contact

- Project Maintainer: [Your Name](mailto:your.email@example.com)
- Website: [tredit.com](https://tredit.com)
- Support: [support@tredit.com](mailto:support@tredit.com)
