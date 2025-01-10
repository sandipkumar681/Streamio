import mongoose from "mongoose";
import { minLengthOfOtp, maxLengthOfOtp } from "../constants.js";

const otpSchema = new mongoose.Schema({
  email: { type: String, require: true },
  otp: {
    type: Number,
    require: true,
    min: minLengthOfOtp,
    max: maxLengthOfOtp,
  },
  createdAt: { type: Date, require: true },
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

export const Otp = mongoose.model("Otp", otpSchema);
