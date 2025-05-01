# Tredit - Blockchain-Based E-commerce Platform with Escrow

**Author:** Victor Kipkorir Kirui  
**Reg No:** SCT221-0111/2021

---

A secure, blockchain-powered e-commerce and service platform with integrated escrow and social media features, designed for Kenyan SMEs. Tredit leverages modern web and blockchain technologies to provide a trusted, transparent, and user-friendly marketplace for buyers and sellers.

## Table of Contents

- [Project Overview](#project-overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Support & Documentation](#support--documentation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Project Overview

Tredit is a decentralized e-commerce platform tailored for the Kenyan market, combining:

- **Blockchain-based escrow** for secure transactions
- **Social media integration** for business growth
- **Local payment gateways** (M-Pesa, Paystack)
- **User and business verification**
- **Dispute resolution**

The platform is built with Next.js, TypeScript, Tailwind CSS, and Solidity smart contracts on Polygon. It supports both fiat and crypto payments, leverages IPFS for decentralized file storage, and provides a seamless, mobile-first user experience.

**Target Users:**

- Small and medium businesses (SMEs)
- Individual sellers and buyers
- Platform administrators
- Developers and integrators

**Unique Value:**

- Reduces online fraud with escrow and verification
- Enables easy sharing and marketing via social media
- Supports local payment habits and currencies
- Transparent, auditable, and scalable

## Screenshots

### Home Page

![Home Page](docs/image.png)
![Home Page](docs/image-1.png)

_Landing page featuring platform features, statistics, and call-to-action sections._

### CTA Section

![Features Section](docs/image-2.png)
_Showcase of advanced tools for modern businesses._

### Dashboard

![Dashboard](docs/image-5.png)
_Business overview with analytics, charts, and key metrics._

### Business Storefront

![Business Storefront](docs/image-6.png)
_Dynamic business pages with custom storefronts for each business._

### Product Grid

![Product Grid](docs/image-7.png)
_Product browsing and management interface._

### Authentication - Login

![Login Page](docs/image-9.png)
_User authentication interface._

### Authentication - Register

![Register Page](docs/image-8.png)
_User registration interface with wallet integration._

### Social Media Integration

![Social Media Integration](docs/image-10.png)
_Comprehensive social media integration for sharing and analytics._

### Social Media Connection

![Social Media Connection](docs/image-11.png)
_Social media connection interface._

### System Architecture

![System Tecgnologies](docs/image-13.png)
_High-level architecture of the Tredit platform._

![Development Workflow](docs/image-14.png)
_Development environment and workflow overview._

## Features

Tredit offers a comprehensive suite of features for secure, efficient, and user-friendly e-commerce:

- **Secure Escrow Service:** Blockchain-powered escrow ensures safe transactions between buyers and sellers, protecting both parties until delivery is confirmed.
- **Social Media Integration:** Share product listings and business profiles across YouTube, Facebook, Instagram, and TikTok. Boosts sales and trust through verified social presence.
- **Dispute Resolution:** Built-in smart contract and admin tools for fair, transparent dispute handling, including evidence submission and arbitration.
- **Business & User Verification:** On-chain business registration, KYC, and reputation scoring to build trust and reduce fraud.
- **Multi-Payment Support:** Accepts both crypto (Polygon/MATIC) and local fiat (M-Pesa, Paystack) payments, with seamless conversion and escrow management.
- **Product Management:** Sellers can create, update, and manage listings with images stored on IPFS for decentralization and reliability.
- **Analytics Dashboard:** Real-time business insights, sales trends, and order tracking for sellers and admins.
- **Mobile-First Design:** Fully responsive, optimized for Kenya's mobile-driven market.
- **Notifications:** Real-time updates for order status, payments, disputes, and more via email/SMS.
- **Role-Based Access:** Secure admin, seller, and buyer roles with NextAuth.js and Google OAuth.

## System Architecture

Tredit is built on a robust, layered architecture for scalability, security, and maintainability:

- **Presentation Layer:** Next.js frontend, mobile-first, with clear navigation and user flows.
- **Application Layer:** Node.js/Express backend, RESTful APIs, business logic, and authentication.
- **Data Layer:**
  - **PostgreSQL** for structured data (users, products, orders, disputes)
  - **Polygon blockchain** for escrow, payments, and verification
  - **IPFS** for decentralized file storage (product images, evidence)

**Key Architectural Features:**

- Modular, component-based frontend
- API routes for all business logic
- Smart contracts for core trust and payment logic
- Middleware for multitenancy and access control
- Environment-based configuration for dev/prod

## Technology Stack

**Frontend:**

- Next.js 14 (App Router, SSR/SSG)
- TypeScript (strict mode, type-safe APIs)
- Tailwind CSS (custom theming, dark mode)

**Backend:**

- Node.js 18+
- Express.js
- Prisma ORM
- PostgreSQL 15+

**Blockchain:**

- Solidity 0.8.20
- Polygon (Amoy testnet, mainnet ready)
- Hardhat (testing, deployment)
- OpenZeppelin (security, upgradability)

**Storage:**

- IPFS (Pinata)
- Supabase (optional for file metadata)

**Authentication:**

- NextAuth.js
- Google OAuth

**Payments:**

- Paystack (KES)
- M-Pesa (planned)
- Polygon/MATIC

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x
- MetaMask wallet
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tredit.git
cd tredit
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
```

**Environment Variables:**

- See `.env.example` for all required keys (DB, blockchain, IPFS, Paystack, OAuth, etc.)
- Use separate configs for development and production

**Tips for New Contributors:**

- Use `npx prisma studio` to view/edit DB
- Use `npx hardhat node` for local blockchain testing
- See `/docs/chapter4.md` for full implementation details

## Project Structure

```
tredit/
├── app/                    # Next.js app directory
├── components/            # React components
├── contracts/            # Solidity smart contracts
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── scripts/             # Utility scripts (deploy, test, seed)
├── src/                 # Source code (lib, types, config)
├── docs/                # Documentation, screenshots, guides
└── tests/               # Test files (unit, integration, e2e)
```

## Smart Contracts

Tredit's decentralized trust is powered by a suite of audited smart contracts:

- **Escrow.sol:** Holds funds securely until delivery is confirmed or a dispute is resolved. Implements checks-effects-interactions, reentrancy protection, and admin override for disputes.
- **Business.sol:** Manages business registration, verification, and reputation. Links on-chain business IDs to off-chain profiles and KYC.
- **UserProfile.sol:** Handles user identity, wallet integration, and profile updates. Supports privacy controls and secure updates.
- **Payment.sol:** Processes both crypto and fiat payments, integrates with Paystack, and manages payment lifecycle and refunds.
- **Dispute.sol:** Enables dispute creation, evidence submission, and resolution. Supports both automated and admin-driven arbitration.
- **TreditToken.sol:** Platform's native token for rewards, fees, and governance (future roadmap).

**Contract Interactions:**

- Orders trigger escrow creation
- Delivery confirmation or dispute triggers fund release or arbitration
- All contract addresses and ABIs are managed via environment variables

## Testing Strategy

Tredit uses a multi-layered testing approach for reliability and security:

- **Unit Testing:**
  - Smart contracts (Hardhat, Chai)
  - UI components (Jest, React Testing Library)
- **Integration Testing:**
  - API endpoints (Supertest)
  - Contract interactions (Hardhat, ethers.js)
  - Database operations (Prisma)
- **End-to-End Testing:**
  - User flows (Cypress)
  - Transaction lifecycle (escrow, payment, dispute)
- **Performance & Security:**
  - Load testing (autocannon)
  - Security checks (reentrancy, input validation)

**Coverage:**

- > 90% for smart contracts (see `/docs/chapter4.md` for detailed results)
- 80%+ for frontend and backend

## Deployment

### Frontend

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

### Smart Contracts

1. Deploy to Polygon testnet:

```bash
npx hardhat run scripts/deploy.mjs --network polygonAmoy
```

2. Verify contracts:

```bash
npx hardhat verify --network polygonAmoy [CONTRACT_ADDRESS]
```

**Best Practices:**

- Use separate wallets/keys for dev, staging, and prod
- Store secrets securely (never commit `.env`)
- Monitor contract addresses and update frontend configs as needed

## Support & Documentation

- **User Guides:** `/docs/chapter4.md`, `/docs/docs.md`
- **API Reference:** See `/src/app/api` and OpenAPI docs (if enabled)
- **Developer Docs:** In-code comments, `/docs/`, and smart contract NatSpec
- **Community:**
  - Email: support@tredit.ke
  - Telegram: https://t.me/tredit
  - Discord: https://discord.gg/tredit
  - Twitter: @tredit_ke

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Code Style:**

- TypeScript strict mode
- ESLint and Prettier enforced
- Write tests for new features
- Document your code and APIs

<!-- user Guide -->

# User Guide

# [Create Business Profile in Tredit](https://app.tango.us/app/workflow/62643f7e-bcbe-4033-9c7b-e6318a623f49?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)

**Creation Date:** Apr 30, 2025  
**Created By:** Victor Quaint  
[View most recent version on Tango.ai](https://app.tango.us/app/workflow/62643f7e-bcbe-4033-9c7b-e6318a623f49?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)

---

## # [Tredit](http://localhost:3000/)

### 1. Click on Get Started/Sign im

User authentication

![Step 1 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/f5e357e4-9d2d-4f2d-8ed7-5e629a980a6a/944cc65e-86c6-4869-b45c-d56a4ecc710b.png?crop=focalpoint&fit=crop&fp-x=0.8316&fp-y=0.0268&fp-z=2.9681&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=477&mark-y=21&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yNDgmaD05NCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 2. Type your details and connect your wallet

![Step 2 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/a0b8c642-22c5-4bd6-a970-c42aea8683cb/74f23409-bc96-42bf-83d5-db4e97e81178.png?crop=focalpoint&fit=crop&fp-x=0.2499&fp-y=0.4547&fp-z=1.7445&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=237&mark-y=400&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NzImaD01OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 3. Type "kiruivictor097@gmail.com"

### 4. Type password

![Step 4 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/a56fccc2-3bca-4eed-831d-e46517056569/ed3e592d-3fde-4974-90f9-2d960f8ed983.png?crop=focalpoint&fit=crop&fp-x=0.1803&fp-y=0.5503&fp-z=2.3030&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=313&mark-y=390&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNzEmaD03NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 5. Paste input

![Step 5 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/3d591fff-5a06-45c0-ae33-5edcab8a2509/a5f7b839-31a9-4b8c-8090-a0568674c955.png?crop=focalpoint&fit=crop&fp-x=0.3194&fp-y=0.5503&fp-z=2.3030&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=415&mark-y=390&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNzEmaD03NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 6. Click on Connect

![Step 6 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/ff79f3b1-cbc0-4a4b-97b1-3020a123dd27/cf81fca7-854c-4c9d-bb6e-3216352defca.png?crop=focalpoint&fit=crop&fp-x=0.3574&fp-y=0.7030&fp-z=2.7924&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=503&mark-y=384&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xOTUmaD04OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 7. Click on Create Account

![Step 7 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/684154a8-5d61-402c-a9a5-6f41fc1a5449/a241b53c-3d12-4a69-9c7d-f02e82ad8ff7.png?crop=focalpoint&fit=crop&fp-x=0.2499&fp-y=0.7534&fp-z=1.7445&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=237&mark-y=457&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NzImaD02MyZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 8. Click on Sign in

![Step 8 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/eed058b9-2d00-4334-a43e-b0690640976e/34eb4634-f371-4d86-b269-c908cb824a3f.png?crop=focalpoint&fit=crop&fp-x=0.3023&fp-y=0.7999&fp-z=3.0143&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=543&mark-y=401&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTUmaD01NCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 9. Type "kiruivictor097@gmail.com"

### 10. Type password

![Step 10 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/3b962428-ea2a-45e1-afad-4dcaed8a1f78/1f62151f-d9c1-4390-922a-4beec0d9c179.png?crop=focalpoint&fit=crop&fp-x=0.2499&fp-y=0.6233&fp-z=1.7445&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=237&mark-y=400&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NzImaD01OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 11. Check Remember me

![Step 11 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/26f29e6c-f55b-48f3-86ee-1f0d7e915fa2/35e98b67-3fbd-4e79-842a-d21518569826.png?crop=focalpoint&fit=crop&fp-x=0.1204&fp-y=0.6678&fp-z=3.1237&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=424&mark-y=402&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NCZoPTU0JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 12. Click on Sign In

![Step 12 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/7ae2875f-73c4-473e-8744-87e9e62c4b0f/4fac0e4d-53df-4676-95ed-0faabe5fc543.png?crop=focalpoint&fit=crop&fp-x=0.2499&fp-y=0.7156&fp-z=1.7445&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=237&mark-y=398&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz01NzImaD02OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 13. Click on Businesses

![Step 13 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/a594b666-8dd9-45f7-b329-5db30427c8c5/bd158a5a-7035-409c-8336-5d05855ac715.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.1779&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=320&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 14. Click on Add Business

![Step 14 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/247472b0-1159-4336-989d-f8782b262d32/f2ced0d3-ba89-4a41-8433-7d5f5b3ace4b.png?crop=focalpoint&fit=crop&fp-x=0.9347&fp-y=0.1099&fp-z=2.9389&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=799&mark-y=226&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDImaD0xMDEmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 15. Click on Business Name

![Step 15 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/91b63522-8d4d-4057-9a9a-949200edca60/bf3b0f5f-b9b5-455b-adb8-e46e6ac89adf.png?crop=focalpoint&fit=crop&fp-x=0.3062&fp-y=0.3582&fp-z=1.6612&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=299&mark-y=401&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MDImaD01NSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 16. Click on Business Type

![Step 16 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/5b03d239-8cb0-4c9c-b319-80c716ff6ce6/9d490a38-90a1-4261-8b2d-1eea43490b46.png?crop=focalpoint&fit=crop&fp-x=0.6075&fp-y=0.3591&fp-z=1.8837&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=287&mark-y=397&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MjYmaD02MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 17. Click on Business Description

![Step 17 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/9653dc32-802d-4092-bce1-f032aaa73bbf/4c24521d-29ca-4ef8-a778-8860a748081f.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5378&fp-z=1.1837&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=168&mark-y=383&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NjQmaD05MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 18. Click on Business Category

![Step 18 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/0f236e7d-a153-4253-acd7-72b5a914a09c/44618454-67b8-4a28-8864-e7001cd354de.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.4354&fp-z=1.1837&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=168&mark-y=409&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NjQmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 19. Click on Contact Details

![Step 19 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/6394c055-9e93-4172-b2ac-82bce95667ea/93d7977b-12cc-424e-9f63-336614807777.png?crop=focalpoint&fit=crop&fp-x=0.3730&fp-y=0.2290&fp-z=2.6932&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=485&mark-y=390&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yMzAmaD03NyZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 20. Click on Business Model

![Step 20 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/e9c2abda-63de-4112-a3f1-a88c3ad86523/aac9ce16-2b52-465b-a65b-7b1cc24c6976.png?crop=focalpoint&fit=crop&fp-x=0.5458&fp-y=0.2424&fp-z=2.6889&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=484&mark-y=359&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yMzImaD0xMzkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 21. Click on Payment & Shipping

![Step 21 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/d0dbc197-218f-4b13-b0a1-a1c0693c33b5/63c200af-ae95-4636-932a-2edfd1e630a2.png?crop=focalpoint&fit=crop&fp-x=0.7178&fp-y=0.2424&fp-z=2.7747&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=480&mark-y=357&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yMzkmaD0xNDQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 22. Type "0796851114"

### 23. Type "254"

### 24. Type "Nairobi"

![Step 24 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/ed3f13f3-8d43-4f34-b224-645c320c66c6/ad29940c-cbc6-44e7-943f-b29849b49e10.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5898&fp-z=1.1837&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=168&mark-y=421&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NjQmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 25. Click on Save & Continue

![Step 25 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/dcc71843-60ec-4d2f-8cfa-7c1fd8fc6c25/238871ec-aa62-4d02-ba9f-195c8525a55c.png?crop=focalpoint&fit=crop&fp-x=0.7160&fp-y=0.7240&fp-z=3.0126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=427&mark-y=377&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDcmaD0xMDQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 26. Click on Business Model

![Step 26 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/4c28586a-68c2-4b82-8274-e734cfdb7db4/c7c0eeff-886c-4565-998f-c59d41edbaa4.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.3591&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=348&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 27. Click on Marketplace

![Step 27 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/0f4312cb-bccd-47d1-82bb-4ea35eea5913/42eef7bc-6499-4584-a698-2559fab4989f.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.4698&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=411&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 28. Click on Operation Mode

![Step 28 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/b7e0f961-5473-41d7-a6c0-4ad9a0f45c3a/676dd794-73b3-4447-85e3-ee627fa4a56f.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.4312&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=409&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 29. Click on Hybrid

![Step 29 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/441bee85-5897-4ef3-bb6a-73f77eb91f18/87b7a998-0f2d-49ca-bb18-28925f37a1e1.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5151&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=411&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 30. Click on Business Size

![Step 30 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/49ab9835-81b1-4027-85bf-8f041dd64ed5/928f60b0-51fc-4ae2-93e6-f1751400f80d.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.5034&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=409&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 31. Click on Large

![Step 31 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/b23cbdd8-ad3d-4092-a41b-a85aa915a7f7/83205054-b9bf-4916-a946-ca7fb15cfc29.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.6141&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=447&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 32. Click on Business Stage

![Step 32 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/3b318ef2-bf9f-4a3c-b858-ea60d106b33a/85fedaca-2023-49c6-a9b5-b0082f36ed77.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.5755&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=409&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 33. Click on Enterprise

![Step 33 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/1ffe3517-3de9-4cf2-850e-0c477bb67c05/57de4128-d21a-4b1b-ab40-1d3f32cc2408.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.6862&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=521&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 34. Click on Save & Continue

![Step 34 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/a2b727d3-de4f-4f80-9ee3-36e951b678fc/e639037f-2acb-4099-8ff4-59373f0987f5.png?crop=focalpoint&fit=crop&fp-x=0.7160&fp-y=0.7240&fp-z=3.0126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=427&mark-y=377&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDcmaD0xMDQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 35. Click on Accepted Payment Methods

![Step 35 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/097be79c-8ebd-4095-ba8f-a9b9494e1ed4/55c0bc10-a9d2-41ca-9c3b-9480cd157abc.png?crop=focalpoint&fit=crop&fp-x=0.1660&fp-y=0.4337&fp-z=2.9534&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=575&mark-y=380&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yNSZoPTk4JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 36. Click on Mpesa

![Step 36 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/d107360b-def8-4a95-bbba-cde9ec0b0847/57ace135-6c71-4885-8ce1-f90551781942.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.4732&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=411&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 37. Click on Card

![Step 37 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/0ffab0f4-64cc-4ada-b488-8016483a6ba3/266adc6f-2527-4dea-af2a-b5405c722810.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5000&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=411&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 38. Click on Bank Transfer

![Step 38 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/9bd55bbc-cb66-49e4-8d98-d8a3768ab800/7f9cf668-440d-4edb-a77a-89d5fc1ace00.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5268&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=411&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 39. Click on Primary Currency

![Step 39 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/eea7e30d-287f-4bca-8844-c418b2d601b4/87989451-7d50-4de6-bfaa-860a8cb4cc97.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.3591&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=348&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 40. Click on Tax Category

![Step 40 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/625a6270-c59f-49a2-a4c0-ca922ee34e9e/d567c8aa-b7de-4f78-8a56-d26f440594a6.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.5151&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=409&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 41. Click on Turnover Tax

![Step 41 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/4f9df9cd-03d2-4a42-a8c5-0bf0c63ec34e/1504a8bd-df6a-4de3-a41e-bf45d77b9b8c.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.5990&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=432&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 42. Click on Shipping Method

![Step 42 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/aff135eb-73b4-4870-9bbb-d8f22f6bd95c/1713316a-63f0-4159-9f3c-01a5bdafb839.png?crop=focalpoint&fit=crop&fp-x=0.4539&fp-y=0.5872&fp-z=1.1938&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=182&mark-y=415&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04MzUmaD0zOSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 43. Click on International

![Step 43 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/7d871da7-6d9c-4b61-a3e0-ebcaf95d3a48/b4ab6ef7-09f2-4aa9-99ae-eef4d984d561.png?crop=focalpoint&fit=crop&fp-x=0.4593&fp-y=0.6711&fp-z=1.1871&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=170&mark-y=505&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NTkmaD0zNCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 44. Click on Businesses

![Step 44 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/f474fb4c-28c0-424c-9697-a22637916838/2cdc6137-33ef-4f94-912e-67110017d663.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.1779&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=320&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 45. Click on SoundHive Electronics is your go-to online destination for high-quality audio and smart tech gadgets in Kenya. We specialize in wireless earbuds, headphones, Bluetooth speakers, and accessories from trusted brands. Our mission is to deliver exceptional sound experiences …

![Step 45 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/fbdff802-06ec-4555-8e80-59100810dae8/f67dcd34-45aa-4db8-9f70-9f66473a7e36.png?crop=focalpoint&fit=crop&fp-x=0.3868&fp-y=0.2492&fp-z=1.6146&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=291&mark-y=289&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MTkmaD0xMTEmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 46. Click on Overview…

![Step 46 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/9fb7bff7-0397-4ad0-8c4e-f58102b424bb/1deaf014-f2fa-49b6-b707-656251593943.png?crop=focalpoint&fit=crop&fp-x=0.2340&fp-y=0.3515&fp-z=2.8960&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=536&mark-y=372&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMjcmaD0xMTImZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 47. Click on Social Media

![Step 47 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/61bd9b32-6f79-4d99-8e3b-5804a36dc69d/a5e60914-b6ec-4067-a165-c6efd8538cd1.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=320&mark-y=290&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz03OCZoPTIyJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 48. Click on Products

![Step 48 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/27a2ce08-99dc-43f3-a95f-03737e5857ea/4018b503-54bd-461a-bbbb-619cb82b13dd.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=414&mark-y=290&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MCZoPTIyJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 49. Click on Orders

![Step 49 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/b128defa-2a6d-4081-8326-2cfbd9cbbb95/b58dedd2-e464-4322-8141-474e79b2bc65.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=492&mark-y=290&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz01MCZoPTIyJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 50. Click on Products

![Step 50 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/81d9b429-5031-4a06-801f-5380d3f94feb/ef879f24-126f-479c-b564-6fd73ea8327f.png?crop=focalpoint&fit=crop&fp-x=0.3703&fp-y=0.3515&fp-z=2.8545&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=514&mark-y=398&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xNzImaD02MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 51. Click on Social Media

![Step 51 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/255d0828-b8ff-42ea-97fd-82179b2b9a5c/16551523-25a1-48a3-bd27-e06e39bb5d80.png?crop=focalpoint&fit=crop&fp-x=0.3663&fp-y=0.4023&fp-z=1.7419&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=392&mark-y=334&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMzUmaD0zOCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 52. Click on Social Media

![Step 52 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/3f2106a2-a6f0-4947-8cc8-b708d1512ad9/06dbd900-e741-48ca-a27d-4e1e1ed6802b.png?crop=focalpoint&fit=crop&fp-x=0.4164&fp-y=0.5633&fp-z=1.2001&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=216&mark-y=394&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz03NjgmaD03MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 53. Click on Social Media

![Step 53 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/3507ef43-d744-4fea-8624-4f362f29b832/76473103-8586-47d6-a41b-fb8d53733f88.png?crop=focalpoint&fit=crop&fp-x=0.4164&fp-y=0.4887&fp-z=1.2001&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=216&mark-y=394&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz03NjgmaD03MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 54. Click on Overview

![Step 54 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/28a06641-41f3-4629-8d9f-14fe6b835447/bfba5b6a-e3ba-4950-bdab-ce12cf32bf0b.png?crop=focalpoint&fit=crop&fp-x=0.1756&fp-y=0.3515&fp-z=2.8447&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=511&mark-y=398&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xNzYmaD02MSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 55. Click on Copy link

![Step 55 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/7912543d-918a-40f0-a4b5-fa6a2c68cb99/043a3550-7817-4886-84de-f01555dc0e1b.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.5000&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=736&mark-y=337&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz0yOSZoPTI5JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 56. Click on Overview

![Step 56 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/e317be38-aef5-4f44-bdc8-144097455868/16ed1b56-bc05-4705-b03b-51d15edbea70.png?crop=focalpoint&fit=crop&fp-x=0.4283&fp-y=0.5678&fp-z=2.0229&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=-76&mark-y=-256&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMjk0Jmg9MTQzMSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 57. Click on Share Profile

![Step 57 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/87c93207-4f69-47b8-b0c6-4aa6ec20cd02/4c51415b-55df-42fe-aa13-071f4c55553f.png?crop=focalpoint&fit=crop&fp-x=0.4164&fp-y=0.5059&fp-z=2.4164&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=435&mark-y=383&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zMzAmaD05MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 58. Click on Overview

![Step 58 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/530e23f1-8e99-462a-acdd-612c99331590/85d1f1ea-2455-488a-a605-ee982b5bbd0c.png?crop=focalpoint&fit=crop&fp-x=0.4164&fp-y=0.5856&fp-z=1.2001&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=216&mark-y=6&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz03NjgmaD04NDkmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 59. Copy input titled "http://localhost:3000/soundhive-electronics-d0f46abb"

![Step 59 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/23d7ccef-6b37-4cc5-b44a-d8a627759623/4c03aa10-6487-49ec-954e-624f541378b9.png?crop=focalpoint&fit=crop&fp-x=0.4056&fp-y=0.4102&fp-z=1.3900&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=250&mark-y=406&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz03MDAmaD00NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 60. Share the link to be accessed by others

![Step 60 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/181a7483-e546-40c1-a1cb-a4e81b06a772/8aefea13-9583-49a5-a07d-169325803baa.png?crop=focalpoint&fit=crop&fp-x=0.5000&fp-y=0.1082&fp-z=1.0012&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=1&mark-y=55&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTk5Jmg9NzUmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 61. Click on Victor…

![Step 61 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/c0899c4b-0235-42e4-9438-a5d03005128c/33eed945-af43-4856-a05b-0d53b3c21c58.png?crop=focalpoint&fit=crop&fp-x=0.8229&fp-y=0.0336&fp-z=2.9980&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=439&mark-y=43&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zMjEmaD04NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 62. Click on Products from SoundHive Electronics…

![Step 62 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/1345cfdd-dcb9-4f05-bac2-f3d8688558dc/bdd588ff-c11c-46ff-930d-f9c6378a3e1d.png?crop=focalpoint&fit=crop&fp-x=0.5003&fp-y=0.5386&fp-z=1.0856&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=97&mark-y=1&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMDA1Jmg9ODU1JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 63. Click on Add to cart

![Step 63 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/d090552b-5867-4076-829b-1bab6d94bc23/1085eb3e-58eb-4e6a-bc73-a462be7c070c.png?crop=focalpoint&fit=crop&fp-x=0.1786&fp-y=0.5646&fp-z=2.9980&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=557&mark-y=385&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NiZoPTg2JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 64. Click on highlight

![Step 64 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/af902eb8-5ac7-44a9-855d-eeddc34b77e8/0fc66401-be8a-4338-82d0-2d4401724c34.png?crop=focalpoint&fit=crop&fp-x=0.7136&fp-y=0.0336&fp-z=2.9389&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=549&mark-y=34&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMDEmaD0xMDEmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 65. Click on Dispute Order

![Step 65 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/dcc64786-f5dc-4c73-b692-10c1d375691a/9affea36-e667-4127-9696-a39fcd3eb87e.png?crop=focalpoint&fit=crop&fp-x=0.6507&fp-y=0.4857&fp-z=2.9980&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=557&mark-y=385&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz04NiZoPTg2JmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 66. Copy text

![Step 66 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/9da4fce8-306e-4d79-85ed-6f89d3143a73/f335e482-3c35-4608-8cdf-2e064a13d261.png?crop=focalpoint&fit=crop&fp-x=0.5081&fp-y=0.4320&fp-z=1.6678&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=300&mark-y=388&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MDAmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 67. Paste selected text into text area

![Step 67 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/da10eeb4-6b9c-41a4-bb54-08524c223790/6c8c4ab4-9f09-42b1-8dfe-a38aa5d911d4.png?crop=focalpoint&fit=crop&fp-x=0.5003&fp-y=0.2911&fp-z=1.5735&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=283&mark-y=308&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MzQmaD0xNzAmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

### 68. Click on Reason for Dispute…

![Step 68 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/e970f97a-3b0e-4d0d-b147-d8cd494ae133/f09a2c33-e4a4-4f6f-8522-51bf8a45a037.png?crop=focalpoint&fit=crop&fp-x=0.4949&fp-y=0.1762&fp-z=1.6384&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=295&mark-y=220&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MTAmaD01NCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 69. Click on Quality Issue

![Step 69 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/320c6c7f-7806-446b-9b4c-ebcee4c2197b/29304014-2f49-45a4-9ea9-7bb4a2ba602a.png?crop=focalpoint&fit=crop&fp-x=0.5003&fp-y=0.3138&fp-z=1.5854&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=285&mark-y=404&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz02MjkmaD00NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 70. Click on Submit Dispute

![Step 70 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/c6313b64-0246-462e-91e1-7d9ae0dc7650/69118e76-bb85-4a38-b441-d14fb003750f.png?crop=focalpoint&fit=crop&fp-x=0.6270&fp-y=0.4950&fp-z=2.6172&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=471&mark-y=391&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yNTgmaD03NSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 71. Click on Your Orders…

![Step 71 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/111113ba-8bf7-4b29-8ebd-664ae8efa880/35c2898f-972b-41b5-aa86-81c507ae764e.png?crop=focalpoint&fit=crop&fp-x=0.5003&fp-y=0.5776&fp-z=1.0604&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=36&mark-y=182&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0xMTI4Jmg9NTgyJmZpdD1jcm9wJmNvcm5lci1yYWRpdXM9MTA%3D)

### 72. Click on Orders…

![Step 72 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/16af06e8-ffc1-4ee7-9491-485abf5fc884/ac78627e-9c8e-4c71-bbe2-7463e839e55c.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.2517&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=388&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 73. Click on Transactions

![Step 73 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/4fa152c0-1c5d-4391-b121-16c8a44140a6/e47c56ee-d5e2-443c-af41-f1ff1d526b5f.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.3255&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=388&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 74. Click on Escrow

![Step 74 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/ed1a281c-b025-41e8-99dd-dffb25305bfb/847810f0-f99e-48bb-9ee6-7ed37169f158.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.4732&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=388&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 75. Click on Release

![Step 75 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/e50d0cd5-800a-4543-afc0-6917ff0682f1/9e8a7e0f-9afe-4dde-8175-ea34a7703c28.png?crop=focalpoint&fit=crop&fp-x=0.7735&fp-y=0.2500&fp-z=2.9980&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=479&mark-y=385&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0yNDEmaD04NiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 76. Click on Dashboard

![Step 76 screenshot](https://images.tango.us/workflows/62643f7e-bcbe-4033-9c7b-e6318a623f49/steps/21862db6-8d4a-444a-aa1d-c8193db690b6/246751ce-24a2-435a-a8ef-344ed33d7774.png?crop=focalpoint&fit=crop&fp-x=0.0662&fp-y=0.1409&fp-z=2.3650&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=14&mark-y=245&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTYlMkNGRjc0NDImdz0zNDkmaD04MiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

<br/>

---

Created with [Tango.ai](https://tango.ai?utm_source=markdown&utm_medium=markdown&utm_campaign=workflow%20export%20links)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Polygon Network](https://polygon.technology/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Pinata](https://www.pinata.cloud/)
- [Paystack](https://paystack.com/)
- [Supabase](https://supabase.com/)

---

_This project was developed as part of the BSc. Information Technology degree at Jomo Kenyatta University of Agriculture and Technology._
