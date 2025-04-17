import { ethers } from "ethers";
import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [address, setAddress] = useState(null);
	const [error, setError] = useState(null);

	const connect = async () => {
		try {
			// Check if MetaMask is installed
			if (!window.ethereum) {
				throw new Error("Please install MetaMask to use this application");
			}

			// Request account access
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			if (accounts.length === 0) {
				throw new Error("No accounts found");
			}

			// Create ethers provider and signer
			const ethersProvider = new ethers.BrowserProvider(window.ethereum);
			const ethersSigner = await ethersProvider.getSigner();

			// Get the connected address
			const connectedAddress = await ethersSigner.getAddress();

			// Update state
			setProvider(ethersProvider);
			setSigner(ethersSigner);
			setAddress(connectedAddress);

			// Set up event listeners
			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("chainChanged", handleChainChanged);

			return {
				address: connectedAddress,
				chainId: await ethersSigner.provider
					.getNetwork()
					.then((network) => network.chainId),
			};
		} catch (error) {
			console.error("Wallet connection failed:", error);
			setError(error);
			throw error;
		}
	};

	const handleAccountsChanged = (accounts) => {
		if (accounts.length === 0) {
			// User disconnected their wallet
			disconnect();
		} else {
			setAddress(accounts[0]);
		}
	};

	const handleChainChanged = () => {
		// Reload the page when the chain changes
		window.location.reload();
	};

	const disconnect = async () => {
		try {
			// Remove event listeners
			if (window.ethereum) {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
				window.ethereum.removeListener("chainChanged", handleChainChanged);
			}

			// Reset state
			setProvider(null);
			setSigner(null);
			setAddress(null);
		} catch (error) {
			console.error("Error disconnecting wallet:", error);
			throw error;
		}
	};

	const value = {
		provider,
		signer,
		address,
		error,
		connect,
		disconnect,
	};

	return (
		<WalletContext.Provider value={value}>{children}</WalletContext.Provider>
	);
};

export const useWallet = () => {
	const context = useContext(WalletContext);
	if (!context) {
		throw new Error("useWallet must be used within a WalletProvider");
	}
	return context;
};
