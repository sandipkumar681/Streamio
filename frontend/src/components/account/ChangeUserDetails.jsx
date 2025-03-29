import React, { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeIsLoggedIn } from "../../features/LoginSlice";

const ChangeUserDetails = () => {
  const userDetails = useSelector((state) => state.logInReducer.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [message, setMessage] = useState(null);
  const [fullName, setFullName] = useState(""); // Ensure initial state is an empty string
  const [email, setEmail] = useState(""); // Ensure initial state is an empty string
  const [otp, setOtp] = useState(""); // Ensure initial state is an empty string

  // Set initial user details on component mount
  useEffect(() => {
    if (userDetails) {
      setFullName(userDetails.fullName || ""); // Ensure fallback to empty string
      setEmail(userDetails.email || ""); // Ensure fallback to empty string
    }
  }, [userDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "fullName") setFullName(value);
    if (name === "email") setEmail(value);
    if (name === "otp") setOtp(value);
  };

  const handleRequestOtp = async () => {
    setIsLoading(true);
    try {
      const response = await backendCaller(
        "/sendemail",
        "POST",
        { "Content-Type": "application/json" },
        { ToCreateProfile: false, email }
      );
      if (response.success) {
        setOtpRequested(true);
        setMessage("OTP has been sent to your email.");
      } else {
        setMessage(
          response?.message || "Failed to request OTP. Please try again."
        );
      }
    } catch (error) {
      setMessage("Error occurred while requesting OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await backendCaller(
        "/users/change-details",
        "PATCH",
        { "Content-Type": "application/json" },
        { fullName, email, otp }
      );

      setIsLoading(false);

      if (response.success) {
        dispatch(
          changeIsLoggedIn({
            isLoggedIn: true,
            userDetails: response.data || {},
          })
        );

        // setFullName(response.data.fullName || "");
        // setEmail(response.data.email || "");
        setOtp("");
      } else {
        setMessage(
          "Failed to update details. Please ensure the OTP is correct."
        );
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error occurred while updating details.");
    }
  };

  if (!userDetails) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
        <p>Loading user details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen w-full text-white flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Update Your Details</h1>

        {/* Display message to the user */}
        {message && (
          <div className="text-center text-lg font-semibold text-red-500 mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fullname Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="fullName"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              Fullname:
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={fullName} // Make sure it's always a string
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="email"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email} // Make sure it's always a string
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OTP Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="otp"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              OTP:
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp} // Make sure it's always a string
              onChange={handleInputChange}
              placeholder="Enter the OTP sent to your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!otpRequested}
            />
            <button
              type="button"
              onClick={handleRequestOtp}
              className="mt-4 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition"
              disabled={isLoading}
            >
              {isLoading ? "Requesting OTP..." : "Request OTP"}
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading || !otpRequested}
            >
              {isLoading ? "Updating..." : "Update Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeUserDetails;
