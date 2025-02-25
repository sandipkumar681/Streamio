import { Outlet } from "react-router-dom";
import Navbar from "./components/utils/Navbar";
import Sidebar from "./components/utils/Sidebar";
import { useEffect } from "react";
import { checkAuth } from "./features/LoginSlice";
import { useDispatch } from "react-redux";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default App;
