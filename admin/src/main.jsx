import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LayoutProvider } from "./Context/LayoutContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { AccountProvider } from "./Context/AccountContext.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { BusinessProvider } from "./Context/BusinessContext.jsx";
import { WalletProvider } from "./providers/WalletProvider.jsx";
import { ConfigProvider } from "antd";
import ErrorBoundary from "./Components/ErrorBoundary";

// Ensure the root element exists
const container = document.getElementById("root");
if (!container) {
	throw new Error("Failed to find the root element");
}

const root = ReactDOM.createRoot(container);

// Router configuration with future flags
const routerConfig = {
	future: {
		v7_startTransition: true,
		v7_relativeSplatPath: true,
	},
};

// Wrap the app with error boundary, browser router, and required providers
root.render(
	<React.StrictMode>
		<ConfigProvider>
			<ErrorBoundary>
				<BrowserRouter {...routerConfig}>
					<WalletProvider>
						<AccountProvider>
							<AuthProvider>
								<LayoutProvider>
									<BusinessProvider>
										<App />
									</BusinessProvider>
								</LayoutProvider>
							</AuthProvider>
						</AccountProvider>
					</WalletProvider>
				</BrowserRouter>
			</ErrorBoundary>
		</ConfigProvider>
	</React.StrictMode>
);
