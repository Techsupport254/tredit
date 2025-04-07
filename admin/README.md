# **Blockchain-Based E-Commerce Platform with Integrated Escrow**

A secure, trust-driven e-commerce platform leveraging **blockchain technology** to enable safe and transparent transactions for the **Kenyan market**, integrating **escrow services**, **decentralized dispute resolution**, and **social media verification** for vendor credibility.

## **🚀 Project Overview**

Traditional e-commerce and freelance marketplaces in **Kenya** face **fraud risks, trust issues, and buyer protection challenges** due to reliance on **social media transactions**. This project introduces a **blockchain-based e-commerce platform** designed to:

- Secure transactions with **escrow smart contracts**.
- Enhance vendor credibility using **social media verification**.
- Implement **decentralized dispute resolution** for fair conflict management.

Built on **Polygon Blockchain** and developed using **React + Vite**, this project provides a **fast, secure, and scalable** e-commerce experience.

---

## **📌 Features**

### **🔐 Secure Transactions with Escrow**

- Funds are **held in escrow** until the buyer confirms delivery.
- Uses **smart contracts** to eliminate fraud risks.

### **📜 Decentralized Dispute Resolution**

- **Community-driven arbitration** resolves conflicts fairly.
- Inspired by **Kleros**, ensuring transparent dispute resolution.

### **👤 Social Media Verification**

- Vendors can **link social media accounts** for credibility.
- Builds **trust through past transactions and online presence**.

### **🛍️ E-Commerce Marketplace**

- Supports both **physical product sales** and **freelance services**.
- Vendors get **custom storefronts** with verified listings.

### **💳 Multiple Payment Methods**

- Integrates **crypto payments (MATIC, USDT)** and fiat transactions.
- Secure **smart contract-based fund releases**.

### **📊 Dashboard & Analytics**

- Track **order status, sales, and escrow balances**.
- View **buyer/seller ratings and transaction history**.

---

## **⚙️ Tech Stack**

### **Frontend**

- **React + Vite** (Fast UI rendering)
- **Ant Design** (Modern UI components)
- **Tailwind CSS** (Responsive styling)
- **Axios** (API interactions)

### **Backend**

- **Node.js + Express.js** (RESTful API)
- **MongoDB** (User & product data storage)
- **IPFS** (Decentralized file storage)
- **Solidity** (Smart contract development)
- **Polygon Blockchain** (Ethereum Layer 2 scalability)

### **Blockchain & Smart Contracts**

- **Solidity** (Smart contract programming)
- **Truffle & Hardhat** (Development & testing)
- **Web3.js / Ethers.js** (Blockchain interactions)

---

## **📦 Installation & Setup**

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/victorkipkirui/blockchain-ecommerce-kenya.git
cd blockchain-ecommerce-kenya
```

### **2️⃣ Install Dependencies**

```bash
npm install
```

### **3️⃣ Start the Development Server**

```bash
npm run dev
```

Server will start at: **http://localhost:5173/**

### **4️⃣ Blockchain Smart Contracts (Deployment)**

Ensure you have **Truffle** or **Hardhat** installed:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon
```

or using Truffle:

```bash
truffle compile
truffle migrate --network polygon
```

---

## **🛠️ Smart Contract Features**

- **Escrow Contract:** Holds funds securely until order confirmation.
- **Dispute Resolution Contract:** Enables decentralized arbitration.
- **User Verification Contract:** Links vendors to social media accounts.

---

## **📌 API Endpoints**

| Method   | Endpoint              | Description                         |
| -------- | --------------------- | ----------------------------------- |
| **GET**  | `/api/products`       | Get all listed products             |
| **POST** | `/api/products`       | Create a new product                |
| **POST** | `/api/escrow/create`  | Initiate an escrow transaction      |
| **POST** | `/api/escrow/release` | Release funds upon confirmation     |
| **POST** | `/api/users/verify`   | Link user to a social media account |

---

## **🔍 Future Enhancements**

- **AI-powered fraud detection** using **blockchain analytics**.
- **Mobile App Version** for Android & iOS.
- **Multi-chain support** beyond Polygon.

---

## **🔐 Authentication Implementation**

This application implements a seamless Web3 wallet-based authentication system that:

- Securely connects to MetaMask and other Ethereum wallets
- Persists user sessions using browser storage
- Provides intelligent navigation and route protection
- Handles various authentication edge cases

For detailed implementation guidelines, see: [Authentication Guide](./AUTHENTICATION_GUIDE.md)

### **Key Authentication Features:**

- **Session Persistence**: Maintains user sessions across page refreshes
- **Intelligent Redirects**: Remembers attempted paths for post-authentication redirection
- **Robust Error Handling**: Provides clear feedback for various authentication scenarios
- **Optimized UX**: Minimizes unnecessary wallet prompts and network requests

---

## **👨‍💻 Author & Supervisor**

- **👤 Victor Kipkorir Kirui** (Developer)
- **📘 Supervisor: Dr. Dennis Kaburu**

---

## **📜 License**

This project is licensed under the **MIT License**.

🔥 **Empowering trust in Kenyan e-commerce with blockchain!** 🚀
