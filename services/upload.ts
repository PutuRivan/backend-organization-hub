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

// Fungsi untuk membuat storage dengan folder yang dinamis
const createStorage = (folder: string) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: folder,
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"], // Menambahkan format file dokumen
        transformation: [{ width: 1000, height: 1000, crop: "limit" }],
      };
    },
  });
};

// Fungsi untuk membuat upload instance dengan folder yang dinamis
export const createUpload = (folder: string = "uploads") => {
  const storage = createStorage(folder);

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedImages = ["image/png", "image/jpeg", "image/jpg"];
      const allowedDocs = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const allowed = [...allowedImages, ...allowedDocs];

      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only PNG, JPG, PDF, DOC, or DOCX files are allowed"));
      }
      cb(null, true);
    },
  });
};

// Default upload instance untuk backward compatibility (menggunakan folder "inventory")
export const upload = createUpload("inventory");

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
