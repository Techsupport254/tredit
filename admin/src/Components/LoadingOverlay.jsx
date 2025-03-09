import PropTypes from "prop-types";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Custom loading spinner with reduced size for better UX
const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

const LoadingOverlay = ({ message = "Loading..." }) => {
	// Split message into lines if it contains newlines, with null check
	const messages = message?.split("\n") || ["Loading..."];

	return (
		<div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
			<div className="text-center">
				<Spin
					indicator={
						<LoadingOutlined
							style={{
								fontSize: 36,
								color: "#1890ff",
							}}
							spin
						/>
					}
				/>
				<div className="mt-4 space-y-2">
					{messages.map((msg, index) => (
						<div
							key={index}
							className={
								index === 0
									? "text-lg font-medium text-gray-800"
									: "text-sm text-gray-500"
							}
						>
							{msg}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

LoadingOverlay.propTypes = {
	message: PropTypes.string,
};

export default LoadingOverlay;
