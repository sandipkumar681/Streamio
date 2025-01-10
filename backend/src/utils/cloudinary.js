import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "node:fs";
import { extractPublicId } from "cloudinary-build-url";

const uploadOnCloudinary = async (localFilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (localFilePath) {
      unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    if (localFilePath) {
      unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteOnCloudinaryImage = async (public_url) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = extractPublicId(public_url);

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return null;
  }
};

const deleteOnCloudinaryVideo = async (public_url) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = extractPublicId(public_url);

    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinaryImage, deleteOnCloudinaryVideo };
