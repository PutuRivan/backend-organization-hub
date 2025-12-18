import { NextFunction, Request, Response } from "express";
import { User, Attendance, AttendanceRecap, Archive } from "../queries";
import bcrypt from 'bcrypt'
import { deleteImageFromCloudinary, getProccesedUrl } from "../services/upload";
import CustomError from "../handler/CustomError";

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

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const totalUser = await User.countPersonel()
    const totalPages = Math.ceil(totalUser / limit)

    const data = await User.getAllPersonel(limit, offset, startOfDay, endOfDay)

    const processedData = data.map((user) => {
      const attendance = user.attendance[0]

      const attendanceStatus = attendance?.AbsentReason ? attendance.AbsentReason : attendance?.status ? attendance.status : "Belum Melakukan Absensi"

      return {
        ...user,
        attendance_status: attendanceStatus
      }
    })

    res.status(200).json({
      success: true,
      data: processedData,
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

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi.",
      });
    }
    const data = await User.getUserById(id)
    res.status(200).json({
      success: true,
      data
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

    const imageUrl = image ? getProccesedUrl(image) : null;

    // **Check Unique Email**
    const existingEmail = await User.getUserByEmail(email)

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar.",
      });
    }
    // **Check Unique NRP**
    const existingNRP = await User.getUserByNRP(nrp)
    if (existingNRP) {
      return res.status(400).json({
        success: false,
        message: "NRP sudah terdaftar.",
      });
    }

    // **Hash Password**
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name: name,
      email: email,
      nrp: nrp,
      ...(imageUrl ? { image: imageUrl } : {}),
      jabatan: jabatan,
      password: hashedPassword,
      status: status,
      role: role,
      pangkat: pangkat,
    }

    // **Create User**
    const newUser = await User.createUser(data)

    return res.status(201).json({
      success: true,
      message: image ? "User berhasil dibuat." : "User berhasil dibuat, namun gambar gagal diunggah.",
      data: newUser,
    });

  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID wajib diisi.",
      });
    }

    const existingUser = await User.getUserById(id)
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    // Archive and Delete Attendance
    if (existingUser.attendance && existingUser.attendance.length > 0) {
      const attendArchive = await Archive.archiveAttendances(existingUser.attendance, req.user.id)
      if (!attendArchive) {
        return res.status(500).json({
          success: false,
          message: "Gagal mengarsipkan absensi.",
        })
      }
      await Attendance.deleteByUserId(id)
    }

    // Archive and Delete AttendanceRecap
    const recaps = await AttendanceRecap.getByUserId(id)
    if (recaps && recaps.length > 0) {
      const recapArchive = await Archive.archiveAttendanceRecaps(recaps, req.user.id)
      if (!recapArchive) {
        return res.status(500).json({
          success: false,
          message: "Gagal mengarsipkan recap absensi.",
        })
      }
      await AttendanceRecap.deleteByUserId(id)
    }

    // Archive User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attendance, ...userData } = existingUser
    const userArchive = await Archive.archiveUser(userData, req.user.id)
    if (!userArchive) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengarsipkan user.",
      })
    }

    await User.deleteUser(id)
    res.status(200).json({
      success: true,
      message: "User berhasil dihapus.",
    })
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const { name, email, nrp, jabatan, password, role, status, pangkat, userId } = req.body

    if (!id) throw new CustomError("Parameter id tidak lengkap", 400);

    const existingUser = await User.getUserById(id)
    if (!existingUser) throw new CustomError("Data User tidak ditemukan", 404);

    let imageUrl = existingUser.image;

    if (req.file) {
      imageUrl = getProccesedUrl(req.file);
      if (existingUser.image) {
        await deleteImageFromCloudinary(existingUser.image);
      }
    }

    const updatedUser = await User.updateUser(id, {
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      nrp: nrp ?? existingUser.nrp,
      jabatan: jabatan ?? existingUser.jabatan,
      password: password ?? existingUser.password,
      status: status ?? existingUser.status,
      pangkat: pangkat ?? existingUser.pangkat,
      role: role ?? existingUser.role,
      userId: userId ?? existingUser.id,
      image: imageUrl ?? "",
    })
    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui.",
      data: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}
