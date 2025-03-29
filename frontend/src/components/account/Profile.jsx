import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link } from "react-router-dom";
import { checkAuth } from "../../features/LoginSlice";
import { useSelector } from "react-redux";

const Profile = () => {
  const userDetails = useSelector((state) => state.logInReducer.userDetails);
  const [form, setForm] = useState({});
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [isEditCoverImageOpen, setIsEditCoverImageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [userDetails]);

  const handleChange = (e) => {
    const { files } = e.target;
    setForm({ file: files[0] });
  };

  const handleChangeAvatar = async () => {
    if (!form.file) return;

    const formData = new FormData();
    formData.append("avatar", form.file);

    setIsLoading(true);
    const json = await backendCaller(
      "/users/change-avatar",
      "PATCH",
      {},
      formData
    );

    setIsLoading(false);
    if (json.success) {
      // fetchUserData();
      setForm({});
      setIsEditAvatarOpen(false);
    } else {
      console.log("Error in frontend while updating avatar!");
    }
  };

  const handleChangeCoverImage = async () => {
    if (!form.file) return;

    const formData = new FormData();
    formData.append("coverImage", form.file);

    setIsLoading(true);
    const json = await backendCaller(
      "/users/change-coverImage",
      "PATCH",
      {},
      formData
    );

    setIsLoading(false);
    if (json.success) {
      // fetchUserData();
      setForm({});
      setIsEditCoverImageOpen(false);
    } else {
      console.log("Error in frontend while updating cover image!");
    }
  };

  if (!userDetails) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

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
            onClick={() => setIsEditCoverImageOpen(true)}
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
              onClick={() => setIsEditAvatarOpen(true)}
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
          <Link
            to="/account/profile/change-user-details"
            className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-2 text-white">
              Change Details
            </h2>
            <p className="text-gray-400 mb-4">Update your personal details.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Change Details
            </button>
          </Link>
          <Link
            to="/account/profile/change-password"
            className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-2 text-white">
              Change Password
            </h2>
            <p className="text-gray-400 mb-4">Update your account password.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Change Password
            </button>
          </Link>
          <Link
            to="/dashboard"
            className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold mb-2 text-white">
              See Your Dashboard
            </h2>
            <p className="text-gray-400 mb-4">View your channel profile.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>

      {/* Edit Avatar Modal */}
      {isEditAvatarOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold text-white mb-4">Edit Avatar</h2>
            <div className="text-gray-400 mb-4 flex items-center space-x-4">
              <label
                htmlFor="file-upload-avatar"
                className="custom-file-upload cursor-pointer border border-gray-300 inline-block px-4 py-2 text-gray-700 bg-white rounded hover:bg-gray-100 transition"
              >
                Choose File
              </label>
              <input
                type="file"
                id="file-upload-avatar"
                className="hidden"
                name="newAvatar"
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setForm({});
                  setIsEditAvatarOpen(false);
                }}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                Close
              </button>
              <button
                onClick={handleChangeAvatar}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cover Image Modal */}
      {isEditCoverImageOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit Cover Image
            </h2>
            <div className="text-gray-400 mb-4 flex items-center space-x-4">
              <label
                htmlFor="file-upload-cover"
                className="custom-file-upload cursor-pointer border border-gray-300 inline-block px-4 py-2 text-gray-700 bg-white rounded hover:bg-gray-100 transition"
              >
                Choose File
              </label>
              <input
                type="file"
                id="file-upload-cover"
                className="hidden"
                name="newCoverImage"
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setForm({});
                  setIsEditCoverImageOpen(false);
                }}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                Close
              </button>
              <button
                onClick={handleChangeCoverImage}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
