import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Channel id must required!"));
  }

  const doesChannelExists = await User.findById(channelId);

  if (!doesChannelExists) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Channel doesnot exists!"));
  }

  const userId = req.user._id.toString();

  const isSubscribed = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (!isSubscribed) {
    await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
  } else {
    const subscribeId = isSubscribed._id;
    await Subscription.deleteOne({ _id: subscribeId });
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "subscription toggled successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Channel id must required!"));
  }

  const subscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    { $count: "numberOfSubscribers" },
  ]);

  return res
    .status(201)
    .json(
      new apiResponse(201, subscribers, "Subscribers fetched successfully!")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const channels = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscriberCount",
            },
          },
          {
            $addFields: {
              subscriberCount: {
                $size: "$subscriberCount",
              },
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              avatar: 1,
              fullName: 1,
              subscriberCount: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: {
          $first: "$channel",
        },
      },
    },
    { $project: { _id: 1, channel: 1 } },
  ]);

  if (channels.length === 0) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Not subscribed to a chhanel yet!"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, channels, "Channels fetched successfully!"));
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
