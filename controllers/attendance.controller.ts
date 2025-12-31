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
    const authenticatedUserId = req.params?.userId

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
    // const authenticatedUserId = req.user?.id
    // const targetUserId = req.body.userId || authenticatedUserId

    let targetUserId = ""

    if (req.body?.userId) {
      targetUserId = req.body.userId!
    } else if (req.user?.id) {
      targetUserId = req.user.id!
    }

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
    console.log(absentReason)
    if (absentReason) {
      if (!Object.values(AttendanceAbsentReason).includes(absentReason)) {
        throw new CustomError("Alasan ketidakhadiran tidak valid", 400)
      }
      normalizedAbsentReason = absentReason as AttendanceAbsentReason
    }

    if (normalizedStatus === AttendanceStatus.Kurang && !normalizedAbsentReason) {
      throw new CustomError("Wajib memberikan alasan ketidakhadiran (Dinas, DIK, Izin, Cuti, Sakit, Hamil, BKO, TK, Terlambat) jika status absensi 'Kurang'", 400)
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

    // Check if attendance already exists for today
    if (existingAttendance) {
      throw new CustomError("Anda sudah melakukan absensi hari ini", 400)
    }

    // Create new attendance
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
      message: "Berhasil melakukan absensi",
      data: createdAttendance,
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
    const { status, date, name, page = 1, limit = 5, division } = req.query;

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

    let filterStatus: AttendanceStatus | undefined;
    let filterAbsentReason: AttendanceAbsentReason | undefined;
    let filterDivision: string | undefined;
    let filterName: string | undefined;

    if (status) {
      const statusString = status as string;
      if (
        Object.values(AttendanceStatus).includes(statusString as AttendanceStatus)
      ) {
        filterStatus = statusString as AttendanceStatus;
      } else if (
        Object.values(AttendanceAbsentReason).includes(
          statusString as AttendanceAbsentReason
        )
      ) {
        filterAbsentReason = statusString as AttendanceAbsentReason;
      } else {
        throw new CustomError(
          "Status atau alasan ketidakhadiran tidak valid",
          400
        );
      }
    }

    if (division) {
      filterDivision = division as string;
    }

    if (name) {
      filterName = name as string;
    }

    const { data, totalData } = await Attendance.getAttendanceByPersonel(
      parsedDate,
      filterName,
      pageNumber,
      limitNumber,
      filterStatus,
      filterAbsentReason,
      filterDivision
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