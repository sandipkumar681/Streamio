import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinaryImage,
} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Joi from "joi";
import { unlinkSync } from "node:fs";
import { Otp } from "../models/otp.model.js";
import ms from "ms";

const accessTokenOptions = {
  httpOnly: process.env.HTTPONLY === "true",
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAMESITE,
  maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
};

const refreshTokenOptions = {
  httpOnly: process.env.HTTPONLY === "true",
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAMESITE,
  maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
};

const clearCookieOption = {
  httpOnly: process.env.HTTPONLY === "true",
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAMESITE,
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const newAccessToken = user.generateAccessToken();

    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;

    await user.save({ validateBeforeSave: false });

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw new apiError(500, "Error while generating access and refresh token!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // try {
  const { fullName, userName, email, password, otp } = req.body;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  //Here problem happens if coverImageLocalPath is null
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Avatar file is required!"));
  }

  const removeFiles = () => {
    if (avatarLocalPath) {
      unlinkSync(avatarLocalPath);
    }
    if (coverImageLocalPath) {
      unlinkSync(coverImageLocalPath);
    }
  };

  if (
    [fullName, userName, email, password, otp].some((field) => {
      return field.trim() === "";
    })
  ) {
    removeFiles();

    return res
      .status(400)
      .json(new apiResponse(400, {}, "Field can not be empty!"));
  }

  const schema = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    userName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    otp: Joi.number().exist().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    removeFiles();

    return res
      .status(400)
      .json(new apiResponse(400, {}, error.details[0].message));
  }

  const otpInDb = await Otp.findOne({ email });

  if (Number(otp) !== otpInDb?.otp) {
    removeFiles();
    return res.status(400).json(new apiResponse(400, {}, "Otp is incorrect!"));
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    removeFiles();

    return res
      .status(400)
      .json(
        new apiResponse(
          400,
          {},
          "Email or Username is already taken. Please choose another one."
        )
      );
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    removeFiles();

    return res
      .status(500)
      .json(
        new apiResponse(
          500,
          {},
          "Avatar file upload by server is unsuccessful!"
        )
      );
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
  // } catch (error) {
  //   throw new apiError(
  //     error.statusCode || 500,
  //     error.message || "Internal server error while registering User"
  //   );
  // }
});

const loginUser = asyncHandler(async (req, res) => {
  //get credintials from user like password and email
  //check if they are correct
  //send response accordingly
  //give them access token and refresh token also

  try {
    const { userNameOrEmail, password } = req.body;
    if (!userNameOrEmail) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an username or email!"));
    }

    const user = await User.findOne({
      $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
    });

    if (!user) {
      return res
        .status(404)
        .json(new apiResponse(404, {}, "User doesn't exist. Please signup!"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Password is incorrect!"));
    }

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, accessTokenOptions)
      .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
      .json(
        new apiResponse(
          200,
          { user: loggedInUser, newRefreshToken, newAccessToken },
          "User log in is successful!"
        )
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while logging in User"
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("accessToken", clearCookieOption)
      .clearCookie("refreshToken", clearCookieOption)
      .json(new apiResponse(200, {}, "Logged out successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while logging out!"
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Invalid refreshtoken!"));
    }

    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodeToken) {
      return res
        .status(401)
        .json(new apiResponse(401, {}, "Unauthorised request!"));
    }

    const user = await User.findById(decodeToken._id);

    if (user.refreshToken !== incomingRefreshToken) {
      return res
        .status(401)
        .json(new apiResponse(401, {}, "Refresh Token is expired or invalid!"));
    }

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, accessTokenOptions)
      .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
      .json(
        new apiResponse(
          200,
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          "Access and Refresh token updated successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error?.message || "Error occured when refreshing access token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const schema = Joi.object({
      oldPassword: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, error.details[0].message));
    }

    if (newPassword.trim() === "") {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "New password can not be blank!"));
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json(
          new apiResponse(400, {}, "Old and New Password can not be same!")
        );
    }

    const user = await User.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Old password is incorrect!"));
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Password changed sucessfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error when changing password"
    );
  }
});

const getCurrentUserDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully!"));
});

const changeAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { userName, email, fullName } = req.body;

    const schema = Joi.object({
      fullName: Joi.string().min(3).max(30).required(),
      userName: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, error.details[0].message));
    }

    if (
      [userName, email, fullName].some((val) => {
        return val.trim();
      }) === ""
    ) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Field can not be blank!"));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { userName, email, fullName } },
      { new: true }
    ).select("-password -refreshToken");

    return res
      .status(200)
      .json(new apiResponse(200, { user }, "Details updated successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while changing user details"
    );
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;

    const removeFiles = () => {
      if (avatarLocalPath) {
        unlinkSync(avatarLocalPath);
      }
    };

    if (!avatarLocalPath) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an avatar file!"));
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Error while uploading avatar"));
    }

    const tempUser = await User.findById(req.user._id);

    await deleteOnCloudinaryImage(tempUser.avatar);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(new apiResponse(200, { user }, "Avatar updated successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while changing user details"
    );
  }
});

const updateCoverImage = asyncHandler(async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;

    const removeFiles = () => {
      if (coverImageLocalPath) {
        unlinkSync(coverImageLocalPath);
      }
    };

    if (!coverImageLocalPath) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an cover image file!"));
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
      removeFiles();

      return res
        .status(400)
        .json(new apiResponse(400, {}, "Error while uploading cover image!"));
    }

    const tempUser = await User.findById(req.user._id);

    await deleteOnCloudinaryImage(tempUser.coverImage);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { coverImage: coverImage.url } },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(new apiResponse(200, { user }, "Cover image updated successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while changing user details"
    );
  }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=20
  const { username } = req.params;

  if (!username?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "username is missing"));
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
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
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);

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
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  if (!userId) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "User id must required!"));
  }

  const info = await User.aggregate([
    [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "likedBy",
          as: "allLikedVideos",
          pipeline: [
            {
              $match: {
                video: {
                  $exists: true,
                },
              },
            },
            {
              $project: {
                video: 1,
              },
            },
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video_details",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      thumbnail: 1,
                      title: 1,
                      duration: 1,
                      views: 1,
                      createdAt: 1,
                      owner: 1,
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
                ],
              },
            },
            {
              $addFields: {
                video_details: {
                  $first: "$video_details",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          userName: 1,
          avatar: 1,
          coverImage: 1,
          fullName: 1,
          allLikedVideos: 1,
        },
      },
    ],
  ]);
  res.status(200).json(new apiResponse(200, info, "Fetched all videos!"));
});

const isUserExist = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, "Must Provide an email!"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json(new apiResponse(400, {}, "Email does not exist! Please signup."));
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Email exists! Sending OTP..."));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (
    [email, otp, newPassword].some((field) => {
      return field.trim() === "";
    })
  ) {
    return res.status(400, {}, "All fields are required!");
  }

  const schema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
    otp: Joi.number().exist().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json(new apiResponse(400, {}, error.details[0].message));
  }

  const otpData = await Otp.findOne({ email });

  if (!otpData) {
    return res.status(400, {}, "OTP has expired! Please request another one.");
  }

  if (Number(otp) !== otpData.otp) {
    return res.status(400).json(new apiResponse(400, {}, "OTP is incorrect!"));
  }

  const user = await User.findOne({ email });

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password updated suiccessfully!"));
});

const isUserLoggedIn = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User is logged in!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUserDetails,
  changeAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getLikedVideos,
  isUserExist,
  resetPassword,
  isUserLoggedIn,
};
