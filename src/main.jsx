import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LayoutProvider } from "./Context/LayoutContext";
import { BrowserRouter } from "react-router-dom";
import { AccountProvider } from "./Context/AccountContext";
import ErrorBoundary from "./Components/ErrorBoundary";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
	<React.StrictMode>
		<ErrorBoundary>
			<BrowserRouter>
				<AccountProvider>
					<LayoutProvider>
						<App />
					</LayoutProvider>
				</AccountProvider>
			</BrowserRouter>
		</ErrorBoundary>
	</React.StrictMode>
);
