import { Outlet } from "react-router-dom";
import Navbar from "./components/utils/Navbar";
import SidebarState from "./context/Sidebar/SidebarState";
import Sidebar from "./components/utils/Sidebar";
import LoginState from "./context/Login/LoginState";
import { useEffect, useContext } from "react";
import LoginContext from "./context/Login/LoginContext";

const App = () => {
  return (
    <LoginState>
      <AuthenticatedApp />
    </LoginState>
  );
};

const AuthenticatedApp = () => {
  const { checkAuth } = useContext(LoginContext);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <SidebarState>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <Outlet />
      </div>
    </SidebarState>
  );
};

export default App;
