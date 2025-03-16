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

    secure: true,

    port: process.env.GMAIL_PORT,

    auth: {
      user: process.env.SENDER_GMAIL_ADDRESS,

      pass: process.env.SENDER_GMAIL_PASSWORD,
    },
  });

  async function main() {
    DocumentCreaterInOtpModel();

    const subject = ToCreateProfile
      ? "Welcome to Streamio! Your OTP for Account Setup"
      : "Streamio Security Verification - OTP for Account Update";

    const textContent = ToCreateProfile
      ? `Hello,

We're thrilled to have you join Streamio! To complete your profile setup, please use the OTP below:

OTP: ${otp}

This OTP is valid for 15 minutes. For security reasons, please do not share it with anyone.

If you did not request this, you can safely ignore this email.

Best regards,  
The Streamio Team`
      : `Hello,

We received a request to update your account details. To proceed, please use the OTP below:

OTP: ${otp}

This OTP is valid for 15 minutes. Do not share it with anyone.

If you did not request this, you can safely ignore this email.

Best regards,  
The Streamio Team`;

    const htmlContent = ToCreateProfile
      ? `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1a73e8;">Welcome to Streamio!</h2>
        <p>We're thrilled to have you join us! To complete your profile setup, please use the OTP below:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 20px; font-weight: bold;">
          <span style="color: #1a73e8;">${otp}</span>
        </div>
        <p style="margin-top: 15px;">This OTP is valid for <b>15 minutes</b>. For security reasons, please do not share it with anyone.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="margin-top: 20px;">Best regards,<br><b>The Streamio Team</b></p>
      </div>`
      : `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1a73e8;">Security Verification for Streamio</h2>
        <p>We received a request to update your account details. To proceed, please use the OTP below:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 20px; font-weight: bold;">
          <span style="color: #1a73e8;">${otp}</span>
        </div>
        <p style="margin-top: 15px;">This OTP is valid for <b>15 minutes</b>. Do not share it with anyone.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="margin-top: 20px;">Best regards,<br><b>The Streamio Team</b></p>
      </div>`;

    await transporter.sendMail({
      from: process.env.SENDER_GMAIL_ADDRESS,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "OTP sent successfully to your Email!"));
  }

  main().catch(console.error);
});

export default sendMail;
