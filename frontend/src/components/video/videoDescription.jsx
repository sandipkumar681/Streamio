import { useState } from "react";
import { timeDifference } from "../utils/timeDifference";

const VideoDescription = ({
  description = "",
  views = 0,
  uploadDate = new Date(),
  tags = [],
}) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="text-gray-300 p-4 border-t border-gray-600">
      {/* Views & Upload Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base mb-2">
        <p className="font-medium">{views} views</p>
        <p className="text-gray-400">{timeDifference(uploadDate)}</p>
      </div>

      {/* Video Description */}
      <div className="text-sm sm:text-base">
        <p className="break-words overflow-wrap break-all">
          {showFull ? description : description.slice(0, 150)}
          {description.length > 150 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-blue-400 ml-1 hover:underline"
            >
              {showFull ? "Show Less" : "Show More"}
            </button>
          )}
        </p>
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoDescription;
