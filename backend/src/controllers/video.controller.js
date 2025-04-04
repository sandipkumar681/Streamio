import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinaryImage,
  deleteOnCloudinaryVideo,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import Joi from "joi";
import { unlinkSync } from "node:fs";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import jwt from "jsonwebtoken";

const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;

    let { tag } = req.body;

    const videoLocalPath = req.files?.userVideo?.[0]?.path;

    const thumbnailLocalPath = req.files?.userThumbnail?.[0]?.path;

    const removeFiles = () => {
      if (videoLocalPath) {
        unlinkSync(videoLocalPath);
      }
      if (thumbnailLocalPath) {
        unlinkSync(thumbnailLocalPath);
      }
    };

    if (!videoLocalPath) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Please upload a video!"));
    }

    if (!thumbnailLocalPath) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Please upload a thumbnail!"));
    }

    if ([title, description, isPublished].some((field) => !field.trim())) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Field can not be blank!"));
    }

    if (tag && typeof tag === "string") {
      tag = tag.split(",").map((tag) => tag.trim());
    }

    const schema = Joi.object({
      title: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(3).max(1000).required(),
      isPublished: Joi.boolean().required(),
      tag: Joi.optional(),
    });

    const { error, value } = schema.validate(req.body);

    if (Array.isArray(tag) && tag.length > 0) {
      tag = tag.map((field) => field.toLowerCase());
    }

    if (error) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, error.details[0].message));
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);

    const duration = Math.floor(videoFile?.duration);

    if (!videoFile) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Error while uploading video!"));
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Error while uploading thumbnail!"));
    }

    const result = await Video.create({
      title,
      description,
      isPublished,
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      duration,
      owner: req.user._id,
      tag,
    });

    return res
      .status(200)
      .json(new apiResponse(200, result, "Video uploaded successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while uploading video!"
    );
  }
});

const fetchVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Provide video id!"));
    }

    if (!mongoose.isValidObjectId(videoId)) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Invalid video ID!"));
    }

    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "numberOfLikesOnAVideo",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          ownerDetails: {
            $first: "$ownerDetails",
          },
        },
      },
      {
        $project: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          ownerDetails: 1,
          createdAt: 1,
          tag: 1,
          numberOfLikes: {
            $size: "$numberOfLikesOnAVideo",
          },
        },
      },
    ]);

    if (video.length === 0) {
      return res
        .status(404)
        .json(new apiResponse(404, {}, "Video does not exists!"));
    }

    let doesUserAlreadyLiked = false;
    let doesUserAlreadySubscribed = false;

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (decodedToken) {
        const user = await User.findById(decodedToken._id);

        const isVideoAlreadyPresentInHistory = await User.findById(
          decodedToken._id,
          { "watchHistory.videoId": videoId }
        );

        if (isVideoAlreadyPresentInHistory) {
          await User.findByIdAndUpdate(decodedToken._id, {
            $pull: { watchHistory: { videoId } },
          });
        }

        await User.findByIdAndUpdate(decodedToken._id, {
          $push: { watchHistory: { videoId } },
        });

        const userId = user._id;

        doesUserAlreadyLiked = await Like.findOne({
          $and: [{ video: videoId }, { likedBy: userId }],
        });

        if (doesUserAlreadyLiked) {
          doesUserAlreadyLiked = true;
        } else {
          doesUserAlreadyLiked = false;
        }

        doesUserAlreadySubscribed = await Subscription.findOne({
          $and: [
            { channel: video[0]?.ownerDetails?._id.toString() },
            { subscriber: userId },
          ],
        });

        if (doesUserAlreadySubscribed) {
          doesUserAlreadySubscribed = true;
        } else {
          doesUserAlreadySubscribed = false;
        }
      }
    }

    await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { views: 1 },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { ...video[0], doesUserAlreadyLiked, doesUserAlreadySubscribed },
          "Video fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching a video"
    );
  }
});

const fetchAllVideosForUser = asyncHandler(async (req, res) => {
  try {
    const { userName } = req.params;

    if (!userName) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an username!"));
    }

    const owner = await User.aggregate([
      {
        $match: {
          userName,
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          fullName: 1,
          coverImage: 1,
          avatar: 1,
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
        $addFields: {
          subscribers: { $size: "$subscribers" },
        },
      },
    ]);

    if (!owner[0]) {
      return res
        .status(400)
        .json(new apiResponse(404, {}, "Username does not exist!"));
    }

    const videos = await Video.find({
      $and: [{ owner: owner[0]._id.toString() }, { isPublished: true }],
    });

    if (videos.length <= 0) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "There is no videos uploaded yet!"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { channel: owner[0], videos },
          "Videos fetched successfully for user!"
        )
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching video for user!"
    );
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require a videoid!"));
    }
    const video = await Video.findById(videoId);

    if (!video) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "This video does not exists!"));
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json(new apiResponse(401, {}, "Not Allowed"));
    }

    await deleteOnCloudinaryVideo(video.videoFile);

    await deleteOnCloudinaryImage(video.thumbnail);

    await Video.findByIdAndDelete(req.params.videoId);

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Video deleted successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while deleting video"
    );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require a videoid!"));
    }

    const video = await Video.findById(videoId);

    if (video.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json(new apiResponse(401, {}, "Not Allowed"));
    }

    let isPublished = video.isPublished;
    isPublished = !isPublished;

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      //complex
      // [
      //   {
      //     $set: {
      //       isPublished: { $eq: [false, "$isPublished"] },
      //     },
      //   },
      // ],
      { $set: { isPublished } },
      { new: true }
    );

    return res
      .status(200)
      .json(new apiResponse(200, updatedVideo, "Toggled successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while toggling video status!"
    );
  }
});

const fetchVideosForHome = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ownerDetails: {
          $first: "$ownerDetails",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, videos, "Videos fetched successfully"));
});

const searchVideo = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Search query is required!"));
  }

  const videos = await Video.aggregate([
    {
      $match: {
        isPublished: true,
        $or: [
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
          { tag: { $elemMatch: { $regex: query, $options: "i" } } },
        ],
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
            $project: {
              _id: 1,
              avatar: 1,
              fullName: 1,
              userName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (videos.length === 0) {
    return res.status(404).json(new apiResponse(404, {}, "No videos found!"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, videos, "Videos fetched similar to query!"));
});

export {
  uploadVideo,
  fetchVideoById,
  fetchAllVideosForUser, //Not optimised yet
  deleteVideo,
  togglePublishStatus,
  fetchVideosForHome,
  searchVideo,
};
