import React from "react";
import { Card } from "antd";

const TestDashboard = () => {
	return (
		<div className="min-h-full bg-gray-50">
			<Card>
				<h1>Test Dashboard</h1>
				<p>This is a test component to verify dynamic imports.</p>
			</Card>
		</div>
	);
};

export default TestDashboard;
