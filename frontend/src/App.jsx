import { Outlet } from "react-router-dom";
import Navbar from "./components/utils/Navbar";
import SidebarState from "./context/Sidebar/SidebarState";
import Sidebar from "./components/utils/Sidebar";
import LoginState from "./context/Login/LoginState";

function App() {
  return (
    <LoginState>
      <SidebarState>
        {/* <h1>HI</h1> */}
        <Navbar />
        <div className="flex">
          <Sidebar />
          <Outlet />
        </div>
      </SidebarState>
    </LoginState>
  );
}

export default App;
