import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
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
  try {
    const videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
              },
            },
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
                coverImage: 1,
                fullName: 1,
                subscribers: 1,
              },
            },
            {
              $addFields: {
                subscribers: { $size: "$subscribers" },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          owner: { $first: "$owner" },
        },
      },
    ]);

    if (!videos.length) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "There is no videos uploaded yet!"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, videos, "Videos fetched successfully for owner!")
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching video for owner!"
    );
  }
});

export { getChannelStats, getChannelVideos };
