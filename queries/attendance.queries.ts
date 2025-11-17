import { AttendanceStatus } from "@prisma/client"
import { prisma } from "../config/prisma"

class Attendance {
  getAllAttendance() {
    return prisma.attendance.findMany({
      include: {
        user: true
      }
    })
  }

  getAttendanceByUserAndDate(userId: string, dayStart: Date, dayEnd: Date) {
    return prisma.attendance.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
  }

  createAttendance(data: { userId: string, date: Date, timeIn: Date, status: AttendanceStatus, note?: string }) {
    return prisma.attendance.create({
      data: {
        user_id: data.userId,
        date: data.date,
        time_in: data.timeIn,
        status: data.status,
        note: data.note ?? null
      }
    })
  }

  checkoutAttendance(id: string, data: { timeOut: Date, status?: AttendanceStatus, note?: string }) {
    return prisma.attendance.update({
      where: { id },
      data: {
        time_out: data.timeOut,
        ...(data.status ? { status: data.status } : {}),
        ...(data.note !== undefined ? { note: data.note ?? null } : {})
      }
    })
  }
}

export default new Attendance()