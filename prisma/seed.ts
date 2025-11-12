// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Hapus data lama agar tidak duplikat (opsional)
  await prisma.users.deleteMany()
  await prisma.events.deleteMany()
  await prisma.attendanceRecap.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.inventory.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)
  const admin = await prisma.users.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      position: "Admin"
    },
  })

  const personel = await prisma.users.create({
    data: {
      name: 'Personel',
      email: 'Personel@example.com',
      password: hashedPassword,
      role: 'Personel',
      position: "Personel"
    },
  })


}

main()
  .then(async () => {
    console.log('✅ Seeding completed.')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
