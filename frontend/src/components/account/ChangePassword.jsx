import React, { useState } from "react";
import { backendCaller } from "../utils/backendCaller";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({ type: "", content: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        content: "New password and confirm password do not match.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await backendCaller(
        "/users/change-password",
        "PATCH",
        { "Content-Type": "application/json" },
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }
      );

      if (response.success) {
        setMessage({ type: "success", content: response.message });
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", content: response.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Something went wrong. Please try again.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen w-full text-white flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Change Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="oldPassword"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              Old Password:
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your old password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* New Password Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="newPassword"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              New Password:
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <label
              htmlFor="confirmPassword"
              className="block text-lg font-semibold mb-2 text-gray-300"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>

        {/* Message Display */}
        {message.content && (
          <div
            className={`text-center mt-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-700 text-green-300"
                : "bg-red-700 text-red-300"
            }`}
          >
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
