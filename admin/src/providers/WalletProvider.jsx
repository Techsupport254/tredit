import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import { createContext, useContext, useState, useEffect } from "react";

const core = new Core({
	projectId: "c935f3c835b235ec185a68211c30ee16",
});

const metadata = {
	name: "Tredit",
	description: "AppKit Example",
	url: window.location.origin,
	icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
	const [walletKit, setWalletKit] = useState(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const initializeWalletKit = async () => {
			try {
				const kit = await WalletKit.init({
					core,
					metadata,
				});
				console.log("WalletKit initialized:", kit);
				setWalletKit(kit);
				setIsInitialized(true);
			} catch (error) {
				console.error("Failed to initialize WalletKit:", error);
				setError(error);
			}
		};

		initializeWalletKit();
	}, []);

	const connect = async () => {
		if (!walletKit) {
			throw new Error("WalletKit not initialized");
		}
		try {
			console.log("Connecting wallet...");
			console.log("WalletKit instance structure:", Object.keys(walletKit));
			
			// Direct connection using available methods on the WalletKit instance
			const session = await walletKit.connectWallet({
				requiredNamespaces: {
					eip155: {
						methods: ["eth_sendTransaction", "personal_sign"],
						chains: ["eip155:1", "eip155:137"], // Ethereum and Polygon
					},
				},
			});
			console.log("Wallet connected:", session);
			return {
				address: session.accounts[0],
				chainId: session.chainId,
			};
		} catch (error) {
			console.error("Error connecting wallet:", error);
			throw error;
		}
	};

	const disconnect = async () => {
		if (!walletKit) {
			throw new Error("WalletKit not initialized");
		}
		try {
			console.log("Disconnecting wallet...");
			await walletKit.disconnect();
			console.log("Wallet disconnected");
		} catch (error) {
			console.error("Error disconnecting wallet:", error);
			throw error;
		}
	};

	const value = {
		walletKit,
		isInitialized,
		error,
		connect,
		disconnect,
	};

	if (error) {
		return <div>Error initializing wallet: {error.message}</div>;
	}

	if (!isInitialized) {
		return <div>Initializing wallet...</div>;
	}

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
