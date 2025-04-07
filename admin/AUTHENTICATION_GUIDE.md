# Web3 Authentication Implementation Guide

This document outlines the authentication architecture implemented in the Tredit admin application, focusing on how the wallet authentication works and how to manage tokens for persisting user sessions.

## Key Components

### 1. Storage Management (`src/utils/storage.js`)

The application uses browser's localStorage to persist authentication data including:

- Wallet address
- Authentication token
- User profile data

```javascript
// Key storage items
export const STORAGE_KEYS = {
  USER: "user",
  WALLET_ADDRESS: "wallet_address",
  token: "token",
  // Other storage keys...
};

// Storage utility functions
export const setStorageItem = (key, value) => {...}
export const getStorageItem = (key) => {...}
export const clearUserData = () => {...}
```

### 2. Account Context (`src/Context/AccountContext.jsx`)

The AccountContext manages wallet connection state and user authentication, providing a seamless experience by:

- Automatically restoring sessions from localStorage
- Providing wallet connection methods
- Managing authentication state
- Handling edge cases (account suspension, errors)

Key connection states:

```javascript
export const CONNECTION_STATES = {
	INITIALIZING: "initializing",
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	ERROR: "error",
};
```

### 3. Route Protection (`src/App.jsx`)

The ProtectedRoute component ensures secure navigation by:

- Checking authentication state before rendering protected routes
- Storing attempted paths in sessionStorage for post-authentication redirect
- Preventing redirect loops and unnecessary page refreshes

```javascript
// Example of protected route implementation
<Routes>
	<Route path="/connect" element={<ConnectWallet />} />
	<Route path="/profile-setup" element={<ProfileSetup />} />
	<Route
		path="/dashboard/*"
		element={
			<ProtectedRoute>
				<Dashboard />
			</ProtectedRoute>
		}
	/>
</Routes>
```

### 4. Wallet Connection Component (`src/Components/Profile/ConnectWallet.jsx`)

The ConnectWallet component:

- Handles wallet connection
- Provides user feedback during the connection process
- Shows appropriate error messages
- Automatically detects stored credentials for quicker authentication

## Authentication Flow

1. **Initial Load**:

   - Application checks localStorage for stored credentials
   - If valid credentials exist, the user session is restored without requiring reconnection

2. **New Connection**:

   - User clicks "Connect Wallet"
   - MetaMask (or other wallet provider) opens
   - User approves connection
   - Wallet signs a message to verify ownership
   - Backend validates the signature and returns user data and token
   - Credentials are stored in localStorage

3. **Token Validation**:

   - On page refresh/navigation, stored token is validated
   - Backend confirms the token is valid for the connected wallet
   - Authentication state is maintained across page visits

4. **Error Handling**:
   - Account suspension
   - Network disconnection
   - Invalid wallet format
   - Connection rejections

## Session Management Best Practices

1. **Always Check Before Redirect**:

   ```javascript
   // Check if user is already authenticated before redirecting
   if (!isConnected) {
   	// Store current path
   	sessionStorage.setItem("redirectPath", location.pathname);
   	navigate("/connect");
   }
   ```

2. **Store Critical Authentication Data**:

   ```javascript
   // After successful authentication
   setStorageItem(STORAGE_KEYS.token, authResponse.data.token);
   setStorageItem(STORAGE_KEYS.USER, userData);
   setStorageItem(STORAGE_KEYS.WALLET_ADDRESS, walletAddress);
   ```

3. **Clear on Disconnection**:

   ```javascript
   // When disconnecting
   const clearUserData = () => {
   	localStorage.removeItem(STORAGE_KEYS.token);
   	localStorage.removeItem(STORAGE_KEYS.USER);
   	localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
   };
   ```

4. **Handle Account Changes**:
   ```javascript
   // Listen for account changes in MetaMask
   window.ethereum.on("accountsChanged", handleAccountsChanged);
   ```

## Troubleshooting

If experiencing authentication issues:

1. Check browser console for errors
2. Try clearing localStorage: `localStorage.clear()`
3. Make sure wallet is connected to the correct network (Polygon Amoy Testnet)
4. Verify backend API is accessible and responding correctly
5. Check that stored wallet address matches currently connected wallet
