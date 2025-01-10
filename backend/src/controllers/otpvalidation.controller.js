import { Otp } from "../models/otp.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const otpvalidation = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpInDb = await Otp.findOne({ email });

  if (Number(otp) !== otpInDb?.otp) {
    return res.status(400).json(new apiResponse(400, {}, "Otp is incorrect!"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Otp is correct. Please proceed further."));
});

export default otpvalidation;
