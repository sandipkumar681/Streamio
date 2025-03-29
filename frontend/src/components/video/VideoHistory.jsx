import { useEffect, useState } from "react";
import { backendCaller } from "../utils/backendCaller";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { timeDifference } from "../utils/timeDifference";
import { useSelector } from "react-redux";

const VideoHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const isLoggedIn = useSelector((state) => state.logInReducer.isLoggedIn);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await backendCaller("/users/history");
        if (response.success) {
          setHistory(response.data.reverse());
        } else {
          setMessage(response?.message || "Failed to fetch watch history!");
        }
      } catch (err) {
        setMessage("Error fetching watch history!");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const checkIsLogedIn = () => {
      if (!isLoggedIn) {
        navigate(
          `/account/login?redirect=${encodeURIComponent(location.pathname)}`
        );
        return;
      }
    };

    checkIsLogedIn();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 w-full text-white text-center">
        Loading...
      </div>
    );
  if (message)
    return (
      <div className="min-h-screen bg-gray-900 w-full text-white text-center">
        {message}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      <h2 className="text-3xl text-center font-bold mb-6">Watch History</h2>
      {history.length === 0 ? (
        <p className="text-center text-gray-400">No videos watched recently.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((video) => (
            <Link
              key={video._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition"
              to={`/video/watch/${video._id}`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-40 object-cover rounded"
              />

              {/* Parent Flex Container for Owner & Title/Time */}
              <div className="flex items-center mt-2">
                {/* Owner Avatar */}
                {video.owner && (
                  <div>
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.userName}
                      className="w-8 h-8 rounded-full border border-gray-600"
                    />
                  </div>
                )}

                {/* Title & Time */}
                <div className="flex flex-col ml-2">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {video.owner.userName}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {timeDifference(video.watchedAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoHistory;
