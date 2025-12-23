import { Role, UserStatus } from "@prisma/client"
import { prisma } from "../config/prisma"

class User {

  countAll() {
    return prisma.users.count()
  }

  countPersonel(filters?: { name?: string, jabatan?: string, status?: string }) {
    const where: any = {
      role: "Personel"
    }

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      }
    }

    if (filters?.jabatan) {
      where.jabatan = {
        contains: filters.jabatan,
        mode: 'insensitive'
      }
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return prisma.users.count({
      where
    })
  }

  getAllUser(limit: number, offset: number) {
    return prisma.users.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        attendance: true,
      }
    })
  }

  getAllPersonel(limit: number, offset: number, startOfDay: Date, endOfDay: Date, filters?: { name?: string, jabatan?: string, status?: string }) {
    const where: any = {
      role: "Personel"
    }

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive'
      }
    }

    if (filters?.jabatan) {
      where.jabatan = {
        contains: filters.jabatan,
        mode: 'insensitive'
      }
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return prisma.users.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        created_at: "desc"
      },
      include: {
        attendance: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }
      }
    })
  }

  getUserById(id: string) {
    return prisma.users.findUnique({
      where: {
        id: id
      },
      include: {
        attendance: true,
      }
    })
  }

  getUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: {
        email: email
      },
      include: {
        attendance: true,
      }
    })
  }

  getUserByNRP(nrp: string) {
    return prisma.users.findUnique({
      where: {
        nrp: nrp
      },
      include: {
        attendance: true
      }
    })
  }

  createUser(data: {
    name: string,
    email: string,
    nrp: string
    image?: string
    jabatan: string
    password: string
    status: UserStatus
    role: Role
    pangkat: string
  }) {
    return prisma.users.create({
      data
    })
  }

  updateUser(id: string, data: {
    name?: string,
    email?: string,
    nrp?: string
    image?: string
    jabatan?: string
    password?: string
    status?: UserStatus
    role?: Role
    pangkat?: string
    userId?: string
  }) {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.nrp !== undefined) updateData.nrp = data.nrp
    if (data.image !== undefined) updateData.image = data.image
    if (data.jabatan !== undefined) updateData.jabatan = data.jabatan
    if (data.password !== undefined) updateData.password = data.password
    if (data.status !== undefined) updateData.status = data.status
    if (data.role !== undefined) updateData.role = data.role
    if (data.pangkat !== undefined) updateData.pangkat = data.pangkat

    return prisma.users.update({
      where: {
        id: id
      },
      data: updateData
    })
  }

  deleteUser(id: string) {
    return prisma.users.delete({
      where: {
        id: id
      }
    })
  }
}

export default new User()