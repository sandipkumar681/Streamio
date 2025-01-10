import mongoose, { isValidObjectId, Types } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "All fields are required!"));
  }

  const userId = req.user._id.toString();

  const data = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  res
    .status(201)
    .json(new apiResponse(201, data, "Playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const data = await Playlist.find({ owner: userId });

  res
    .status(200)
    .json(new apiResponse(200, data, "Fetched all Playlist successfully!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Must provide a playlist id!"));
  }

  const playlist = await Playlist.findById(playlistId);

  res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist fetched successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Must provide video and playlist id!"));
  }

  // const isVideoPresent = await Playlist.find({
  //   // $and: {
  //   //   _id: new mongoose.Types.ObjectId(playlistId),
  //   //   videos: new mongoose.Types.ObjectId(videoId),
  //   // },
  //   _id: playlistId,
  //   videos: {$cond:if:{ $in: [videoId] },then:,else:},
  // });

  // console.log(isVideoPresent);

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
      // $unshift: {
      //   videos: new mongoose.Types.ObjectId("672dfd0dfb6c1b4b6f02702d"),
      // },
    },
    { new: true, upsert: true }
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        playlist,
        "New video added to playlist successfully!"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Invalid PlaylistId or videoId!"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json(new apiResponse(404, {}, "Playlist not found"));
  }

  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json(new apiResponse(404, {}, "video not found"));
  }

  if (
    (playlist.owner?.toString() && video.owner.toString()) !==
    req.user?._id.toString()
  ) {
    return res
      .status(401)
      .json(
        new apiResponse(
          401,
          {},
          "Only owner can remove video from thier playlist!"
        )
      );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedPlaylist,
        "Removed video from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json(new apiResponse(400, {}, "Invalid PlaylistId"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res
      .status(404)
      .json(new apiResponse(404, {}, "Playlist not found!"));
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Only owner can delete the playlist!"));
  }

  await Playlist.findByIdAndDelete(playlist?._id);

  return res
    .status(200)
    .json(new apiResponse(200, {}, "playlist updated successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;

  if (!name || !description) {
    return res
      .status(400)
      .json(
        new apiResponse(400, {}, "Name and Description both are required!")
      );
  }

  if (!isValidObjectId(playlistId)) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Invalid PlaylistId!"));
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Playlist not found!"));
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Only owner can edit the playlist!"));
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
