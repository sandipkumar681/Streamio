import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

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

    if (!mongoose.isValidObjectId(videoId)) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Invalid video ID!"));
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

    const newComment = await Comment.create({
      content,
      video: videoId,
      user,
    });

    const comment = await Comment.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(newComment._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
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
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "like",
        },
      },
      {
        $addFields: {
          user: {
            $first: "$user",
          },
          like: { $size: "$like" },
        },
      },
    ]);

    return res
      .status(201)
      .json(new apiResponse(201, comment[0], "Comment added successfully!"));
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

    if (!commentId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require a comment ID!"));
    }
    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Invalid comment ID!"));
    }

    const comment = await Comment.findById(commentId);

    const { newContent } = req.body;

    if (!newContent) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "New comment must not be empty!"));
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

    return res
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
    const { commentId } = req.params;

    if (!commentId) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require a comment ID!"));
    }
    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Invalid comment ID!"));
    }

    const comment = await Comment.findById(commentId);

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
      .json(new apiResponse(400, {}, "Must require a video ID!"));
  }

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid video ID!"));
  }

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  let decodedToken = {};

  if (token) {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $addFields: {
              isUserComment: {
                $cond: {
                  if: {
                    $eq: [
                      "$_id",
                      new mongoose.Types.ObjectId(decodedToken._id),
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              avatar: 1,
              fullName: 1,
              isUserComment: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "like",
        pipeline: [
          {
            $addFields: {
              doesUserLiked: {
                $cond: {
                  if: {
                    $eq: [
                      "$likedBy",
                      new mongoose.Types.ObjectId(decodedToken._id),
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
        doesUserLiked: {
          $first: "$like.doesUserLiked",
        },
        like: { $size: "$like" },
        isUserComment: {
          $first: "$user.isUserComment",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, comments, "All comments fetched successfully!"));
});
export { addComment, editComment, deleteComment, allComment };
