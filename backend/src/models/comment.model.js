import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Video } from "./video.model.js";
import { User } from "./user.model.js";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Video,
      require: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      require: true,
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
