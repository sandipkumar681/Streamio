import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Secured routes

router.route("/logout").get(verifyJWT, logoutUser);

router.route("/refresh-tokens").get(refreshAccessToken);

router.route("/change-password").patch( changeCurrentPassword);

router.route("/user-details").get(verifyJWT, getCurrentUserDetails);

router.route("/change-details").patch(verifyJWT, changeAccountDetails);

router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/change-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/dashboard").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

router.route("/likedvideos").get(verifyJWT, getLikedVideos);

router.route("/user-exist").post(isUserExist);

router.route("/reset-password").post(resetPassword);

router.route("/auth/status").get(verifyJWT, isUserLoggedIn);

export default router;
