import axios from "axios";
import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

	axios.defaults.withCredentials = true;

	const backendUrl = import.meta.env.VITE_BACKEND_URL;
	const [isLoggedin, setIsLoggedin] = useState(false);
	const [userData, setUserData] = useState(null);

	const getUserData = useCallback(async () => {
		try {
			const { data } = await axios.get(backendUrl + "/api/users/user-details", {
				withCredentials: true,
			});

			if (data.success) {
				setUserData(data.userData);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log("Something went Wrong", error);
		}
	}, [backendUrl]);

	const getAuthState = useCallback(async () => {
		try {
			const { data } = await axios.get(backendUrl + "/api/users/is-auth", {
				withCredentials: true,
			});

			if (data.success) {
				setIsLoggedin(true);
				await getUserData();
			}
		} catch (error) {
			console.log("Auth check failed:", error);
		}
	}, [backendUrl, getUserData]);

	useEffect(()=>{
		getAuthState()
	}, [getAuthState])


	const value = {
		backendUrl,
		isLoggedin,
		setIsLoggedin,
		userData,
		setUserData,
		getUserData,
	};
	return (
		<AppContext.Provider value={value}>{props.children}</AppContext.Provider>
	);
};
