import React, { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link } from "react-router-dom";

const VideoCard = ({ video, onToggleStatus, onDelete }) => {
  return (
    <div className="bg-gray-900 text-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 p-4">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-48 object-cover rounded-lg"
      />
      <h2 className="text-xl font-semibold truncate mt-3">{video.title}</h2>
      <p className="text-sm text-gray-400 truncate">{video.description}</p>
      <div className="flex justify-between items-center mt-2 text-gray-400 text-xs">
        <span>{video.views} views</span>
        <span>
          {Math.floor(video.duration / 60)}m {video.duration % 60}s
        </span>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <span>{video.likes} Likes</span>
        <span>{video.comments} Comments</span>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => onToggleStatus(video._id)}
          className={`px-4 py-2 rounded-lg text-gray-300 font-semibold transition ${
            video.isPublished
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {video.isPublished ? "Make Private" : "Make Public"}
        </button>
        <button
          onClick={() => onDelete(video._id)}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-gray-300 font-semibold"
        >
          Delete
        </button>
      </div>
      <Link
        to={`/video/watch/${video._id}`}
        className="block mt-4 text-center bg-blue-600 hover:bg-blue-500 text-gray-300 py-2 rounded-lg"
      >
        Watch Video
      </Link>
    </div>
  );
};

const DashBoardVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const json = await backendCaller("/dashboard/videos");
        if (json.success) {
          setVideos(json.data);
          setOwner(json.data.length > 0 ? json.data[0].owner : null);
        } else {
          setMessage("Failed to fetch videos. Please try again.");
        }
      } catch (err) {
        setMessage("An error occurred while fetching videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleToggleStatus = async (videoId) => {
    setLoading(true);
    try {
      const json = await backendCaller(
        `/videos/toggle-publish-status/${videoId}`
      );

      if (json.success) {
        const updatedVideos = videos.map((video) =>
          video._id === videoId
            ? { ...video, isPublished: !video.isPublished }
            : video
        );
        setVideos(updatedVideos);
      } else {
        setMessage(json?.message || "Failed to toggle status!");
      }
    } catch (error) {
      setMessage("Error while toggling status!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      setLoading(true);
      try {
        const json = await backendCaller(
          `/videos/deletevideo/${videoId}`,
          "DELETE"
        );
        if (json.success) {
          setVideos(videos.filter((video) => video._id !== videoId));
        } else {
          setMessage(json?.message || "Failed to delete video!");
        }
      } catch (error) {
        setMessage("Error while deleting video!");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center bg-gray-900 justify-center h-screen w-full text-gray-300">
        Loading...
      </div>
    );
  }

  if (message) {
    return (
      <div className="text-white bg-gray-900 flex items-center justify-center h-screen w-full">
        {message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      {owner.length !== 0 && (
        <div className="flex flex-col mb-6">
          <img
            src={owner.coverImage}
            alt="Cover"
            className="w-full max-h-40 object-cover items-center rounded-lg"
          />
          <div className="flex flex-row">
            <img
              src={owner.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-gray-800 mt-4"
            />
            <div className="text-gray-300 pl-6">
              <h1 className="text-2xl font-bold mt-2">{owner.fullName}</h1>
              <p>
                @{owner.userName} . {owner.subscribers} subscribers
              </p>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl text-center font-bold text-gray-300 mb-6">
        Your Uploaded Videos
      </h1>
      {videos.length === 0 ? (
        <p className="text-gray-400 text-center">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashBoardVideos;
