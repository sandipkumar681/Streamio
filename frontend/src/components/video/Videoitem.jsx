import { Link } from "react-router-dom";
import { timeDifference } from "../utils/timeDifference";

const VideoItem = ({ video }) => {
  return (
    <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link to={`/video/watch/${video?._id}`} className="block">
        <img
          src={video?.thumbnail}
          alt={video?.title}
          className="w-full h-48 sm:h-40 md:h-44 lg:h-48 object-cover"
        />
      </Link>
      <div className="flex px-4 py-3">
        <Link to={`/channel-info/${video.ownerDetails.userName}`}>
          <img
            src={video?.ownerDetails?.avatar}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover mr-3"
          />
        </Link>
        <div className="flex-1">
          <h3 className="text-gray-100 text-sm md:text-base font-semibold line-clamp-2">
            {video?.title}
          </h3>
          <Link
            to={`/channel-info/${video.ownerDetails.userName}`}
            className="text-gray-400 text-xs md:text-sm"
          >
            {video?.ownerDetails?.userName}
          </Link>
          <p className="text-gray-500 text-xs">
            {video?.views} views • {timeDifference(video?.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoItem;
