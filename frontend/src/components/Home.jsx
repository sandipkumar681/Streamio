import VideoItem from "./video/Videoitem";
import { useCallback, useEffect, useRef, useState } from "react";
import { backendCaller } from "./utils/backendCaller";
import { useDispatch } from "react-redux";
import { makeSideBarClose } from "../features/SideBarSlice";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [video, setVideo] = useState([]);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();

  const fetchVideosForHome = useCallback(async () => {
    try {
      const response = await backendCaller("/videos/fetchvideosforhome");
      if (response.success) {
        setVideo(response.data);
      } else {
        setMessage(response?.message || "Failed to fetch video!");
      }
    } catch (error) {
      setMessage("An error occured while fetching video for home!");
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    fetchVideosForHome();

    return () => {
      dispatch(makeSideBarClose());
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen text-center px-4">
        <div>
          <div className="text-2xl font-semibold mb-2">Please wait...</div>
          <p className="text-gray-400">
            The server is spinning up. This may take up to a few minutes ⏳
          </p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
        {message}
      </div>
    );
  }

  if (video.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen text-white">
        No videos yet!
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {video.map((video) => (
          <VideoItem key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Home;
