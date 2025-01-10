import { useEffect, useState } from "react";
import LoginContext from "./LoginContext";
import { backendCaller } from "../../components/utils/backendCaller";

const LoginState = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const json = await backendCaller("/users/auth/status");
      console.log(json);
      if (json?.success) {
        setIsLoggedIn(true);
        setUserDetails(json.data);
        console.log(userDetails);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, userDetails, setUserDetails }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginState;
