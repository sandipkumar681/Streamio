import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
} from "../controllers/like.controller.js";

const router = Router();

router
  .route("/togglevideolike/videoId=:videoId")
  .get(verifyJWT, toggleVideoLike);

router
  .route("/togglecommentlike/commentId=:commentId")
  .get(verifyJWT, toggleCommentLike);

export default router;
