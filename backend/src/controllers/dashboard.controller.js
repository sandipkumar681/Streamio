import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  try {
    const userName = req.user.userName.toString();

    const channel = await User.aggregate([
      {
        $match: {
          userName,
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videos",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesCount",
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentsCount",
              },
            },
            {
              $addFields: {
                likesCount: {
                  $size: "$likesCount",
                },
                commentsCount: {
                  $size: "$commentsCount",
                },
              },
            },
            {
              $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalLikes: {
                  $sum: "$likesCount",
                },
                totalComments: {
                  $sum: "$commentsCount",
                },
                totalViews: { $sum: "$views" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalSubscribers: {
            $size: "$subscribers",
          },
          channelInfo: { $first: "$videos" },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          userName: 1,
          totalSubscribers: 1,
          channelInfo: 1,
        },
      },
    ]);

    if (!channel?.length) {
      return res
        .status(404)
        .json(new apiResponse(404, {}, "Channel does not exists!"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, channel[0], "User channel fetched successfully")
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message ||
        "Internal server error while fetching user channel details!"
    );
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  try {
    const videos = await Video.find({ owner: req.user._id });

    if (!videos.length) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "There is no videos uploaded yet!"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, videos, "Videos fetched successfully for owner")
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching video for owner!"
    );
  }
});

export { getChannelStats, getChannelVideos };
