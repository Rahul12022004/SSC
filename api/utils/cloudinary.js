import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===============================
// ✅ GENERATE SIGNED URL (VIDEO + PDF)
// ===============================
export const generateSignedUrl = (
  public_id,
  resource_type = "video",
  type = "upload"
) => {
  try {
    const url = cloudinary.url(public_id, {
      resource_type,
      type,
      sign_url: true,
      secure: true,
    });

    return url;
  } catch (err) {
    console.error("❌ generateSignedUrl ERROR:", err);
    return null;
  }
};

// ===============================
// ❌ DELETE FILE
// ===============================
export const deleteFile = async (public_id, resource_type = "video") => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return result;
  } catch (err) {
    console.error("❌ Cloudinary delete error:", err);
    throw err;
  }
};

export default cloudinary;