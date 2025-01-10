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

const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;

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

    if (
      [title, description, isPublished].some((field) => {
        return field.trim();
      }) === ""
    ) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Field can not be blank!"));
    }

    const schema = Joi.object({
      title: Joi.string().min(3).max(30).required(),
      description: Joi.string().min(3).max(1000).required(),
      isPublished: Joi.string().exist().required(),
    });

    const { error, value } = schema.validate(req.body);

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

    // const video = await Video.findById(videoId);

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
          as: "owner_details",
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner_details: {
            $first: "$owner_details",
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
          owner_details: 1,
          createdAt: 1,
          numberOfLikesOnAVideo: {
            $size: "$numberOfLikesOnAVideo",
          },
        },
      },
    ]);

    if (video.length === 0) {
      res.status(404).json(new apiResponse(404, {}, "Video does not exists!"));
    }

    await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { views: 1 },
      },
      { new: true }
    );

    res
      .status(200)
      .json(new apiResponse(200, video, "Video fetched successfully"));
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

    const user = await User.findOne({ userName }).select(
      "-fullName -avatar -email -coverImage -password -watchHistory -createdAt -updatedAt -refreshToken -__v -userName"
    );

    if (!user) {
      return res
        .status(400)
        .json(new apiResponse(404, {}, "Username does not exist!"));
    }

    const videos = await Video.find({
      $and: [{ owner: user._id.toString() }, { isPublished: true }],
    });

    if (!videos.length) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "There is no videos uploaded yet!"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, videos, "Videos fetched successfully for user")
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

    res
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

    res
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

  res
    .status(200)
    .json(new apiResponse(200, videos, "Videos fetched successfully"));
});

export {
  uploadVideo,
  fetchVideoById,
  fetchAllVideosForUser,
  deleteVideo,
  togglePublishStatus,
  fetchVideosForHome,
};
