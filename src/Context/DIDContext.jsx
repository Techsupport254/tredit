import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Updated for v6
import { useWallet } from "./WalletContext";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const DIDContext = createContext();

export const DIDProvider = ({ children }) => {
	const { isConnected, userAddress } = useWallet();
	const navigate = useNavigate(); // Replaces useHistory()
	const [profileStatus, setProfileStatus] = useState("checking");
	const [userProfile, setUserProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchUserProfile = async () => {
		try {
			setIsLoading(true);
			if (!isConnected || !userAddress) {
				setProfileStatus("missing");
				return;
			}

			const response = await fetch(
				`/api/getUserProfile?address=${userAddress}`
			);
			if (!response.ok) throw new Error("Failed to fetch profile");

			const profileData = await response.json();
			if (profileData.exists) {
				setUserProfile({
					did: profileData.did,
					profileURI: profileData.profileURI,
					reputation: profileData.reputationScore,
				});
				setProfileStatus(
					profileData.did && profileData.profileURI ? "complete" : "incomplete"
				);
			} else {
				setProfileStatus("missing");
			}
		} catch (error) {
			console.error("Error fetching user profile:", error);
			setProfileStatus("error");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUserProfile();
	}, [isConnected, userAddress]);

	useEffect(() => {
		if (profileStatus === "missing" && isConnected) {
			navigate("/create-profile", { replace: true }); // Updated from history.replace()
		}
	}, [profileStatus, navigate, isConnected]);

	return (
		<DIDContext.Provider
			value={{ userProfile, profileStatus, isLoading, fetchUserProfile }}
		>
			{children}
		</DIDContext.Provider>
	);
};

export const useDID = () => useContext(DIDContext);
