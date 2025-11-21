import { prisma } from "../config/prisma"

class Inventory {
  countAll() {
    return prisma.inventory.count()
  }

  getAllInventory(limit: number, offset: number) {
    return prisma.inventory.findMany({
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
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

  async updateInventory(
    id: string,
    data: {
      name?: string
      quantity?: number
      quantity_description?: string
      category?: string
      location?: string
      description?: string
      image?: string
      userId?: string
    }
  ) {
    // Bentuk objek sementara untuk update
    const updateData: any = {}

    if (data.name !== undefined) updateData.item_name = data.name
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.quantity_description !== undefined) updateData.quantity_description = data.quantity_description
    if (data.category !== undefined) updateData.category = data.category as any
    if (data.location !== undefined) updateData.location = data.location
    if (data.description !== undefined) updateData.description = data.description
    if (data.image !== undefined) updateData.image = data.image
    if (data.userId !== undefined) updateData.updated_by = data.userId

    if (data.userId && data.userId.trim() !== "") {
      updateData.updated_by = data.userId;
    }
    return prisma.inventory.update({
      where: { id },
      data: updateData,
    })
  }

  deleteInventory(id: string) {
    return prisma.inventory.delete({
      where: { id },
    })
  }

  async getInventorySummary() {
    const total = await prisma.inventory.count();

    const baik = await prisma.inventory.count({
      where: { category: "Baik" }
    });

    const rusak = await prisma.inventory.count({
      where: { category: "Rusak" }
    });

    const hilang = await prisma.inventory.count({
      where: { category: "Hilang" }
    });

    const totalQuantity = await prisma.inventory.aggregate({
      _sum: {
        quantity: true
      }
    });

    return {
      totalItems: total,
      totalQuantity: totalQuantity._sum.quantity || 0,
      baik,
      rusak,
      hilang,
      baikPercentage: total > 0 ? Math.round((baik / total) * 100) : 0,
      rusakPercentage: total > 0 ? Math.round((rusak / total) * 100) : 0,
      hilangPercentage: total > 0 ? Math.round((hilang / total) * 100) : 0,
    };
  }
}

export default new Inventory()