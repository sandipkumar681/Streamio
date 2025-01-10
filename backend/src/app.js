import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscriptionRoute from "./routes/subscription.route.js";
import playlistRoute from "./routes/playlist.route.js";
import healthCheckRoute from "./routes/healthcheck.route.js";
import dashboardRoute from "./routes/dashboard.route.js";

import sendMail from "./utils/sendMail.js";
import otpvalidation from "./controllers/otpvalidation.controller.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRoute);
app.use("/api/v1/playlists", playlistRoute);
app.use("/api/v1/", healthCheckRoute);
app.use("/api/v1/dashboard", dashboardRoute);

//route to send mail
app.post("/api/v1/sendemail", sendMail);
app.post("/api/v1/otp-validation", otpvalidation);

export default app;
