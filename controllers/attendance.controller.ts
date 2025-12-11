import { AttendanceStatus, AttendanceAbsentReason } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import CustomError from "../handler/CustomError";
import { Attendance } from "../queries";

export async function getAllAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Attendance.getAllAttendance()

    res.status(200).json({ success: true, data: data })
  } catch (error) {
    next(error)
  }
}

export async function getTodayAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const authenticatedUserId = req.user?.id

    if (!authenticatedUserId) {
      throw new CustomError("User tidak ditemukan pada token", 401)
    }

    const now = new Date()
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(now)
    dayEnd.setHours(23, 59, 59, 999)

    const todayAttendance = await Attendance.getAttendanceByUserAndDate(authenticatedUserId, dayStart, dayEnd)

    if (!todayAttendance) {
      return res.status(404).json({
        success: false,
        message: "Absensi hari ini tidak ditemukan",
        data: null
      })
    }

    res.status(200).json({
      success: true,
      data: todayAttendance
    })
  } catch (error) {
    next(error)
  }
}

export async function createAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const authenticatedUserId = req.user?.id
    const targetUserId = req.body.userId || authenticatedUserId

    if (!targetUserId) {
      throw new CustomError("User tidak ditemukan pada token atau body", 400)
    }

    const { status, note, absentReason } = req.body
    let normalizedStatus: AttendanceStatus | undefined = undefined
    let normalizedAbsentReason: AttendanceAbsentReason | undefined = undefined

    if (status) {
      if (!Object.values(AttendanceStatus).includes(status)) {
        throw new CustomError("Status absensi tidak valid", 400)
      }
      normalizedStatus = status as AttendanceStatus
    }

    if (absentReason) {
      if (!Object.values(AttendanceAbsentReason).includes(absentReason)) {
        throw new CustomError("Alasan ketidakhadiran tidak valid", 400)
      }
      normalizedAbsentReason = absentReason as AttendanceAbsentReason
    }

    const now = new Date()
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(now)
    dayEnd.setHours(23, 59, 59, 999)

    const existingAttendance = await Attendance.getAttendanceByUserAndDate(
      targetUserId,
      dayStart,
      dayEnd
    )

    // === ABSENSI MASUK ===
    if (!existingAttendance) {
      const createData: any = {
        userId: targetUserId,
        date: now,
        timeIn: now,
        status: normalizedStatus ?? AttendanceStatus.Hadir,
      }

      if (normalizedAbsentReason) createData.absentReason = normalizedAbsentReason
      if (note) createData.note = note

      const createdAttendance = await Attendance.createAttendance(createData)

      return res.status(201).json({
        success: true,
        message: "Berhasil melakukan absensi masuk",
        data: createdAttendance,
      })
    }

    // === ABSENSI PULANG ===
    if (existingAttendance.time_out) {
      throw new CustomError("Anda sudah menyelesaikan absensi hari ini", 400)
    }

    const updateData: any = {
      timeOut: now,
      status: normalizedStatus ?? existingAttendance.status,
    }

    if (normalizedAbsentReason) updateData.absentReason = normalizedAbsentReason
    if (note) updateData.note = note

    const updatedAttendance = await Attendance.checkoutAttendance(
      existingAttendance.id,
      updateData
    )

    res.status(200).json({
      success: true,
      message: "Berhasil melakukan absensi pulang",
      data: updatedAttendance,
    })
  } catch (error) {
    next(error)
  }
}

export async function getPersonelAttendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, date, name, page = 1, limit = 5 } = req.query;

    let parsedDate: Date | undefined;

    if (date) {
      const dateParts = (date as string).split("-").map(Number);

      if (dateParts.length !== 3) {
        throw new CustomError("Format tanggal tidak valid. Gunakan format YYYY-MM-DD", 400);
      }

      const [y, m, d] = dateParts;

      // Type guard to ensure all parts are defined
      if (y === undefined || m === undefined || d === undefined) {
        throw new CustomError("Format tanggal tidak valid. Gunakan format YYYY-MM-DD", 400);
      }

      parsedDate = new Date(y, m - 1, d);
      parsedDate.setHours(0, 0, 0, 0);
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      status &&
      !Object.values(AttendanceStatus).includes(status as AttendanceStatus)
    ) {
      throw new CustomError("Status absensi tidak valid", 400);
    }

    const { data, totalData } =
      await Attendance.getAttendanceByPersonel(
        parsedDate, // ✅ FIXED
        name as string | undefined,
        pageNumber,
        limitNumber,
        status as AttendanceStatus | undefined
      );

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalData,
        totalPages: Math.ceil(totalData / limitNumber),
      },
      data,
    });
  } catch (error) {
    next(error);
  }
}