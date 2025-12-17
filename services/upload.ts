import multer from "multer";
import path from "path";
import fs from "fs";

// Fungsi untuk membuat storage dengan folder yang dinamis
const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "public", folder);
      // Buat folder jika belum ada
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
      const allowedDocs = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const allowed = [...allowedImages, ...allowedDocs];

      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only PNG, JPG, PDF, DOC, or DOCX files are allowed"));
      }
      cb(null, true);
    },
  });
};

// Default upload instance for backward compatibility
export const upload = createUpload("inventory");


// Helper function untuk menghapus file dari storage local
export async function deleteImageFromCloudinary(filePath: string): Promise<void> {
  try {
    if (!filePath) return;

    // Handle jika formatnya masih URL Cloudinary (legacy support - do nothing or log)
    if (filePath.startsWith("http") && filePath.includes("cloudinary")) {
      // console.warn("Cannot delete legacy Cloudinary file locally:", filePath);
      return;
    }

    // Handle local file path
    // Path di database bisa berupa "/public/..." atau relative path
    let localPath = filePath;
    if (filePath.startsWith("/")) {
      localPath = filePath.substring(1); // remove leading slash
    }

    const fullPath = path.join(process.cwd(), localPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

// Helper untuk mendapatkan URL file yang bisa diakses public
export const getProccesedUrl = (file: Express.Multer.File) => {
  const relativePath = path.relative(process.cwd(), file.path);
  return "/" + relativePath.replace(/\\/g, "/");
};

// Export dummy cloudinary object to prevent imports breaking (optional, but requested to refactor away)
// But since the user wants to remove Cloudinary, we should probably remove it.
// However, if I break the controllers imports immediately, the build fails.
// Since I will fix controllers next, I won't export cloudinary.

