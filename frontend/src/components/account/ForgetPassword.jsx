import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backendCaller } from "../utils/backendCaller";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Checking email...");

    const userExistJson = await backendCaller(
      "/users/user-exist",
      "POST",
      { "Content-Type": "application/json" },
      { email }
    );

    if (!userExistJson.success) {
      setIsSubmitting(false);
      setMessage(userExistJson.message || "Email not registered.");
      return;
    }

    setMessage(userExistJson.message);

    const otpJson = await backendCaller(
      "/sendemail",
      "POST",
      { "Content-Type": "application/json" },
      { ToCreateProfile: false, email }
    );

    setIsSubmitting(false);
    setMessage(otpJson.message || "OTP sent successfully.");
    if (otpJson.success) setStep(2);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New Password and Confirm Password should be same!");
      return;
    }
    setIsSubmitting(true);
    setMessage("Updating password...");

    const json = await backendCaller(
      "/users/reset-password",
      "POST",
      { "Content-Type": "application/json" },
      { email, otp, newPassword }
    );

    setIsSubmitting(false);
    setMessage(json.message || "Password updated successfully.");
    if (json.success) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setTimeout(() => {
        navigate("/account/login");
      }, [2000]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="w-full max-w-lg p-8 rounded-xl shadow-2xl bg-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          {step === 1 ? "Request OTP" : "Set New Password"}
        </h2>
        <p className="text-sm text-gray-300 mb-6 text-center">
          {step === 1
            ? "Enter your registered email address to receive an OTP."
            : "Enter the OTP sent to your email and set a new password."}
        </p>
        {message && (
          <div className="text-center mb-4 p-3 text-sm bg-red-600 text-white rounded-lg">
            {message}
          </div>
        )}

        <form
          onSubmit={step === 1 ? handleOtpRequest : handlePasswordReset}
          className="space-y-6"
        >
          {step === 1 && (
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="otp" className="block text-gray-300 mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : step === 1
              ? "Send OTP"
              : "Reset Password"}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/account/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgetPassword;
