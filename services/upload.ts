// src/middleware/upload.ts
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Validasi environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary environment variables are not set. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
}

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Konfigurasi storage untuk Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "inventory",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PNG or JPG images are allowed"));
    }
    cb(null, true);
  },
});

// Export cloudinary instance untuk digunakan di controller
export { cloudinary };

// Helper function untuk menghapus file dari Cloudinary
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id dari URL Cloudinary
    // Format URL: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) {
      // Jika bukan URL Cloudinary, skip
      return;
    }

    // Ambil bagian setelah "upload" (v{version}/{folder}/{public_id}.{ext})
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");

    // Hapus versi (v{number}/) jika ada
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");

    // Hapus ekstensi file untuk mendapatkan public_id
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

    // Hapus file dari Cloudinary
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Tidak throw error agar tidak mengganggu proses utama
  }
}
