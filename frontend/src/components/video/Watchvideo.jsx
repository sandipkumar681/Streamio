import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import {
  HandThumbUpIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { backendCaller } from "../utils/backendCaller";
import ShareModal from "./ShareModal";
import { useSelector } from "react-redux";
import PlaylistModal from "./PlaylistModal";
import { timeDifference } from "../utils/timeDifference";
import ShowTime from "../utils/ShowTime";
import CommentsList from "../pages/commentList";
import VideoDescription from "./VideoDescription";

const Watchvideo = () => {
  // let rendered = useRef(0);
  // rendered.current += 1;
  // console.log("Renders in watchVideos: ", rendered);
  const { id } = useParams();
  const [videoInfo, setVideoInfo] = useState({});
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isMaximised, setIsMaximised] = useState(false);
  const [timeOutId, setTimeOutId] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const videoRef = useRef();
  const videoSectionRef = useRef();
  const infoSectionRef = useRef();
  const isLoggedIn = useSelector((state) => state.logInReducer.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  const videoUrl = `${import.meta.env.VITE_FRONTEND_URL}/video/watch/${
    videoInfo._id
  }`;

  const fetchVideo = useCallback(async () => {
    try {
      const response = await backendCaller(`/videos/fetchvideo/${id}`);

      if (response.success) {
        setVideoInfo(response.data);
      } else {
        setMessage(response?.message || "Failed to fetch video!");
      }
    } catch (error) {
      setMessage("An error occured while fetching a video!");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchRelatedVideos = useCallback(async () => {
    try {
      const response = await backendCaller("/videos/fetchvideosforhome");
      setIsLoading(false);
      if (response.success) {
        setRelatedVideos(response.data);
      } else {
        setMessage(response?.message || "Failed to fetch related video!");
      }
    } catch (error) {
      setMessage("An error occured while fetching related video!");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideo();
    fetchRelatedVideos();
  }, [fetchVideo, fetchRelatedVideos]);

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

  const checkIsLogedIn = () => {
    if (!isLoggedIn) {
      navigate(
        `/account/login?redirect=${encodeURIComponent(location.pathname)}`
      );
      return;
    }
  };

  const handleLikeToggle = async () => {
    checkIsLogedIn();
    const response = await backendCaller(`/likes/togglevideolike/${id}`);

    if (response.success) {
      setVideoInfo((prev) => {
        if (prev.doesUserAlreadyLiked) {
          return {
            ...prev,
            doesUserAlreadyLiked: !prev.doesUserAlreadyLiked,
            numberOfLikes: prev.numberOfLikes - 1,
          };
        }
        return {
          ...prev,
          doesUserAlreadyLiked: !prev.doesUserAlreadyLiked,
          numberOfLikes: prev.numberOfLikes + 1,
        };
      });
    }
  };

  const handleSubscriptionToggle = async () => {
    checkIsLogedIn();
    const response = await backendCaller(
      `/subscriptions/togglesubscription/channelId=${videoInfo?.ownerDetails?._id}`
    );

    if (response.success) {
      setVideoInfo((prev) => ({
        ...prev,
        doesUserAlreadySubscribed: !prev.doesUserAlreadySubscribed,
      }));
    }
  };

  const handleSaveClick = () => {
    checkIsLogedIn();
    setIsPlaylistModalOpen(true);
  };

  const handleKeyDownOnPage = (e) => {
    if (e.key === "Escape") {
      if (isShareModalOpen || isPlaylistModalOpen) {
        setIsShareModalOpen(false);
        setIsPlaylistModalOpen(false);
      }
    }
  };

  const handleKeyDownOnVideo = (e) => {
    if (e.key === "f") {
      handleToggleMaximise();
    } else if (e.key === "ArrowLeft") {
      handleBackwardPlay();
    } else if (e.key === "ArrowRight") {
      handleForwardPlay();
    } else if (e.key === " ") {
      e.preventDefault();
      handlePlayAndPause();
    } else {
      console.log(e.key);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoInfo.videoFile;
    link.target = "_blank";
    link.download = "video.mp4";
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-white">
        Loading...
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-white">
        {message}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-black  px-4 md:px-8 py-6 w-full">
      {/* Video Section */}
      <div
        className="w-full lg:w-2/3 mx-auto my-4"
        onKeyDown={handleKeyDownOnPage}
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
              onKeyDown={handleKeyDownOnVideo}
              className="absolute top-0 left-0 w-full h-full object-contain bg-black"
            ></video>
          </div>

          <div
            className={
              !isMaximised ? `absolute bottom-0 left-0 w-full px-4 py-2` : `` //add infosection in maximised mode
            }
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
                <ShowTime
                  duration={videoInfo.duration}
                  currentDuration={currentDuration}
                />
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

        {/* Video Info */}
        <div className="p-4">
          {/* Title */}
          <h1 className="text-lg md:text-lg lg:text-2xl font-semibold text-white mb-2">
            {videoInfo.title}
          </h1>

          {/* Channel Info Section */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-4">
            {/* Start: Channel Info */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <img
                src={videoInfo?.ownerDetails?.avatar}
                alt="Channel Logo"
                className="w-10 h-10 rounded-full"
              />
              <p className="text-white text-base sm:text-lg font-medium">
                {videoInfo?.ownerDetails?.fullName}
              </p>
              <button
                onClick={handleSubscriptionToggle}
                className={`px-3 sm:px-4 py-1 text-white text-sm sm:text-lg rounded-md transition ${
                  videoInfo.doesUserAlreadySubscribed
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {videoInfo.doesUserAlreadySubscribed
                  ? "Unsubscribe"
                  : "Subscribe"}
              </button>
            </div>

            {/* End: Action Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button
                onClick={handleLikeToggle}
                className="text-gray-300 hover:text-white bg-gray-700 flex items-center border-2 px-3 py-1 sm:p-2 rounded-lg"
              >
                <HandThumbUpIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                <div>{videoInfo.numberOfLikes}</div>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="text-gray-300 hover:text-white bg-gray-700 flex items-center border-2 px-3 py-1 sm:p-2 rounded-lg"
              >
                <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                <div>Share</div>
              </button>

              <ShareModal
                videoUrl={videoUrl}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
              />

              <button
                onClick={handleDownload}
                className="text-gray-300 hover:text-white bg-gray-700 flex items-center border-2 px-3 py-1 sm:p-2 rounded-lg"
              >
                <ArrowDownTrayIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                <div>Download</div>
              </button>

              <button
                onClick={handleSaveClick}
                className="text-gray-300 hover:text-white bg-gray-700 flex items-center border-2 px-3 py-1 sm:p-2 rounded-lg"
              >
                <BookmarkIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                <div>Save</div>
              </button>

              {isPlaylistModalOpen && (
                <PlaylistModal
                  isOpen={true}
                  onClose={() => setIsPlaylistModalOpen(false)}
                  videoId={id}
                />
              )}
            </div>
          </div>
        </div>

        <VideoDescription
          description={videoInfo.description}
          views={videoInfo.views}
          uploadDate={videoInfo.createdAt}
          tags={videoInfo.tag}
        />

        {/* Comment Section */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <CommentsList videoId={videoInfo._id} />
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
              onClick={() => {
                setVideoInfo({});
                // setRelatedVideos([]);
                setIsVideoPlaying(false);
                setCurrentDuration(0);
                setIsMaximised(false);
              }}
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
                  {video.views} views • {timeDifference(video.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watchvideo;
