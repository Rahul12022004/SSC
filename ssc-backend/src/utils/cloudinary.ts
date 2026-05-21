import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateSignedUrl = (
  public_id: string,
  resource_type: string = "video",
  type: string = "upload"
) => {
  try {
    return cloudinary.url(public_id, { resource_type, type, sign_url: true, secure: true });
  } catch (err) {
    console.error("generateSignedUrl ERROR:", err);
    return null;
  }
};

export const deleteFile = async (public_id: string, resource_type: string = "video") => {
  try {
    return await cloudinary.uploader.destroy(public_id, { resource_type });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
};

export default cloudinary;
