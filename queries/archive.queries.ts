import { prisma } from "../config/prisma"

class Archive {
  createMany(data: { original_id: string, table_name: string, data: any, deleted_by?: string }[]) {
    return prisma.archive.createMany({
      data
    })
  }

  create(data: { original_id: string, table_name: string, data: any, deleted_by?: string }) {
    return prisma.archive.create({
      data
    })
  }
}

export default new Archive()
