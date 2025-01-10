import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  addComment,
  allComment,
  deleteComment,
  editComment,
} from "../controllers/comment.controllers.js";

const router = Router();

router.route("/addcomment/:videoId").post(verifyJWT, addComment);

router.route("/editcomment/:commentId").patch(verifyJWT, editComment);

router.route("/deletecomment/:commentId").delete(verifyJWT, deleteComment);

router.route("/allcomment/:videoId").get(allComment);

export default router;
