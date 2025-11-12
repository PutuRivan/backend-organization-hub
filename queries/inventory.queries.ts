import { prisma } from "../config/prisma"

class Inventory {
  getAllInventory() {
    return prisma.inventory.findMany({
      include: {
        updatedBy: true
      }
    })
  }
}

export default new Inventory()