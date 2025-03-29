import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  toggleVideoLike,
  toggleCommentLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/togglevideolike/:videoId").get(verifyJWT, toggleVideoLike);

router.route("/togglecommentlike/:commentId").get(verifyJWT, toggleCommentLike);

export default router;
