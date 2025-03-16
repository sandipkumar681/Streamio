import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must add a comment!"));
    }

    const { videoId } = req.params;

    if (!videoId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require a video id"));
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Video does not exists!"));
    }

    const user = req.user._id.toString();

    const isCommentExists = await Comment.findOne({
      $and: [{ user }, { video: videoId }],
    });

    if (isCommentExists) {
      return res
        .status(400)
        .json(
          new apiResponse(400, {}, "You have already commented on this video")
        );
    }

    const comment = await Comment.create({
      content,
      video: videoId,
      user,
    });

    res
      .status(201)
      .json(new apiResponse(201, comment, "Comment added successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while adding comment!"
    );
  }
});

const editComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    const { newContent } = req.body;

    if (!newContent) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "A comment must required to update!"));
    }

    if (!comment) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Comment does not exists!"));
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Unauthorised access!"));
    }

    const result = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { content: newContent } },
      { new: true }
    );

    res
      .status(200)
      .json(new apiResponse(200, result, "Comment is updated successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while editing comment!"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "This comment does not exists!"));
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Unauthorised access!"));
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while deleting comment!"
    );
  }
});

const allComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Must require a video id!"));
  }

  const comments = await Comment.find({ video: videoId });

  res
    .status(200)
    .json(new apiResponse(200, comments, "All comments fetched successfully!"));
});
export { addComment, editComment, deleteComment, allComment };
