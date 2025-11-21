import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.events.deleteMany();
  await prisma.attendanceRecap.deleteMany();
  await prisma.users.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.users.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      nrp: "000001",
      password: hashedPassword,
      jabatan: "Admin Utama",
      pangkat: "Letnan Satu",
      role: "Admin",
      image: null, // opsional
      status: "Aktif",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
