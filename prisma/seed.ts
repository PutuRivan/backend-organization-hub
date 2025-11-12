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

  await prisma.inventory.createMany({
    data: [
      {
        item_name: "Kursi Kantor Ergonomis",
        quantity: 10,
        quantity_description: "10 unit dalam kondisi baik",
        category: "Baik",
        location: "Ruang Kerja",
        description: "Kursi kantor dengan sandaran ergonomis yang mendukung postur tubuh.",
        image: "https://placehold.co/600x400/png",
        updated_by: admin.id,
      },
      {
        item_name: "Laptop Lenovo ThinkPad",
        quantity: 3,
        quantity_description: "2 unit berfungsi, 1 unit rusak",
        category: "Rusak",
        location: "Gudang IT",
        description: "Laptop untuk keperluan kerja staf IT dan administrasi.",
        image: "https://placehold.co/600x400/png",
        updated_by: admin.id,
      },
      {
        item_name: "Papan Tulis Putih",
        quantity: 4,
        quantity_description: "Semua dalam kondisi baik",
        category: "Baik",
        location: "Ruang Kelas A",
        description: "Papan tulis putih besar untuk presentasi dan kegiatan belajar.",
        image: "https://placehold.co/600x400/png",
        updated_by: admin.id,
      },
      {
        item_name: "Speaker Bluetooth JBL",
        quantity: 1,
        quantity_description: "1 unit hilang dari inventaris",
        category: "Hilang",
        location: "Ruang Acara",
        description: "Speaker portabel JBL untuk kegiatan acara kampus.",
        image: "https://placehold.co/600x400/png",
        updated_by: admin.id,
      },
    ],
  });


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
