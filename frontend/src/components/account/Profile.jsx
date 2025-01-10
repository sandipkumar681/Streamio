import { useEffect, useContext } from "react";
import { backendCaller } from "../utils/backendCaller";
import LoginContext from "../../context/Login/LoginContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { isLoggedIn, userDetails, setUserDetails } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const json = await backendCaller("/users/user-details");
      if (json.success) {
        setUserDetails({
          _id: json.data._id,
          fullName: json.data.fullName,
          userName: json.data.userName,
          avatar: json.data.avatar,
          coverImage: json.data.coverImage,
          email: json.data.email,
        });
      }
    };

    fetchUserData();

    if (!isLoggedIn) {
      navigate("/account/login");
    }
  }, [isLoggedIn, setUserDetails]);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen w-full text-white flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Cover Image */}
        <div className="relative w-full h-64 bg-gray-300 rounded-lg overflow-hidden shadow-lg">
          {userDetails.coverImage && (
            <img
              src={userDetails.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => console.log("Edit Cover Image")}
            className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-500 transition"
          >
            Edit Cover Image
          </button>
        </div>

        {/* Avatar, Full Name, Username, and Email */}
        <div className="flex items-start space-x-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden shadow-md">
              {userDetails.avatar && (
                <img
                  src={userDetails.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => console.log("Edit Avatar")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-500 transition"
            >
              Edit Avatar
            </button>
          </div>

          {/* Full Name, Username, and Email */}
          <div className="flex flex-col justify-center space-y-2">
            <h1 className="text-4xl font-bold">{userDetails.fullName}</h1>
            <p className="text-xl text-gray-400">@{userDetails.userName}</p>
            <p className="text-lg text-gray-400">{userDetails.email}</p>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Change Details
            </h2>
            <p className="text-gray-400 mb-4">Update your personal details.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Change Details
            </button>
          </div>
          <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Change Password
            </h2>
            <p className="text-gray-400 mb-4">Update your account password.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Change Password
            </button>
          </div>
          <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Get Channel Profile
            </h2>
            <p className="text-gray-400 mb-4">
              View or update your channel profile.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Channel Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
