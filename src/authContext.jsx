import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";
import { useNavigate } from "react-router-dom";
export const AuthContext = React.createContext();

const initialState = {
	isAuthenticated: false,
	user: null,
	token: null,
	role: null,
};

const reducer = (state, action) => {
	switch (action.type) {
		case "LOGIN_SUCCESS":
			const { user_id, token, role } = action.payload;
			return {
				...state,
				isAuthenticated: true,
				user_id,
				token,
				role,
			};
		case "LOGOUT":

      window.location.href = "/admin/login";
			localStorage.clear();
      
			return {
				...state,
				isAuthenticated: false,
				user: null,
        token: null, 
			};
      
		default:
			return state;
	}
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
	const role = localStorage.getItem("role");
	if (errorMessage === "TOKEN_EXPIRED"||errorMessage==='UNAUTHORIZED') {
		dispatch({
			type: "LOGOUT",
		});
		window.location.href = "/" + role + "/login";
	}
};

const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	React.useEffect(() => {
    const role = localStorage.getItem("role");
		if (role!==null) {
      
			sdk
				.check(role)
				.then((response) => {
				
					if (response?.error) {
						tokenExpireError(dispatch, response.message);
					} else {
						const { isAuthenticated, user_id, token, role } = response;
						dispatch({
							type: "LOGIN_SUCCESS",
							payload: {
								isAuthenticated,
								user_id,
								token,
								role,
							},
						});
					}
				})
				.catch((error) => {
					tokenExpireError(dispatch, error.message);
				});
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				state,
				dispatch,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
