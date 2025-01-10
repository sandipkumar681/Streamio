import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
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

    res
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
