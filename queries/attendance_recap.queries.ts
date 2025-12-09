import { prisma } from "../config/prisma"

class AttendanceRecap {
  getByUserId(userId: string) {
    return prisma.attendanceRecap.findMany({
      where: { user_id: userId }
    })
  }

  deleteByUserId(userId: string) {
    return prisma.attendanceRecap.deleteMany({
      where: { user_id: userId }
    })
  }
}

export default new AttendanceRecap()
