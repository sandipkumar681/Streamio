import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  fetchAllVideosForUser,
  fetchVideoById,
  uploadVideo,
  deleteVideo,
  togglePublishStatus,
  fetchVideosForHome,
  searchVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/uploadVideo").post(
  verifyJWT,
  upload.fields([
    { name: "userVideo", maxCount: 1 },
    { name: "userThumbnail", maxcount: 1 },
  ]),
  uploadVideo
);

router.route("/fetchvideos/:userName").get(fetchAllVideosForUser);

router.route("/fetchvideo/:videoId").get(fetchVideoById);

router.route("/deletevideo/:videoId").delete(verifyJWT, deleteVideo);

router
  .route("/toggle-publish-status/:videoId")
  .get(verifyJWT, togglePublishStatus);

router.route("/fetchvideosforhome").get(fetchVideosForHome);

router.route("/search").get(searchVideo);

export default router;
