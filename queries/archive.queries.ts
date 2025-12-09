import { prisma } from "../config/prisma"

class Archive {
  async createMany(data: { original_id: string, table_name: string, data: any, deleted_by?: string }[]) {
    return prisma.archive.createMany({
      data
    })
  }

  async create(data: { original_id: string, table_name: string, data: any, deleted_by?: string }) {
    return prisma.archive.create({
      data
    })
  }

  async archiveAttendances(attendances: any[], deletedBy: string) {
    if (attendances.length === 0) return
    const data = attendances.map((a) => ({
      original_id: a.id,
      table_name: "Attendance",
      data: a,
      deleted_by: deletedBy,
    }))
    return this.createMany(data)
  }

  async archiveAttendanceRecaps(recaps: any[], deletedBy: string) {
    if (recaps.length === 0) return
    const data = recaps.map((r) => ({
      original_id: r.id,
      table_name: "AttendanceRecap",
      data: r,
      deleted_by: deletedBy,
    }))
    return this.createMany(data)
  }

  async archiveUser(user: any, deletedBy: string) {
    return this.create({
      original_id: user.id,
      table_name: "Users",
      data: user,
      deleted_by: deletedBy,
    })
  }
}

export default new Archive()
