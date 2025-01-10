import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import { backendCaller } from "../utils/backendCaller";

function Watchvideo() {
  const { id } = useParams();
  const [videoInfo, setVideoInfo] = useState({});
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isMaximised, setIsMaximised] = useState(false);
  const [timeOutId, setTimeOutId] = useState(0);
  const videoRef = useRef();
  const videoSectionRef = useRef();
  const infoSectionRef = useRef();

  useEffect(() => {
    const fetchVideo = async () => {
      const json = await backendCaller(`/videos/fetchvideo/${id}`);
      setIsLoading(false);
      if (json.success) {
        setVideoInfo(json.data[0]);
      } else {
        setMessage("Failed to fetch video");
      }
    };

    fetchVideo();
  }, [id]);

  useEffect(() => {
    const fetchVideosForHome = async () => {
      const json = await backendCaller("/videos/fetchvideosforhome");
      setIsLoading(false);
      if (json.success) {
        setRelatedVideos(json.data);
      } else {
        setMessage("Failed to fetch video!");
      }
    };

    fetchVideosForHome();
  }, []);

  const maximiseWindow = () => {
    if (videoSectionRef.current.requestFullscreen) {
      videoSectionRef.current.requestFullscreen();
    } else if (videoSectionRef.current.webkitRequestFullscreen) {
      videoSectionRef.current.webkitRequestFullscreen();
    } else if (videoSectionRef.current.msRequestFullscreen) {
      videoSectionRef.current.msRequestFullscreen();
    }
  };

  const minimiseWindow = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleToggleMaximise = () => {
    if (isMaximised) {
      setIsMaximised(false);
      minimiseWindow();
    } else {
      setIsMaximised(true);
      maximiseWindow();
    }
  };

  const handlePlayAndPause = () => {
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleBackwardPlay = () => {
    videoRef.current.currentTime -= 10;
  };

  const handleForwardPlay = () => {
    videoRef.current.currentTime += 10;
  };

  const handleMouseMove = () => {
    if (timeOutId) {
      clearTimeout(timeOutId);
      setTimeOutId(0);
    }
    infoSectionRef.current.classList.remove("hidden");
    videoRef.current.classList.add("cursor-pointer");
    videoRef.current.classList.remove("cursor-none");
    if (isVideoPlaying) {
      setTimeOutId(
        setTimeout(() => {
          infoSectionRef.current.classList.add("hidden");
          videoRef.current.classList.remove("cursor-pointer");
          videoRef.current.classList.add("cursor-none");
        }, 3000)
      );
    }
  };

  const handleMouseLeave = () => {
    if (!isVideoPlaying) {
      infoSectionRef.current.classList.remove("hidden");
      videoRef.current.classList.add("cursor-pointer");
      videoRef.current.classList.remove("cursor-none");
      clearTimeout(timeOutId);
      setTimeOutId((prev) => {
        prev === 0;
      });
    }
  };
  const handleOnTimeUpdate = () => {
    if (videoRef.current.currentTime >= videoInfo.duration) {
      setIsVideoPlaying(false);
    }
    setCurrentDuration(videoRef.current.currentTime);
  };

  const secondsToHours = (duration) => {
    if (Math.floor(duration / 3600)) {
      return 0;
    }
    return Math.floor(duration / 3600);
  };
  const secondsToMinutes = (duration) => {
    return Math.floor(duration / 60);
  };

  const secondsToRemainderSeconds = (duration) => {
    return Math.floor(duration % 60);
  };

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
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-black  px-4 md:px-8 py-6 w-full">
      {/* Video Section */}
      <div
        className="w-full lg:w-2/3 mx-auto my-4"
        onKeyDown={(e) => {
          if (e.key === "f") {
            handleToggleMaximise();
          } else if (e.key === "ArrowLeft") {
            handleBackwardPlay();
          } else if (e.key === "ArrowRight") {
            handleForwardPlay();
          } else if (e.key === " ") {
            e.preventDefault();
            handlePlayAndPause();
          }
        }}
      >
        <div
          ref={videoSectionRef}
          onDoubleClick={handleToggleMaximise}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full overflow-hidden bg-black rounded-lg"
        >
          {/* Aspect Ratio Container */}
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <video
              onClick={handlePlayAndPause}
              onTimeUpdate={handleOnTimeUpdate}
              ref={videoRef}
              src={videoInfo.videoFile}
              poster={videoInfo.thumbnail}
              className="absolute top-0 left-0 w-full h-full object-contain bg-black"
            ></video>
          </div>

          <div
            className="absolute bottom-0 left-0 w-full px-4 py-2"
            ref={infoSectionRef}
          >
            <input
              type="range"
              className="block w-full accent-red-500 cursor-pointer"
              onChange={(e) => {
                videoRef.current.currentTime = e.target.value;
                setCurrentDuration(e.target.value);
              }}
              value={currentDuration}
              min={0}
              max={videoInfo.duration}
            />
            <div className="flex justify-between">
              <div className="flex flex-initial">
                <button onClick={handleBackwardPlay}>
                  <BackwardIcon className="h-8 w-8 m-1 text-gray-300" />
                </button>
                <button onClick={handlePlayAndPause}>
                  {!isVideoPlaying ? (
                    <PlayIcon className="h-8 w-8 m-1 text-gray-300" />
                  ) : (
                    <PauseIcon className="h-8 w-8 m-1 text-gray-300" />
                  )}
                </button>
                <button onClick={handleForwardPlay}>
                  <ForwardIcon className="h-8 w-8 m-1 text-gray-300" />
                </button>
                <button
                  disabled
                  className="text-gray-400 mx-3 my-1 text-center"
                >
                  {secondsToHours(currentDuration)
                    ? secondsToHours(currentDuration)
                    : ""}
                  {secondsToHours(currentDuration) ? ":" : ""}
                  {secondsToMinutes(currentDuration)}
                  {":"}
                  {secondsToRemainderSeconds(currentDuration)} {" / "}
                  {secondsToHours(currentDuration)
                    ? secondsToHours(currentDuration)
                    : ""}
                  {secondsToHours(currentDuration) ? ":" : ""}
                  {secondsToMinutes(videoInfo.duration)}
                  {":"}
                  {secondsToRemainderSeconds(videoInfo.duration)}
                </button>
              </div>
              <div>
                {!isMaximised ? (
                  <button onClick={handleToggleMaximise}>
                    <ArrowsPointingOutIcon className="h-8 w-8 m-1 text-gray-300" />
                  </button>
                ) : (
                  <button onClick={handleToggleMaximise}>
                    <ArrowsPointingInIcon className="h-8 w-8 m-1 text-gray-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-semibold text-white mb-2">
            {videoInfo.title}
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-2">
            {videoInfo.views} views •{" "}
            {new Date(videoInfo.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-300 text-sm sm:text-base">
            {videoInfo.description}
          </p>
        </div>
      </div>

      {/* Related Videos Section */}
      <div className="w-full lg:w-1/4 m-3">
        <h3 className="text-lg md:text-xl font-semibold text-white px-2 mb-4">
          Related Videos
        </h3>
        <div className="flex flex-col gap-4">
          {relatedVideos.map((video) => (
            <Link
              to={`/video/watch/${video._id}`}
              key={video._id}
              className="flex items-center md:items-start gap-4 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-24 h-16 sm:w-32 sm:h-20 md:w-36 md:h-24 rounded-md object-cover"
              />
              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-medium text-white line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-400">
                  {video?.ownerDetails.userName}
                </p>
                <p className="text-sm text-gray-500">
                  {video.views} views •{" "}
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Watchvideo;
