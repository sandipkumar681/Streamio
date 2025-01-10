import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backendCaller } from "../utils/backendCaller";
import LoginContext from "../../context/Login/LoginContext";

function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [inputData, setInputData] = useState({
    userNameOrEmail: "",
    password: "",
  });
  const { setIsLoggedIn, setUserDetails } = useContext(LoginContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const json = await backendCaller(
      "/users/login",
      "POST",
      { "Content-Type": "application/json" },
      inputData
    );

    setMessage(json?.message);

    if (json?.success) {
      setIsLoggedIn(true);
      setUserDetails({
        _id: json.data.user._id,
        fullName: json.data.user.fullName,
        userName: json.data.user.userName,
        avatar: json.data.user.avatar,
        coverImage: json.data.user.coverImage,
        email: json.data.user.email,
      });
      setInputData({
        userNameOrEmail: "",
        password: "",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Login to Your Account
        </h2>
        {message && (
          <div className="text-red-500 text-center font-semibold mb-4">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userNameOrEmail" className="block text-gray-300">
              Username or Email
            </label>
            <input
              type="text"
              id="userNameOrEmail"
              name="userNameOrEmail"
              value={inputData.userNameOrEmail}
              onChange={handleChange}
              placeholder="Enter username or email"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={inputData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded transition focus:outline-none focus:ring-2 focus:ring-teal-500 "
          >
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          <Link
            to="/account/forgot-password"
            className="text-gray-400 hover:text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/account/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
