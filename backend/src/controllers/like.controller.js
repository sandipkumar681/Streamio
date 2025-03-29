import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Video id must required!"));
  }

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid video ID"));
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

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Video like toggled successfully!"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Comment id must required!"));
  }

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid comment ID"));
  }

  const isCommentPresent = await Comment.findById(commentId);

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

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Comment like toggled successfully!"));
});

export { toggleCommentLike, toggleVideoLike };
