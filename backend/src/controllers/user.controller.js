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
  partitioned: process.env.PARTITIONED === "true",
};

const refreshTokenOptions = {
  httpOnly: process.env.HTTPONLY === "true",
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAMESITE,
  maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
  partitioned: process.env.PARTITIONED === "true",
};

const clearCookieOption = {
  httpOnly: process.env.HTTPONLY === "true",
  secure: process.env.SECURE === "true",
  sameSite: process.env.SAMESITE,
};

const generateAccessAndRefreshToken = async (user) => {
  try {
    user.refreshToken = user.generateRefreshToken();

    await user.save({ validateBeforeSave: false });

    return {
      newAccessToken: user.generateAccessToken(),
      newRefreshToken: user.refreshToken,
    };
  } catch (error) {
    throw new apiError(500, "Error while generating access and refresh token!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
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
      otp: Joi.number().required(),
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
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Otp is incorrect!"));
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

    const coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

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
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while registering User"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { userNameOrEmail, password } = req.body;
    if (!userNameOrEmail || !password) {
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

    if (!(await user.isPasswordCorrect(password))) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Password is incorrect!"));
    }

    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user);

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
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    return res
      .status(200)
      .clearCookie("accessToken", clearCookieOption)
      .clearCookie("refreshToken", clearCookieOption)
      .json(new apiResponse(200, {}, "User logged out successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error during logging out!"
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
      await generateAccessAndRefreshToken(user);

    await user.updateOne({
      refreshToken: newRefreshToken,
    });

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

    if (
      [oldPassword, newPassword].some((field) => {
        return field.trim() === "";
      })
    ) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Field can not be empty!"));
    }

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
      .json(new apiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error when changing password!"
    );
  }
});

const getCurrentUserDetails = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new apiResponse(200, req.user, "User fetched successfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error when getting user details!"
    );
  }
});

const changeAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { email, fullName, otp } = req.body;

    if (
      [email, fullName, otp].some((field) => {
        return field.trim();
      }) === ""
    ) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Field can not be blank!"));
    }

    const schema = Joi.object({
      fullName: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, error.details[0].message));
    }

    const otpInDb = await Otp.findOne({ email });

    if (Number(otp) !== otpInDb?.otp) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Otp is incorrect!"));
    }

    const isNewEmailAlreadyExists = await User.findOne({ email });

    const prevUser = await User.findById(req.user._id);

    if (
      isNewEmailAlreadyExists &&
      isNewEmailAlreadyExists.email !== prevUser.email
    ) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "New email already exists!"));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { email, fullName } },
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

    if (!avatarLocalPath) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an avatar file!"));
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
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
    ).select("-password -refreshToken -createdAt -updatedAt");

    return res
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

    if (!coverImageLocalPath) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "Must require an cover image file!"));
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
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
    ).select("-password -refreshToken -createdAt -updatedAt");

    return res
      .status(200)
      .json(new apiResponse(200, { user }, "Cover image updated successfully"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while changing user details"
    );
  }
});

const getWatchHistory = asyncHandler(async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $unwind: "$watchHistory",
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory.videoId",
          foreignField: "_id",
          as: "userHistory",
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
                      userName: 1,
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
      {
        $addFields: {
          userHistory: {
            $first: "$userHistory",
          },
        },
      },
      {
        $addFields: {
          "userHistory.watchedAt": "$watchHistory.watchedAt",
        },
      },
      {
        $group: {
          _id: "$_id",
          userHistory: {
            $push: "$userHistory",
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          user[0].userHistory,
          "Watch history fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching user history!"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id.toString();

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
    return res
      .status(200)
      .json(new apiResponse(200, info, "Fetched all videos!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while fetching liked videos!"
    );
  }
});

const isUserExist = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message ||
        "Internal server error while checking user exists or not!"
    );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
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
      return res.status(
        400,
        {},
        "OTP has expired! Please request another one."
      );
    }

    if (Number(otp) !== otpData.otp) {
      return res
        .status(400)
        .json(new apiResponse(400, {}, "OTP is incorrect!"));
    }

    const user = await User.findOne({ email });

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Password updated suiccessfully!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message || "Internal server error while resetting user password!"
    );
  }
});

const isUserLoggedIn = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new apiResponse(200, req.user, "User is logged in!"));
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error.message ||
        "Internal server error while checking user logged in or not!"
    );
  }
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
  getWatchHistory,
  getLikedVideos,
  isUserExist,
  resetPassword,
  isUserLoggedIn,
};
