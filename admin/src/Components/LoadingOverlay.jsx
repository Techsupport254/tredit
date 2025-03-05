import PropTypes from "prop-types";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

// Custom loading spinner with reduced size for better UX
const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

const LoadingOverlay = ({ message = "Loading..." }) => (
	<div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
		<div className="flex flex-col items-center gap-4">
			<Spin indicator={antIcon} />
			<span className="text-gray-600 text-sm">{message}</span>
		</div>
	</div>
);

LoadingOverlay.propTypes = {
	message: PropTypes.string,
};

LoadingOverlay.defaultProps = {
	message: "Loading...",
};

export default LoadingOverlay;
