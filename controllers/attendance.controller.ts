import { AttendanceStatus } from "@prisma/client";
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

export async function createAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const authenticatedUserId = req.user?.id
    const targetUserId = req.body.userId || authenticatedUserId

    if (!targetUserId) {
      throw new CustomError("User tidak ditemukan pada token atau body", 400)
    }

    const { status, note } = req.body
    let normalizedStatus: AttendanceStatus | undefined = undefined

    if (status) {
      if (!Object.values(AttendanceStatus).includes(status)) {
        throw new CustomError("Status absensi tidak valid", 400)
      }
      normalizedStatus = status as AttendanceStatus
    }

    const now = new Date()
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(now)
    dayEnd.setHours(23, 59, 59, 999)

    const existingAttendance = await Attendance.getAttendanceByUserAndDate(targetUserId, dayStart, dayEnd)

    if (!existingAttendance) {
      const createdAttendance = await Attendance.createAttendance({
        userId: targetUserId,
        date: now,
        timeIn: now,
        status: normalizedStatus ?? AttendanceStatus.Hadir,
        note
      })

      res.status(201).json({
        success: true,
        message: "Berhasil melakukan absensi masuk",
        data: createdAttendance
      })
      return
    }

    if (existingAttendance.time_out) {
      throw new CustomError("Anda sudah menyelesaikan absensi hari ini", 400)
    }

    const updatedAttendance = await Attendance.checkoutAttendance(existingAttendance.id, {
      timeOut: now,
      status: normalizedStatus ?? existingAttendance.status,
      note: note ?? existingAttendance.note ?? undefined
    })

    res.status(200).json({
      success: true,
      message: "Berhasil melakukan absensi pulang",
      data: updatedAttendance
    })
  } catch (error) {
    next(error)
  }
}