import { useState } from "react";
import LoginContext from "./LoginContext";
import { backendCaller } from "../../components/utils/backendCaller";

const LoginState = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  const checkAuth = async () => {
    try {
      const json = await backendCaller("/users/auth/status");
      console.log(json);
      if (json.success) {
        setIsLoggedIn(true);
        setUserDetails(json.data);
      } else {
        const refreshTokenJson = await backendCaller("/users/refresh-tokens");
        console.log(refreshTokenJson);
        if (refreshTokenJson.success) {
          const retryAuthStatusJson = await backendCaller("/users/auth/status");
          console.log(retryAuthStatusJson);
          if (retryAuthStatusJson.success) {
            setIsLoggedIn(true);
            setUserDetails(retryAuthStatusJson.data);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userDetails,
        setUserDetails,
        checkAuth,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginState;
