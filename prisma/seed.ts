import { PrismaClient, ItemCondition } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const atkDataPath = path.join(__dirname, "data", "atk.json");
const atkData = JSON.parse(fs.readFileSync(atkDataPath, "utf-8"));

const userDataPath = path.join(__dirname, "data", "user.json");
const userData = JSON.parse(fs.readFileSync(userDataPath, "utf-8"));

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.events.deleteMany();
  await prisma.attendanceRecap.deleteMany();
  await prisma.users.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Seeding Users...")

  const usersData = userData.map((user: any) => ({
    name: user.name,
    email: user.email,
    password: hashedPassword,
    role: user.role,
    image: user.image,
    jabatan: user.jabatan,
    nrp: user.nrp.toString(),
    pangkat: user.pangkat,
    status: user.status,
    division: user.division,
  }));

  await prisma.users.createMany({
    data: usersData,
  });

  const adminUser = await prisma.users.create({
    data: {
      name: "Admin",
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

  await prisma.users.create({
    data: {
      name: "User",
      email: "user@example.com",
      nrp: "000002",
      password: hashedPassword,
      jabatan: "Personel",
      pangkat: "Bripda",
      role: "Personel",
      image: null, // opsional
      status: "Aktif",
    },
  });

  console.log("Seeding inventory...");

  const inventoryData = atkData.map((item: any) => ({
    item_name: item.item_name,
    quantity: item.quantity,
    quantity_description: item.quantity_description,
    category: ItemCondition.Baik, // Default value as it references ItemCondition enum
    location: item.location,
    description: item.description === "#N/A" ? null : item.description,
    image: item.image === "#N/A" ? null : item.image,
    updated_by: adminUser.id,
  }));

  // Using createMany for better performance
  await prisma.inventory.createMany({
    data: inventoryData,
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
