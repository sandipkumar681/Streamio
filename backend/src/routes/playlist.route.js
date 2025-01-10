import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/createplaylist").post(createPlaylist);

router.route("/getuserplaylists").get(getUserPlaylists);

router.route("/getplaylist/:playlistId").get(getPlaylistById);

router
  .route("/addvideotoplaylist/:playlistId&:videoId")
  .get(addVideoToPlaylist);

router.route("/removeplaylist/:playlistId").patch(removeVideoFromPlaylist);

router.route("/deleteplaylist/:playlistId").delete(deletePlaylist);

router.route("/updateplaylist/:playlistId&:videoId").patch(updatePlaylist);

export default router;
