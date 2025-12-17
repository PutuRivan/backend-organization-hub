import { NextFunction, Request, Response } from "express";
import { Inventory } from "../queries";
import CustomError from "../handler/CustomError";
import { deleteImageFromCloudinary, getProccesedUrl } from "../services/upload";

export async function getAllInventory(req: Request, res: Response, next: NextFunction) {
  try {
    // Ambil query params page dan limit (default: page = 1, limit = 10)
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Hitung total data untuk pagination
    const totalItems = await Inventory.countAll() // Pastikan kamu punya fungsi ini di model Inventory
    const totalPages = Math.ceil(totalItems / limit)

    // Ambil data sesuai pagination
    const data = await Inventory.getAllInventory(limit, offset)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    next(error)
  }
}


export async function getInventoryByID(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    if (!id) throw new CustomError("Parameter tidak lengkap", 400)

    const data = await Inventory.getInventoryByID(id)

    if (!data) throw new CustomError("Tidak ada data dengan id tersebut", 404)

    res.status(200).json({ success: true, data: data })
  } catch (error) {
    next(error)
  }
}

export async function createInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, quantity, quantity_description, category, location, description, userId } = req.body;

    // Cek parameter wajib selain file
    if (!name || !quantity || !quantity_description || !category || !location || !userId) {
      throw new CustomError("Parameter tidak lengkap", 400);
    }

    // Ambil file dari multer (bukan dari req.body)
    const file = req.file;
    if (!file) {
      throw new CustomError("File gambar wajib diunggah", 400);
    }

    // Dapatkan URL dari Cloudinary (req.file.path berisi secure URL dari Cloudinary)
    const imageUrl = getProccesedUrl(file);

    const data = await Inventory.createInventory({
      name,
      quantity: Number(quantity),
      quantity_description,
      category,
      location,
      description,
      image: imageUrl,
      userId,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, quantity, quantity_description, category, location, description, userId } = req.body;

    if (!id) throw new CustomError("Parameter id tidak lengkap", 400);

    // Ambil data lama untuk validasi dan hapus file lama jika ada file baru
    const existingInventory = await Inventory.getInventoryByID(id);
    if (!existingInventory) throw new CustomError("Data inventory tidak ditemukan", 404);

    let imageUrl = existingInventory.image;

    // Jika ada file baru diupload, ganti gambar lama
    if (req.file) {
      // Dapatkan URL baru dari Cloudinary
      imageUrl = getProccesedUrl(req.file);

      // Hapus file lama dari Cloudinary (jika ada)
      if (existingInventory.image) {
        await deleteImageFromCloudinary(existingInventory.image);
      }
    }

    // Update data ke database
    const updatedData = await Inventory.updateInventory(id, {
      name: name ?? existingInventory.item_name,
      quantity: quantity ? Number(quantity) : existingInventory.quantity,
      quantity_description: quantity_description ?? existingInventory.quantity_description,
      category: category ?? existingInventory.category,
      location: location ?? existingInventory.location,
      description: description ?? existingInventory.description,
      image: imageUrl,
      userId: userId ?? existingInventory.id,
    });

    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    next(error);
  }
}

export async function deleteInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    if (!id) throw new CustomError("Parameter id tidak lengkap", 400)

    // Ambil data inventory untuk mendapatkan URL gambar
    const existingInventory = await Inventory.getInventoryByID(id);
    if (existingInventory && existingInventory.image) {
      // Hapus gambar dari Cloudinary
      await deleteImageFromCloudinary(existingInventory.image);
    }

    const data = await Inventory.deleteInventory(id)

    res.status(200).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}