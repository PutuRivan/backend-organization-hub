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

  getAttendanceByPersonel(
    startDate?: Date,
    name?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {
      user: {
        role: "Personel",
      },
    };

    if (name) {
      where.user = {
        ...where.user,
        name: {
          contains: name,
          mode: "insensitive",
        },
      };
    }

    if (startDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
    }

    const skip = (page - 1) * limit;

    const countPromise = prisma.attendance.count({ where });

    const dataPromise = prisma.attendance.findMany({
      where,
      include: { user: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    });

    return Promise.all([countPromise, dataPromise]).then(([totalData, data]) => ({
      totalData,
      data,
    }));
  }
}

export default new Attendance()