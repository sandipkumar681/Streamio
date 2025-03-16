import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { timeDifference } from "../utils/timeDifference";

const ChannelInfo = () => {
  const { userName } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const json = await backendCaller(`/videos/fetchvideos/${userName}`);
        if (json.success) {
          setChannel(json.data.channel);
          setVideos(json.data.videos);
          console.log("Channel Data:", json.data.channel);
          console.log("Videos:", json.data.videos);
        } else {
          setError("Failed to load channel data.");
        }
      } catch (err) {
        setError("An error occurred while fetching channel info.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [userName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white w-full">
        Loading channel...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 w-full">{error}</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen w-full text-white">
      {/* Cover Image */}
      <div className="relative w-full h-60 bg-gray-800">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No Cover Image
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-24 h-24 rounded-full border-4 border-gray-700"
          />
          <div>
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <p className="text-gray-400">@{channel.userName}</p>
            <p className="text-gray-400">{channel.fullName}</p>
            <p className="text-gray-400">{channel.subscribers} subscribers</p>
          </div>
        </div>

        {/* Videos Grid */}
        <h2 className="text-2xl font-semibold mb-4">Videos</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Link to={`/video/watch/${video._id}`} className="block">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {video.views} views . {timeDifference(video.createdAt)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No videos available.</p>
        )}
      </div>
    </div>
  );
};

export default ChannelInfo;
