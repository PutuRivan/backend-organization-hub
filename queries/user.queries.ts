import { prisma } from "../config/prisma"

class User {

  countAll() {
    return prisma.users.count()
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

  getAllPersonel(limit: number, offset: number) {
    return prisma.users.findMany({
      where: {
        role: "Personel"
      },
      skip: offset,
      take: limit,
      orderBy: {
        created_at: "desc"
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
}

export default new User()