import React, { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";

const DashBoardVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const json = await backendCaller("/videos/fetchvideo-dashboardvideos");
        console.log("API Response:", json);
        if (json.success) {
          setVideos(json.data);
        } else {
          setError("Failed to fetch videos. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("An error occurred while fetching videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full min-h-screen text-white">
      <h1 className="text-3xl font-extrabold mb-8 text-center">
        Your Uploaded Videos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video._id}
              className="p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-lg font-semibold mt-2">{video.title}</h2>
              <p className="text-sm text-gray-400">Views: {video.views}</p>
              <p className="text-sm text-gray-400">Likes: {video.likes}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No videos found.</p>
        )}
      </div>
    </div>
  );
};

export default DashBoardVideos;
