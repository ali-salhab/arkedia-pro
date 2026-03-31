const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Body: { data: "data:image/...;base64,...", folder: "hotels" }
 * Returns: { url, public_id }
 *
 * If Cloudinary is not configured the base64 dataURL is returned as-is
 * (development fallback — avoids blocking the UI when credentials are missing).
 */
exports.uploadImage = async (req, res, next) => {
  try {
    const { data, folder = "general" } = req.body;
    if (!data) return res.status(400).json({ message: "No image data provided" });

    // Fallback: return the data-URL as-is when Cloudinary is not configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.json({ url: data, public_id: null });
    }

    const result = await cloudinary.uploader.upload(data, {
      folder: `arkedia/${folder}`,
      resource_type: "image",
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
};
