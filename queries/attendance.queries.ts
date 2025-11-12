import { prisma } from "../config/prisma"

class Attendance {
  getAllAttendance() {
    return prisma.attendance.findMany({
      include: {
        user: true
      }
    })
  }
}

export default new Attendance()