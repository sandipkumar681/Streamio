import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Video id must required!"));
  }

  const isVideoPresent = await Video.findById(videoId);

  if (!isVideoPresent) {
    return res
      .status(404)
      .json(new apiResponse(404, {}, "Video does not exists!"));
  }

  const userId = req.user._id.toString();

  const isLikePresent = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (!isLikePresent) {
    await Like.create({
      video: videoId,
      likedBy: userId,
    });
  } else {
    const likeId = isLikePresent._id;
    await Like.deleteOne({ _id: likeId });
  }

  res
    .status(200)
    .json(new apiResponse(200, {}, "Video like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Comment id must required!"));
  }

  const isCommentPresent = await Video.findById(commentId);

  if (!isCommentPresent) {
    return res
      .status(404)
      .json(new apiResponse(404, {}, "Comment does not exists!"));
  }

  const userId = req.user._id.toString();

  const isLikePresent = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (!isLikePresent) {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    });
  } else {
    const likeId = isLikePresent._id;
    await Like.deleteOne({ _id: likeId });
  }

  res
    .status(200)
    .json(new apiResponse(200, {}, "Comment like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike };
