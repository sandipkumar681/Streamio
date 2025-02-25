import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoggedIn = useSelector((state) => state.logInReducer.isLoggedIn);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!videoFile || !thumbnailFile || !title || !description) {
      setMessage("All fields are required!");
      return false;
    }
    if (title.length < 3 || title.length > 30) {
      setMessage("Title must be between 3 and 30 characters.");
      return false;
    }
    if (description.length < 3 || description.length > 1000) {
      setMessage("Description must be between 3 and 1000 characters.");
      return false;
    }
    if (videoFile.size > 100 * 1024 * 1024) {
      // 100MB limit
      setMessage("Video file size must be under 100MB.");
      return false;
    }
    if (thumbnailFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      setMessage("Thumbnail file size must be under 5MB.");
      return false;
    }
    return true;
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("userVideo", videoFile);
    formData.append("userThumbnail", thumbnailFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("isPublished", isPublished);

    try {
      setIsSubmitting(true);
      setMessage("Uploading...");

      const json = await backendCaller(
        "/videos/uploadVideo",
        "POST",
        {},
        formData
      );

      console.log(json);
      setIsSubmitting(false);
      setMessage(json.message || "Upload successful!");

      if (json.success) {
        setVideoFile(null);
        setThumbnailFile(null);
        setTitle("");
        setDescription("");
        setIsPublished(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      setMessage("An error occurred during the upload. Please try again.");
      console.error("Upload error:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/account/login");
    }
  });

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Upload Video
        </h2>

        {message && (
          <div
            className={`text-center p-3 text-sm font-semibold mb-4 rounded-lg ${
              isSubmitting ? "bg-yellow-500" : "bg-green-500"
            } text-white`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVideoUpload} className="space-y-4">
          <div>
            <label
              htmlFor="video"
              className="block mb-2 text-gray-300 font-medium"
            >
              Video File
            </label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              disabled={isSubmitting}
              className="block w-full px-4 py-2 border rounded-md text-gray-200 bg-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnail"
              className="block mb-2 text-gray-300 font-medium"
            >
              Thumbnail Image
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              disabled={isSubmitting}
              className="block w-full px-4 py-2 border rounded-md text-gray-200 bg-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block mb-2 font-medium text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the video title"
              minLength={3}
              maxLength={30}
              disabled={isSubmitting}
              className="block w-full px-4 py-2 border rounded-md text-black bg-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the video description"
              minLength={3}
              maxLength={1000}
              disabled={isSubmitting}
              className="block w-full px-4 py-2 border rounded-md text-black bg-gray-200"
              rows="4"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="isPublished" className="font-medium text-gray-300">
              Publish Now?
            </label>
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isSubmitting}
              className="w-5 h-5"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;
