import { NextFunction, Request, Response } from "express";
import { Inventory } from "../queries";
import CustomError from "../handler/CustomError";
import path from "path";
import fs from "fs"

export async function getAllInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Inventory.getAllInventory()

    res.status(200).json({ success: true, data: data })
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
    if (!name || !quantity || !quantity_description || !category || !location || !description || !userId) {
      throw new CustomError("Parameter tidak lengkap", 400);
    }

    // Ambil file dari multer (bukan dari req.body)
    const file = req.file;
    if (!file) {
      throw new CustomError("File gambar wajib diunggah", 400);
    }

    // Dapatkan path file relatif agar bisa diakses frontend
    const imagePath = `/uploads/inventory/${file.filename}`;

    const data = await Inventory.createInventory({
      name,
      quantity: Number(quantity),
      quantity_description,
      category,
      location,
      description,
      image: imagePath,
      userId,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}