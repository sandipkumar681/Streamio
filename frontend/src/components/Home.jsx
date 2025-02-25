import VideoItem from "./video/Videoitem";
import { useEffect, useState } from "react";

import { backendCaller } from "./utils/backendCaller";
import { useDispatch } from "react-redux";
import { makeSideBarOpen } from "../features/SideBarSlice";

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const [video, setVideo] = useState([]);

  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchVideosForHome = async () => {
      const json = await backendCaller("/videos/fetchvideosforhome");
      if (json.success) {
        setVideo(json.data);
        setIsLoading(false);
      } else {
        setMessage("Failed to fetch video!");
      }
    };

    dispatch(makeSideBarOpen());

    fetchVideosForHome();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        {message}
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
}

export default Home;
