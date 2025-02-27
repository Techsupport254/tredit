import { useEffect, useState } from "react";

const useScrollDetection = () => {
	const [isScrolling, setIsScrolling] = useState(false);

	useEffect(() => {
		let timeout;

		const handleScroll = () => {
			setIsScrolling(true);

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				setIsScrolling(false);
			}, 1500);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			clearTimeout(timeout);
		};
	}, []);

	return isScrolling;
};

export default useScrollDetection;
