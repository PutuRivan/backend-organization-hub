import { Role, UserStatus } from "@prisma/client"
import { prisma } from "../config/prisma"

class User {

  countAll() {
    return prisma.users.count()
  }

  countPersonel() {
    return prisma.users.count({
      where: {
        role: "Personel"
      }
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

  getAllPersonel(limit: number, offset: number, startOfDay: Date, endOfDay: Date) {
    return prisma.users.findMany({
      where: {
        role: "Personel"
      },
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

  deleteUser(id: string) {
    return prisma.users.delete({
      where: {
        id: id
      }
    })
  }
}

export default new User()