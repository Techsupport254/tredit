import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
	const navigate = useNavigate(); // Replaces useHistory()

	return (
		<div className="flex items-center justify-center w-full h-full ">
			<Result
				status="404"
				title="404"
				subTitle="Sorry, the page you visited does not exist."
				extra={
					<Button type="primary" onClick={() => navigate("/")}>
						Back Home
					</Button>
				}
			/>
		</div>
	);
};

export default NotFoundPage;
