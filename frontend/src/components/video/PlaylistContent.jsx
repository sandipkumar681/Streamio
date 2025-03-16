import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";

const PlaylistContent = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch playlist data based on the ID
  useEffect(() => {
    const fetchPlaylistContent = async () => {
      try {
        const response = await backendCaller(
          `/playlists/getplaylist/${id}`,
          "GET"
        );
        if (response.success) {
          setPlaylist(response.data);
        } else {
          setError("Failed to fetch playlist content");
        }
      } catch (err) {
        setError("Error fetching playlist content");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistContent();
  }, [id]); // Re-fetch when the ID changes

  // Loading state
  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  // Error handling
  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  // Playlist rendering
  if (!playlist || !playlist.videos || playlist.videos.length === 0) {
    return (
      <div className="text-center min-h-screen bg-gray-900 w-full text-gray-400">
        No videos in this playlist
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      <h2 className="text-3xl font-bold mb-6">{playlist.name}</h2>
      <p className="text-gray-400 mb-6">{playlist.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {playlist.videos.map((video) => (
          <div
            key={video._id}
            className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition"
          >
            <img
              src={video.thumbnail || "/default-thumbnail.jpg"}
              alt={video.title}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="text-xl font-semibold mt-2">{video.title}</h3>
            <p className="text-gray-400">{video.duration} mins</p>
            {/* You can add a link to watch the video */}
            <Link
              to={`/video/watch/${video._id}`}
              className="text-teal-500 hover:text-teal-600 mt-2 block"
            >
              Watch Video
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistContent;
