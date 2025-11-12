import path from "path"
import { prisma } from "../config/prisma"
import fs from "fs"

class Inventory {
  getAllInventory() {
    return prisma.inventory.findMany({
      include: {
        updatedBy: true
      }
    })
  }

  getInventoryByID(id: string) {
    return prisma.inventory.findUnique({
      where: {
        id: id
      }
    })
  }

  async createInventory(data: {
    name: string
    quantity: number
    quantity_description: string
    category: string
    location: string
    description: string
    image: string
    userId: string
  }) {
    return prisma.inventory.create({
      data: {
        item_name: data.name,
        quantity: data.quantity,
        quantity_description: data.quantity_description,
        category: data.category as any,
        location: data.location,
        description: data.description,
        image: data.image,
        updated_by: data.userId,
      },
    })
  }

}

export default new Inventory()