import { NextFunction, Request, Response } from "express";
import { User } from "../queries";
import bcrypt from 'bcrypt'

export async function getAllUser(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const totalUser = await User.countAll()
    const totalPages = Math.ceil(totalUser / limit)

    const data = await User.getAllUser(limit, offset)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalUser,
        totalPages,
        currentPages: page,
        limit
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllPersonel(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const totalUser = await User.countAll()
    const totalPages = Math.ceil(totalUser / limit)

    const data = await User.getAllPersonel(limit, offset)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalUser,
        totalPages,
        currentPages: page,
        limit
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, nrp, jabatan, password, role, status, pangkat } = req.body;
    const image = req.file
    // **Validation Required Fields**
    if (!name || !email || !nrp || !jabatan || !password || !role || !status || !pangkat) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi.",
      });
    }

    const imageUrl = (image as any).path || (image as any).secure_url;

    // **Check Unique Email**
    const existingEmail = await User.getUserByEmail(email)


    // **Check Unique NRP**
    const existingNRP = await User.getUserByNRP(nrp)

    // **Hash Password**
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name: name,
      email: email,
      nrp: nrp,
      image: imageUrl ?? null,
      jabatan: jabatan,
      password: password,
      status: status,
      role: role,
      pangkat: pangkat,
    }

    // **Create User**
    const newUser = await User.createUser(data)

    return res.status(201).json({
      success: true,
      message: "User berhasil dibuat.",
      data: newUser,
    });

  } catch (error) {
    next(error);
  }
}
