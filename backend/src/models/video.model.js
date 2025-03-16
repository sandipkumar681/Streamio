import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      require: true,
    },
    thumbnail: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
      index: true,
    },
    description: {
      type: String,
      require: true,
      index: true,
    },
    duration: {
      type: Number,
      require: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      enum: [true, false],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    tag: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
