import { Component } from "react";
import { Alert } from "antd";
import PropTypes from "prop-types";

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.error) {
			return (
				<div className="flex h-screen items-center justify-center p-6">
					<Alert
						message="Something went wrong"
						description={this.state.error.toString()}
						type="error"
						showIcon
					/>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;

// props validation
ErrorBoundary.propTypes = {
	children: PropTypes.node.isRequired,
};
