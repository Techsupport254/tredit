import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { LayoutProvider } from "./Context/LayoutContext";
import { BrowserRouter } from "react-router-dom";
import { AccountProvider } from "./Context/AccountContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import { UploadProvider } from "./Context/UploadContext";
import { AuthProvider } from "./Context/AuthContext";
import { ConfigProvider } from "antd";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
	<ErrorBoundary>
		<BrowserRouter>
			<AccountProvider>
				<AuthProvider>
					<LayoutProvider>
						<UploadProvider>
							<ConfigProvider>
								<App />
							</ConfigProvider>
						</UploadProvider>
					</LayoutProvider>
				</AuthProvider>
			</AccountProvider>
		</BrowserRouter>
	</ErrorBoundary>
);
