import { AttendanceStatus, AttendanceAbsentReason } from "@prisma/client"
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

  createAttendance(data: {
    userId: string
    date: Date
    timeIn?: Date
    status: AttendanceStatus
    absentReason?: AttendanceAbsentReason
    note?: string
  }) {
    return prisma.attendance.create({
      data: {
        user_id: data.userId,
        date: data.date,
        time_in: data.timeIn ?? null,
        status: data.status,
        ...(data.absentReason && { AbsentReason: data.absentReason }),
        ...(data.note && { note: data.note })
      }
    })
  }



  getAttendanceByPersonel(
    date?: Date,
    name?: string,
    page: number = 1,
    limit: number = 10,
    status?: AttendanceStatus,
    absentReason?: AttendanceAbsentReason,
    division?: string
  ) {
    const where: any = {
      user: {
        role: "Personel",
      },
    };

    if (status) {
      where.status = status;
    }

    if (absentReason) {
      where.AbsentReason = absentReason;
    }

    if (name) {
      where.user = {
        ...where.user,
        name: {
          contains: name,
          mode: "insensitive",
        },
      };
    }

    if (division) {
      where.user = {
        ...where.user,
        division: division
      }
    }

    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      where.date = {
        gte: date,
        lt: nextDay, // ✅ PENTING
      };
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

  async getAttendanceStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const total = await prisma.attendance.count({ where });

    const hadir = await prisma.attendance.count({
      where: { ...where, status: "Hadir" }
    });

    // Absent Reasons
    const dinas = await prisma.attendance.count({ where: { ...where, AbsentReason: "Dinas" } });
    const dik = await prisma.attendance.count({ where: { ...where, AbsentReason: "DIK" } });
    const izin = await prisma.attendance.count({ where: { ...where, AbsentReason: "Izin" } });
    const cuti = await prisma.attendance.count({ where: { ...where, AbsentReason: "Cuti" } });
    const sakit = await prisma.attendance.count({ where: { ...where, AbsentReason: "Sakit" } });
    const hamil = await prisma.attendance.count({ where: { ...where, AbsentReason: "Hamil" } });
    const bko = await prisma.attendance.count({ where: { ...where, AbsentReason: "BKO" } });
    const tk = await prisma.attendance.count({ where: { ...where, AbsentReason: "TK" } });
    const terlambat = await prisma.attendance.count({ where: { ...where, AbsentReason: "Terlambat" } });

    return {
      total,
      hadir,
      hadirPercentage: total > 0 ? Math.round((hadir / total) * 100) : 0,
      Kurang: {
        dinas,
        dik,
        izin,
        cuti,
        sakit,
        hamil,
        bko,
        tk,
        terlambat,
        dinasPercentage: total > 0 ? Math.round((dinas / total) * 100) : 0,
        dikPercentage: total > 0 ? Math.round((dik / total) * 100) : 0,
        izinPercentage: total > 0 ? Math.round((izin / total) * 100) : 0,
        cutiPercentage: total > 0 ? Math.round((cuti / total) * 100) : 0,
        sakitPercentage: total > 0 ? Math.round((sakit / total) * 100) : 0,
        hamilPercentage: total > 0 ? Math.round((hamil / total) * 100) : 0,
        bkoPercentage: total > 0 ? Math.round((bko / total) * 100) : 0,
        tkPercentage: total > 0 ? Math.round((tk / total) * 100) : 0,
        terlambatPercentage: total > 0 ? Math.round((terlambat / total) * 100) : 0,
      }
    };
  }

  deleteByUserId(userId: string) {
    return prisma.attendance.deleteMany({
      where: { user_id: userId }
    })
  }
}

export default new Attendance()