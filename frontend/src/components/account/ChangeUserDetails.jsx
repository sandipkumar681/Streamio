import React, { useContext, useEffect, useState } from "react";
import LoginContext from "../../context/Login/LoginContext";
import { backendCaller } from "../utils/backendCaller";
import { useNavigate } from "react-router-dom";

const ChangeUserDetails = () => {
  const { userDetails, setUserDetails, checkAuth } = useContext(LoginContext);

  const [isLoading, setIsLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Initialize `data` when `userDetails` changes
  useEffect(() => {
    if (userDetails) {
      const updateField = () => {
        setFullName(userDetails.fullName);
        setEmail(userDetails.email);
      };

      updateField();
    }
  }, [userDetails]);

  const handleChangeInFullName = (e) => {
    setFullName(e.target.value);
  };

  const handleChangeInEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangeInOtp = (e) => {
    setOtp(e.target.value);
  };

  const handleRequestOtp = async () => {
    setIsLoading(true);
    const json = await backendCaller(
      "/sendemail",
      "POST",
      { "Content-Type": "application/json" },
      {
        ToCreateProfile: false,
        email,
      }
    );
    setIsLoading(false);

    if (json.success) {
      setOtpRequested(true);
      console.log("OTP has been sent to your email.");
    } else {
      console.log("Failed to request OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const json = await backendCaller(
      "/users/change-details",
      "PATCH",
      { "Content-Type": "application/json" },
      { fullName, email, otp }
    );

    setIsLoading(false);

    if (json.success) {
      setFullName(json.data.fullName);
      setEmail(json.data.email);
      setOtp("");

      setUserDetails(json.data);
      navigate("/account/profile");
    } else {
      console.log(
        "Failed to update details. Please ensure the OTP is correct."
      );
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
              value={fullName}
              onChange={handleChangeInFullName}
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
              value={email}
              onChange={handleChangeInEmail}
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
              value={otp}
              onChange={handleChangeInOtp}
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
