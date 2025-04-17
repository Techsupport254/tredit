# **Tredit: Blockchain-Based E-Commerce Platform with Integrated Escrow**

A secure, trust-driven e-commerce platform leveraging **blockchain technology** to enable safe and transparent transactions for the **Kenyan market**, integrating **escrow services**, **decentralized dispute resolution**, and **social media verification** for vendor credibility.

---

# Comprehensive System Documentation

## 1. Executive Summary

Tredit is a blockchain-integrated e-commerce management platform designed for the Kenyan market, addressing critical challenges in digital commerce through Web3 wallet authentication, smart contract-based escrow services, decentralized dispute resolution, and social media verification. This document provides a comprehensive analysis of the system's architecture, components, and implementation.

## 2. System Overview

### 2.1 Purpose and Scope

Tredit addresses critical challenges in the Kenyan e-commerce market:

- Fraud risks in peer-to-peer transactions
- Trust issues between buyers and sellers
- Limited buyer protection in social media-based commerce
- Lack of secure payment infrastructure

The platform leverages blockchain technology to provide:

- Secure transaction handling through escrow smart contracts
- Enhanced vendor credibility via social media verification
- Decentralized dispute resolution mechanisms
- Comprehensive analytics and business management tools

### 2.2 Target Users

- **Vendors/Sellers**: Small to medium businesses selling products or services
- **Platform Administrators**: Staff managing the marketplace operations
- **Dispute Arbitrators**: Third-party mediators for conflict resolution
- **Buyers**: Customers purchasing products or services
- **System Administrators**: Technical staff managing platform infrastructure

### 2.3 System Requirements

#### 2.3.1 Functional Requirements

1. **User Management**

   - Web3 wallet authentication
   - Profile creation and management
   - Role-based access control
   - Social media verification

2. **Business Management**

   - Storefront creation and customization
   - Product/service listing management
   - Inventory tracking
   - Order processing

3. **Transaction Management**

   - Escrow-based payment processing
   - Multiple payment method support
   - Transaction history tracking
   - Payout management

4. **Dispute Resolution**

   - Dispute initiation and tracking
   - Evidence submission
   - Arbitration process
   - Resolution enforcement

5. **Analytics and Reporting**
   - Sales analytics
   - Customer insights
   - Performance metrics
   - Financial reporting

#### 2.3.2 Non-Functional Requirements

1. **Performance**

   - Page load time < 2 seconds
   - API response time < 500ms
   - Support for 1000+ concurrent users
   - Real-time updates for critical operations

2. **Security**

   - End-to-end encryption
   - Secure wallet integration
   - Regular security audits
   - Compliance with data protection regulations

3. **Scalability**

   - Horizontal scaling capability
   - Load balancing support
   - Database sharding
   - Caching mechanisms

4. **Reliability**
   - 99.9% uptime
   - Automated backup systems
   - Disaster recovery procedures
   - Error monitoring and alerting

## 3. Technology Stack

### 3.1 Frontend Architecture

- **Framework**: React.js with Vite for enhanced development experience
- **UI Libraries**: Ant Design, Tailwind CSS
- **State Management**: Context API with custom providers
- **Routing**: React Router v6
- **Data Visualization**: Chart.js, Recharts, Ant Design Plots
- **Authentication**: Web3 wallet integration (MetaMask) with JWT tokens
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Animation**: Framer Motion
- **Notifications**: React Toastify

### 3.2 Backend and API Integration

- **API Communication**: Axios with interceptors for authentication
- **Data Storage**: Local storage for session persistence
- **External APIs**: Firebase Authentication (optional Google sign-in)
- **File Storage**: IPFS for decentralized storage via Pinata
- **Real-time Updates**: WebSocket integration
- **Caching**: Redis for performance optimization
- **Search**: Elasticsearch for product search

### 3.3 Blockchain Integration

- **Blockchain Network**: Polygon (primary), with Amoy Testnet support
- **Smart Contract Language**: Solidity
- **Web3 Libraries**: Ethers.js, Viem, Wagmi
- **Wallet Integration**: Web3Modal
- **Transaction Monitoring**: Etherscan API
- **Gas Optimization**: Gas estimation and optimization
- **Multi-chain Support**: Cross-chain compatibility layer

## 4. System Architecture

### 4.1 Core Components

The application follows a modular architecture with the following key components:

#### 4.1.1 Application Bootstrapping

1. **Main Entry Point (`src/main.jsx`)**:

   - Initializes React application
   - Configures provider hierarchy
   - Sets up error boundary
   - Configures router with future flags

2. **App Component (`src/App.jsx`)**:
   - Defines route structure
   - Implements route protection logic
   - Initializes Axios interceptors
   - Manages loading states

#### 4.1.2 Context Providers

1. **AccountContext (`src/Context/AccountContext.jsx`)**:

   - Manages wallet connection state
   - Handles authentication with blockchain
   - Maintains user session persistence
   - Defines connection states and user states
   - Wallet balance monitoring
   - Network switching
   - Transaction signing
   - Tracks blockchain network compatibility
   - Handles network errors and reconnection

2. **AuthContext (`src/Context/AuthContext.jsx`)**:

   - Manages authentication tokens and user data
   - Provides login/logout functionality
   - Integrates with Firebase (optional)
   - Handles token refreshing and verification
   - Session timeout management
   - Role-based access control
   - Permission management
   - User data synchronization
   - Authentication error handling

3. **BusinessContext (`src/Context/BusinessContext.jsx`)**:

   - Manages business-related data and operations
   - Handles CRUD operations for business entities
   - Provides business selection and filtering
   - Inventory management
   - Order processing
   - Analytics tracking
   - Performance monitoring
   - Listing management for products/services

4. **LayoutContext (`src/Context/LayoutContext.jsx`)**:

   - Manages UI layout configuration
   - Controls sidebar visibility and responsive behavior
   - Theme management
   - Navigation state
   - Breadcrumb tracking
   - Modal management
   - Toast notifications
   - Responsive layout adjustments

5. **WalletProvider (`src/providers/WalletProvider.jsx`)**:
   - Provides wallet connection functionality
   - Manages connection state
   - Handles network detection
   - Network switching support
   - Gas estimation

#### 4.1.3 Layouts

1. **DashboardLayout (`src/layouts/DashboardLayout.jsx`)**:

   - Main application layout with sidebar, header, and content area
   - Lazy-loads route components for performance
   - Provides route organization for dashboard sections
   - Responsive design handling
   - Navigation state management
   - Error boundary implementation
   - Loading state management

2. **AuthLayout (`src/layouts/AuthLayout.jsx`)**:
   - Layout for authentication-related screens
   - Simplified design for onboarding flows
   - Wallet connection interface
   - Social login integration
   - Password recovery flow
   - Two-factor authentication
   - Session management

#### 4.1.4 Utility Services

1. **Storage (`src/utils/storage.js`)**:

   - Manages browser localStorage interactions
   - Provides consistent key naming
   - Handles serialization/deserialization of stored objects
   - Data encryption
   - Storage quota management
   - Data migration handling
   - Cache invalidation

2. **Error Handling (`src/utils/errors.js`, `src/utils/apiError.js`)**:

   - Standardized error handling and notification
   - Blockchain-specific error handling
   - Network error recovery
   - Error logging and monitoring
   - User-friendly error messages
   - Error tracking and analytics
   - Error reporting system
   - Categorized error codes

3. **IPFS Helper (`src/utils/ipfsHelper.jsx`)**:
   - Manages interaction with IPFS via Pinata
   - Handles profile data storage on blockchain
   - Manages smart contract interactions
   - Provides status updates during uploads
   - Error handling for blockchain operations

### 4.2 Authentication Flow

The system implements a Web3 wallet-based authentication system with optional Google account integration:

#### 4.2.1 Initial Connection

1. **Wallet Connection**:

   - User connects wallet (MetaMask or other provider)
   - Application validates wallet provider availability
   - System handles network detection and validation
   - Gas estimation and optimization
   - Network switching if on incorrect network

2. **Authentication**:

   - Application requests signature to verify wallet ownership
   - Backend validates signature and issues JWT token
   - Token and user data stored in localStorage for persistence

3. **Profile Setup**:
   - New users are directed to profile setup
   - Google authentication integration for profile verification
   - Profile data stored on blockchain via IPFS

#### 4.2.2 Session Management

1. **Token Handling**:

   - Application checks for stored credentials on startup
   - Axios interceptors attach authentication headers to requests
   - Token validation occurs on protected route access
   - Auto-reconnection for returning users
   - Session timeout handling
   - Token refresh mechanism
   - Concurrent session management

2. **Error Recovery**:
   - Network disconnection recovery
   - Invalid wallet format detection
   - Account suspension handling
   - Token expiration and refresh logic
   - Transaction failure recovery
   - Gas price optimization
   - Network switching
   - Session recovery after disconnection

### 4.3 Route Protection

The application uses a sophisticated route protection mechanism:

1. **ProtectedRoute Component**:

   - Checks authentication state before rendering components
   - Redirects unauthenticated users to login
   - Handles profile completion requirements
   - Provides loading states during authentication checks
   - Role-based access control
   - Permission validation
   - Route history tracking
   - Fast initial checking with localStorage

2. **Navigation Guards**:
   - Prevents access to restricted areas based on user state
   - Redirects to appropriate setup flows as needed
   - Preserves intended destination for post-authentication redirect
   - Route transition animations
   - Loading state management
   - Error boundary implementation
   - Analytics tracking

## 5. Key Modules and Features

### 5.1 Dashboard

The dashboard (`src/pages/Dashboard.jsx`) provides a comprehensive overview of platform activity:

- Order statistics and fulfillment status
- Revenue tracking and financial metrics
- Recent activities and notifications
- Performance visualizations via charts
- Quick access to key business functions
- Real-time updates
- Customizable widgets
- Export functionality
- Status indicators for escrow and disputes

### 5.2 Business Management

The business module enables vendors to manage their storefronts:

- Business creation and configuration (`src/pages/Business/CreateBusiness.jsx`)
- Business profile management (`src/pages/Business/BusinessDetails.jsx`)
- Listing management for products and services (`src/pages/Business/ListingsManager.jsx`)
- Inventory control and stock management (`src/pages/Business/StockControl.jsx`)
- Order processing and fulfillment (`src/pages/Business/BusinessOrders.jsx`)
- Performance analytics (`src/pages/Business/Analytics.jsx`)
- Customer management
- Review management
- Category and tag management
- Status filters for stock and services
- Price and currency handling

### 5.3 Analytics

The analytics module (`src/pages/analytics/*`) provides insights into business performance with detailed data visualization:

- Customer behavior analysis (`src/pages/analytics/CustomerInsights.jsx`)
  - Customer segmentation
  - Loyalty analysis
  - Purchase patterns
  - Rating distribution
- Product performance metrics (`src/pages/analytics/ProductPerformance.jsx`)
  - Sales breakdown by product
  - Revenue visualization
  - Rating analysis
  - Trend identification
- Sales trends and forecasting (`src/pages/analytics/SalesAnalytics.jsx`)
  - Revenue visualization
  - Period comparison
  - Sales channels analysis
  - Growth indicators
- Financial reporting and revenue tracking
- Custom report generation
- Data export functionality
- Real-time analytics
- Predictive analytics
- Interactive charts and filtering

### 5.4 Transaction Management

The transaction module handles financial operations:

- Transaction overview and monitoring (`src/pages/transactions/Overview.jsx`)
- Escrow management and fund releases (`src/pages/transactions/Escrow.jsx`)
- Payment history and record-keeping (`src/pages/transactions/History.jsx`)
- Payout configuration and scheduling (`src/pages/transactions/Payouts.jsx`)
- Multi-currency support
- Tax calculation
- Invoice generation
- Payment reconciliation
- Blockchain transaction monitoring
- Multiple payment methods support
- Transaction status tracking
- Refund processing

### 5.5 Dispute Resolution

The dispute management module facilitates conflict resolution:

- Active dispute tracking (`src/pages/disputes/Active.jsx`)
- Resolution center for mediation (`src/pages/disputes/Resolution.jsx`)
- Historical dispute records (`src/pages/disputes/History.jsx`)
- Evidence submission
- Arbitration process
- Resolution enforcement
- Dispute analytics
- Prevention mechanisms
- Status tracking (Pending, In Progress, Resolved, Closed)
- Filter and search capabilities
- Reason categorization
- Timeline visualization

## 6. User Experience Design

### 6.1 Design Principles

The application follows these design principles:

- **Responsive Layout**: Adapts to various screen sizes
- **Progressive Loading**: Lazy-loaded components for faster initial load
- **Intuitive Navigation**: Hierarchical menu structure
- **Consistent Visual Language**: Based on Ant Design and Tailwind CSS
- **Feedback Mechanisms**: Loading states, progress indicators, and notifications
- **Accessibility**: WCAG 2.1 compliance
- **Performance Optimization**: Code splitting and caching
- **Error Prevention**: Form validation and confirmation dialogs
- **Visual Hierarchy**: Clear emphasis on important elements
- **Progressive Disclosure**: Complex features revealed gradually

### 6.2 Authentication Experience

The wallet connection flow (`src/Components/Profile/ConnectWallet.jsx`) provides:

- Clear connection status indicators
- Step-by-step guidance
- Error messaging and recovery options
- Support for various wallet providers
- Network detection and validation
- Gas fee estimation
- Transaction confirmation
- Session persistence
- Visual feedback for each connection stage
- Mobile-friendly wallet connection support

## 7. Data Management

### 7.1 State Management

The application uses React Context API for state management:

- Separate contexts for different domains (auth, account, business)
- Provider components that encapsulate state logic
- Consumer hooks for accessing state throughout the application
- Optimized re-rendering through memoization
- State persistence
- State synchronization
- State validation
- Error recovery
- Action logging

### 7.2 Local Storage

Browser localStorage is used for:

- User authentication tokens
- Wallet connection details
- User profile information
- Selected business context
- Application preferences
- Form data persistence
- Cache management
- Session data
- Last viewed items
- User preferences

### 7.3 API Integration

API interactions are managed through:

- Axios instance with request/response interceptors
- Authentication header management
- Error handling and retry logic
- Response transformation and normalization
- Request caching
- Rate limiting
- Request queuing
- Response validation
- Concurrent request management
- Timeout handling

## 8. Security Considerations

### 8.1 Authentication Security

- Wallet-based authentication with cryptographic signature verification
- JWT token storage and management
- Token expiration and refresh mechanisms
- Unauthorized access prevention via protected routes
- Two-factor authentication
- Session management
- IP-based restrictions
- Device fingerprinting
- Wallet address validation
- Replay attack prevention

### 8.2 Network Security

- SSL/TLS for all API communications
- CORS policy enforcement
- API rate limiting
- Request validation and sanitization
- DDoS protection
- WAF implementation
- Network monitoring
- Security headers
- Input validation
- Output encoding

### 8.3 Blockchain Security

- Smart contract auditing
- Transaction signing confirmation flows
- Network validation to prevent wrong-chain transactions
- Gas fee estimation and warnings
- Contract upgradeability
- Emergency pause functionality
- Access control
- Event monitoring
- Replay protection
- Re-entrancy protection
- Balance monitoring

## 9. Deployment Architecture

### 9.1 Frontend Deployment

The application is built with Vite:

- Production build via `npm run build`
- Static file generation for hosting
- Environment-specific configuration
- Optimized asset bundling
- CDN integration
- Cache management
- Load balancing
- Monitoring setup
- Error tracking
- Performance monitoring

### 9.2 Environment Configuration

Environment variables are managed through:

- `.env` file for development settings
- Environment-specific configuration for production
- Secure handling of sensitive variables (API keys, contract addresses)
- Configuration validation
- Secret management
- Environment isolation
- Configuration versioning
- Fallback values
- Validation checks

## 10. Development Practices

### 10.1 Code Organization

The codebase follows a modular structure:

- Feature-based organization with clear separation of concerns
- Component-driven architecture
- Shared utilities and hooks
- Consistent naming conventions
- Documentation standards
- Code review process
- Version control workflow
- Dependency management
- Component reusability
- Code commenting

### 10.2 Build Tools

Development tooling includes:

- Vite for fast HMR and development experience
- ESLint for code quality enforcement
- PostCSS and Tailwind for CSS processing
- Path aliases for simplified imports
- Type checking
- Bundle analysis
- Performance monitoring
- Error tracking
- Hot module replacement
- Code splitting

### 10.3 Testing Strategy

The testing approach includes:

- Component testing with testing library
- Integration testing for critical flows
- Manual testing for blockchain interactions
- Test directory structure for organizing tests
- E2E testing
- Performance testing
- Security testing
- Accessibility testing
- Snapshot testing
- User acceptance testing

## 11. Technical Implementation Details

### 11.1 File Structure

```
src/
├── assets/            # Static assets and images
├── components/        # Reusable UI components
│   ├── Common/        # Generic components
│   ├── Dashboard/     # Dashboard-specific components
│   ├── Profile/       # Profile-related components
│   └── ErrorBoundary.jsx  # Error handling component
├── Context/           # React context providers
│   ├── AccountContext.jsx  # Wallet and account management
│   ├── AuthContext.jsx     # Authentication state
│   ├── BusinessContext.jsx # Business data management
│   ├── LayoutContext.jsx   # UI layout state
│   └── ProductContext.jsx  # Product management
├── layouts/           # Page layout components
│   ├── AuthLayout.jsx      # Authentication pages layout
│   └── DashboardLayout.jsx # Main application layout
├── pages/             # Application pages
│   ├── analytics/     # Analytics dashboards
│   ├── Business/      # Business management
│   ├── disputes/      # Dispute resolution
│   ├── settings/      # User settings
│   ├── transactions/  # Transaction management
│   └── Dashboard.jsx  # Main dashboard
├── providers/         # Custom providers
│   └── WalletProvider.jsx  # Wallet connection provider
├── utils/             # Utility functions
│   ├── apiError.js    # API error handling
│   ├── errors.js      # Error utilities
│   ├── ipfsHelper.jsx # IPFS integration
│   ├── notifications.js # Notification utilities
│   ├── storage.js     # LocalStorage management
│   └── toastManager.js # Toast notifications
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

### 11.2 Key Hooks and Components

1. **useAccount**: Hook for accessing wallet and account data
2. **useAuth**: Hook for authentication state and methods
3. **useBusiness**: Hook for business management operations
4. **ProtectedRoute**: Component for route access control
5. **ConnectWallet**: Component for wallet connection UI
6. **LoadingSpinner**: Component for loading states
7. **ErrorBoundary**: Component for catching and handling errors

### 11.3 API Integration

1. **Authentication API**:

   - `POST /api/users/wallet-auth`: Authenticate with wallet
   - `GET /api/users/:walletAddress`: Get user profile
   - `POST /api/users/register`: Create new user profile

2. **Business API**:

   - `GET /api/businesses/user/:userId`: Get user businesses
   - `POST /api/businesses`: Create new business
   - `GET /api/businesses/:businessId`: Get business details
   - `PUT /api/businesses/:businessId`: Update business

3. **Product/Service API**:

   - `GET /api/products/business/:businessId`: Get business products
   - `GET /api/services/business/:businessId`: Get business services
   - `POST /api/products`: Create new product
   - `POST /api/services`: Create new service

4. **Transaction API**:

   - `GET /api/orders/business/:businessId`: Get business orders
   - `GET /api/transactions/user/:userId`: Get user transactions
   - `POST /api/escrow/release`: Release escrow funds

5. **Dispute API**:
   - `GET /api/disputes/user/:userId`: Get user disputes
   - `POST /api/disputes`: Create new dispute
   - `PUT /api/disputes/:disputeId/resolve`: Resolve dispute

### 11.4 IPFS Integration

The platform uses IPFS (Pinata) for decentralized storage:

- User profiles stored on IPFS
- Profile CIDs recorded on blockchain
- Product images and files stored on IPFS
- Dispute evidence stored on IPFS
- Encryption for sensitive data
- Gateway configuration for access

### 11.5 Smart Contract Integration

The platform interacts with:

- UserProfileRegistry contract for user profile management
- Escrow smart contracts for transaction management
- Dispute resolution contracts for arbitration
- Wallet address verification
- Network validation
- Gas estimation and optimization

## 12. Features Highlights

### 12.1 🔐 Secure Transactions with Escrow

- Funds are **held in escrow** until the buyer confirms delivery
- Uses **smart contracts** to eliminate fraud risks
- Automated fund release
- Dispute resolution integration
- Multi-currency support
- Transaction tracking
- Fee management
- Refund processing
- Real-time status updates
- Blockchain verification

### 12.2 📜 Decentralized Dispute Resolution

- **Community-driven arbitration** resolves conflicts fairly
- Inspired by **Kleros**, ensuring transparent dispute resolution
- Evidence submission system
- Voting mechanism
- Resolution enforcement
- Dispute analytics
- Prevention strategies
- Reputation system
- Time-bound resolution
- Incentivized participation

### 12.3 👤 Social Media Verification

- Vendors can **link social media accounts** for credibility
- Builds **trust through past transactions and online presence**
- Automated verification
- Profile scoring
- Activity monitoring
- Review aggregation
- Trust indicators
- Reputation tracking
- Cross-platform verification
- Fraud detection

### 12.4 🛍️ E-Commerce Marketplace

- Supports both **physical product sales** and **freelance services**
- Vendors get **custom storefronts** with verified listings
- Product categorization
- Search functionality
- Filtering options
- Recommendation engine
- Wishlist management
- Cart functionality
- Rating and review system
- Inventory management

### 12.5 💳 Multiple Payment Methods

- Integrates **crypto payments (MATIC, USDT)** and fiat transactions
- Secure **smart contract-based fund releases**
- Payment gateway integration
- Currency conversion
- Payment scheduling
- Invoice generation
- Receipt management
- Refund processing
- Tax calculation
- Payment verification

### 12.6 📊 Dashboard & Analytics

- Track **order status, sales, and escrow balances**
- View **buyer/seller ratings and transaction history**
- Custom reports
- Data visualization
- Export functionality
- Real-time updates
- Performance metrics
- Trend analysis
- Customer insights
- Product performance tracking

## 13. Installation & Setup

### 13.1 Prerequisites

- Node.js 16+ and npm 7+
- MetaMask or compatible Web3 wallet
- Polygon Amoy Testnet configured in MetaMask
- IPFS account (Pinata)
- Firebase project (optional)

### 13.2 Environment Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/tredit-admin.git
cd tredit-admin

# Install dependencies
npm install
```

### 13.3 Configuration

Create a `.env` file in the root directory with the following variables:

```
# Contract Address
VITE_CONTRACT_ADDRESS=your_contract_address

# API URL
VITE_PUBLIC_API_URL=your_api_url

# Blockchain Configuration
POLYGON_AMOY_RPC=your_polygon_rpc_url
POLYGON_AMOY_CHAIN_ID=80002

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_BASE_URL=https://api.pinata.cloud
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

### 13.4 Development Server

```bash
# Start the development server
npm run dev
```

The server will start at: **http://localhost:5173/**

### 13.5 Building for Production

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

## 14. Troubleshooting

### 14.1 Common Issues

1. **Wallet Connection Issues**

   - Ensure MetaMask is installed and unlocked
   - Check network connection
   - Verify correct network is selected
   - Clear browser storage and reconnect

2. **Transaction Failures**

   - Check wallet balance
   - Verify gas settings
   - Ensure correct network
   - Check smart contract status

3. **API Connection Issues**
   - Verify API URL is correct
   - Check network connectivity
   - Validate authentication token
   - Check CORS settings

### 14.2 Error Codes

- **AUTH_INVALID_CREDENTIALS**: Invalid credentials provided
- **AUTH_TOKEN_EXPIRED**: Session expired
- **BLOCKCHAIN_TRANSACTION_FAILED**: Transaction failed
- **BLOCKCHAIN_CONTRACT_ERROR**: Smart contract error
- **BLOCKCHAIN_NETWORK_ERROR**: Network error
- **BLOCKCHAIN_INSUFFICIENT_FUNDS**: Insufficient funds

## 15. Future Enhancements

1. **AI-powered fraud detection**:

   - Implement machine learning for transaction analysis
   - Develop pattern recognition for suspicious activities
   - Create automated risk scoring
   - Real-time monitoring
   - Predictive analytics
   - Automated reporting
   - Risk mitigation strategies
   - Behavioral anomaly detection

2. **Mobile Application**:

   - Develop native mobile applications for iOS and Android
   - Implement mobile-specific wallet connections
   - Optimize UX for mobile interactions
   - Offline functionality
   - Push notifications
   - Mobile payments
   - Location services
   - QR code integration

3. **Multi-chain support**:
   - Extend beyond Polygon to other blockchain networks
   - Implement cross-chain asset bridging
   - Support various token standards
   - Chain selection interface
   - Gas optimization
   - Transaction monitoring
   - Network switching
   - Layer 2 scaling solutions

## 👨‍💻 Author & Supervisor

- **👤 Victor Kipkorir Kirui** (Developer)
- **📘 Supervisor: Dr. Dennis Kaburu**

## 📜 License

This project is licensed under the **MIT License**.

🔥 **Empowering trust in Kenyan e-commerce with blockchain!** 🚀
