import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { backendCaller } from "../utils/backendCaller";

function Signup() {
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
    otp: "",
  });

  useEffect(() => {
    const validateOtp = async () => {
      if (formData.otp.length === 6) {
        const json = await backendCaller(
          "/otp-validation",
          "POST",
          { "Content-Type": "application/json" },
          {
            otp: formData.otp,
            email: formData.email,
          }
        );

        setOtpMessage(json?.message);
      }
    };

    validateOtp();
  }, [formData.otp.length]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleOtpRequest = async () => {
    setOtpMessage("Sending OTP...");

    const json = await backendCaller(
      "/sendemail",
      "POST",
      { "Content-Type": "application/json" },
      {
        ToCreateProfile: true,
        email: formData.email,
      }
    );

    setOtpMessage(json?.message);
    setIsOtpSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("userName", formData.userName);
    form.append("fullName", formData.fullName);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("avatar", formData.avatar);
    form.append("otp", formData.otp);
    if (formData.coverImage) {
      form.append("coverImage", formData.coverImage);
    }

    const json = await backendCaller("/users/register", "POST", {}, form);

    setMessage(json?.message);

    if (json.success) {
      setFormData({
        userName: "",
        fullName: "",
        email: "",
        password: "",
        avatar: null,
        coverImage: null,
        otp: "",
      });
      setOtpMessage("");
      setIsOtpSent(false);
      setTimeout(() => {
        navigate("/account/login");
      }, 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create An Account
        </h2>
        {message && (
          <div className="text-red-500 text-center font-semibold mb-4">
            {message}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Username */}
          <div className="w-full">
            <label htmlFor="userName" className="block text-gray-300">
              Username
            </label>
            <input
              type="text"
              name="userName"
              id="userName"
              placeholder="Enter your username"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>
          {/* Full Name */}
          <div className="w-full">
            <label htmlFor="fullName" className="block text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>
          {/* Email */}
          <div className="w-full">
            <label htmlFor="email" className="block text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>
          {/* Password */}
          <div className="w-full">
            <label htmlFor="password" className="block text-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>
          {/* Request OTP */}
          <div className="w-full">
            <button
              type="button"
              onClick={handleOtpRequest}
              disabled={!formData.email}
              className="w-full py-2 bg-teal-500 hover:bg-teal-700 text-white rounded  focus:outline-none focus:ring-2 focus:ring-teal-500  disabled:opacity-50"
            >
              Request OTP
            </button>
            <p className="text-sm text-yellow-400 mt-2">{otpMessage || ""}</p>
          </div>
          {/* OTP */}
          <div className="w-full">
            <label htmlFor="otp" className="block text-gray-300">
              OTP
            </label>
            <input
              type="text"
              name="otp"
              id="otp"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={handleChange}
              disabled={!isOtpSent}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-teal-500 "
              required
            />
          </div>

          {/* Avatar File Input */}
          <div className="w-full mb-4 flex flex-col">
            <label
              htmlFor="avatar"
              className="custom-file-upload cursor-pointer border border-gray-300 inline-block px-4 py-2 text-gray-700 bg-white rounded hover:bg-gray-100 transition"
            >
              Choose Avatar
            </label>
            <input
              type="file"
              name="avatar"
              id="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              required
              disabled={!isOtpSent}
            />
            {formData.avatar && (
              <p className="text-gray-400 mt-2">{formData.avatar.name}</p>
            )}
          </div>

          {/* Cover Image File Input */}
          <div className="w-full mb-4 flex flex-col">
            <label
              htmlFor="coverImage"
              className="custom-file-upload cursor-pointer border border-gray-300 inline-block px-4 py-2 text-gray-700 bg-white rounded hover:bg-gray-100 transition"
            >
              Choose Cover Image (Optional)
            </label>
            <input
              type="file"
              name="coverImage"
              id="coverImage"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              disabled={!isOtpSent}
            />
            {formData.coverImage && (
              <p className="text-gray-400 mt-2">{formData.coverImage.name}</p>
            )}
          </div>

          <div className="w-full">
            <button
              type="submit"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded  focus:outline-none focus:ring-2 focus:ring-teal-500 "
            >
              Sign Up
            </button>
          </div>
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

export default Signup;
