import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import About from "./components/About.jsx";
import Home from "./components/Home.jsx";
import Watchvideo from "./components/video/Watchvideo.jsx";
import Signup from "./components/account/Signup.jsx";
import Login from "./components/account/Login.jsx";
import ForgetPassword from "./components/account/ForgetPassword.jsx";
import UploadVideo from "./components/video/UploadVideo.jsx";
import Profile from "./components/account/Profile.jsx";
import ChangeUserDetails from "./components/account/ChangeUserDetails.jsx";
import ChangePassword from "./components/account/ChangePassword.jsx";
import DashBoard from "./components/account/DashBoard.jsx";
import DashBoardVideos from "./components/video/DashBoardVideos.jsx";
import { Provider } from "react-redux";
import { store } from "./redux-toolkit/store.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="account/">
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgetPassword />} />
        <Route path="profile/">
          <Route path="" element={<Profile />} />
          <Route path="change-user-details" element={<ChangeUserDetails />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="dashboard" element={<DashBoard />} />
        </Route>
      </Route>
      <Route path="video/">
        <Route path="upload-video" element={<UploadVideo />} />
        <Route path="watch/:id" element={<Watchvideo />} />
        <Route path="dashboard-videos" element={<DashBoardVideos />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
