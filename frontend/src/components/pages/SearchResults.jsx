import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { backendCaller } from "../utils/backendCaller";
import { timeDifference } from "../utils/timeDifference";

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");

  useEffect(() => {
    if (searchQuery) {
      const fetchSearchResults = async () => {
        setLoading(true);
        const json = await backendCaller(`/videos/search?query=${searchQuery}`);
        if (json.success) {
          setSearchResults(json.data);
        }

        setLoading(false);
      };

      fetchSearchResults();
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full min-h-screen text-white text-center">
        Loading search results...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full min-h-screen text-white">
      <h1 className="text-xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-center">
        Search Results for "{searchQuery}"
      </h1>
      {searchResults.length === 0 ? (
        <div className="text-center text-gray-400">No results found</div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {searchResults.map((video) => (
            <div
              key={video._id}
              className="flex flex-col sm:flex-row bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 mb-4 sm:mb-6 p-4 gap-4"
            >
              {/* Thumbnail */}
              <Link
                to={`/video/watch/${video._id}`}
                className="w-full sm:w-96 flex-shrink-0"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-44 sm:h-56 object-cover rounded-lg"
                />
              </Link>

              {/* Video Info */}
              <div className="flex flex-col justify-between flex-grow">
                <h2 className="text-lg font-semibold text-gray-100 truncate sm:whitespace-normal">
                  {video.title}
                </h2>

                {/* Channel Info */}
                <Link
                  to={`/channel-info/${video.owner.userName}`}
                  className="flex items-center mt-2 space-x-2"
                >
                  <img
                    src={video.owner?.avatar}
                    alt={video.owner?.fullName}
                    className="w-6 sm:w-8 h-6 sm:h-8 rounded-full"
                  />
                  <p className="text-sm text-gray-300">
                    {video.owner?.fullName}
                  </p>
                </Link>

                {/* Views & Time */}
                <p className="text-xs text-gray-400 mt-2">
                  {video.views} views • {timeDifference(video.createdAt)}
                </p>

                {/* Description */}
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 sm:line-clamp-3">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
