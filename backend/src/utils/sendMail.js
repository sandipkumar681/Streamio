import nodemailer from "nodemailer";
import { asyncHandler } from "./asyncHandler.js";
import { apiResponse } from "./apiResponse.js";
import { Otp } from "../models/otp.model.js";
import { minLengthOfOtp, maxLengthOfOtp } from "../constants.js";

const sendMail = asyncHandler(async (req, res) => {
  const { ToCreateProfile, email } = req.body;

  const otp =
    Math.floor(Math.random() * (maxLengthOfOtp - minLengthOfOtp + 1)) +
    minLengthOfOtp;

  const DocumentCreaterInOtpModel = async () => {
    const isOtpExists = await Otp.findOne({ email });

    const createdAt = new Date();

    if (isOtpExists) {
      await Otp.findOneAndUpdate(
        { email },
        {
          otp,
          createdAt,
        }
      );
    } else {
      await Otp.create({ email, otp, createdAt });
    }
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",

    // host: "smtp.gmail.com",

    secure: true,

    port: process.env.GMAIL_PORT,

    auth: {
      user: process.env.SENDER_GMAIL_ADDRESS,

      pass: process.env.SENDER_GMAIL_PASSWORD,
    },
  });

  async function main() {
    DocumentCreaterInOtpModel();

    await transporter.sendMail({
      from: process.env.SENDER_GMAIL_ADDRESS,
      to: email,
      subject: ToCreateProfile
        ? "OTP To Authenticate Creating Profile In Streamio"
        : "OTP To Authenticate Changing Password In Streamio",
      text: ToCreateProfile
        ? `Hello,\n\nWe’re excited to welcome you to Streamio! Here is your OTP to authenticate creating your profile:\n\nOTP : ${otp}\n\nThis OTP is valid for 15 minutes. Please do not share it with anyone.\n\nIf you didn’t request this, please ignore this email.\n\nBest regards,\nThe Streamio Team`
        : `Hello,\n\nHere is your OTP to authenticate changing your password in Streamio:\n\nOTP : ${otp}\n\nThis OTP is valid for 15 minutes. Please do not share it with anyone.\n\nIf you didn’t request this, please ignore this email.\n\nBest regards,\nThe Streamio Team`,
      html: ToCreateProfile
        ? `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #1a73e8;">Welcome to Streamio!</h2>
            <p>We’re excited to have you onboard. To create your profile, please use the following OTP.</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold;">
              OTP : <span style="color: #1a73e8;">${otp}</span>
            </div>
            <p style="margin-top: 15px;">This OTP is valid for <b>15 minutes</b>. Please do not share it with anyone.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <p style="margin-top: 20px;">Best regards,<br><b>The Streamio Team</b></p>
          </div>`
        : `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #1a73e8;">Password Change Request</h2>
            <p>To change your password in Streamio, please use the following OTP.</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold;">
              OTP : <span style="color: #1a73e8;">${otp}</span>
            </div>
            <p style="margin-top: 15px;">This OTP is valid for <b>15 minutes</b>. Please do not share it with anyone.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <p style="margin-top: 20px;">Best regards,<br><b>The Streamio Team</b></p>
          </div>`,
    });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "OTP sent successfully to your Email!"));
  }

  main().catch(console.error);
});

export default sendMail;
