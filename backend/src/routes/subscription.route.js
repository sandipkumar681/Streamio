import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();

router
  .route("/togglesubscription/channelId=:channelId")
  .get(verifyJWT, toggleSubscription);

router
  .route("/getsubscribers/channelId=:channelId")
  .get(getUserChannelSubscribers);

router.route("/getsubscribedChannels").get(verifyJWT, getSubscribedChannels);
export default router;
