import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(400)
        .json(
          new apiResponse(400, {}, "Access token not found! Please login.")
        );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      return res
        .status(401)
        .json(new apiResponse(401, {}, "Unauthorised request!"));
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken -watchHistory -createdAt -updatedAt"
    );

    req.user = user;

    next();
  } catch (error) {
    throw new apiError(
      error.statusCode || 500,
      error?.message || "Internal server error while authorising user!"
    );
  }
});
