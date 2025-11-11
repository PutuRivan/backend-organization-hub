import { prisma } from "../config/prisma"

class User {
  getAllUser() {
    return prisma.users.findMany({
      include: {
        attendance: true,
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