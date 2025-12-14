import { EventVisibility } from "@prisma/client"
import { prisma } from "../config/prisma"

class Events {
  countAll(search?: string) {
    const where: any = {}
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }
    return prisma.events.count({ where })
  }

  getAllEvents(limit: number, offset: number, search?: string) {
    const where: any = {}
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }
    return prisma.events.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          }
        }
      }
    })
  }

  getEventByID(id: string) {
    return prisma.events.findUnique({
      where: {
        id: id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          }
        }
      }
    })
  }

  async createEvent(data: {
    name: string
    place: string
    leader: string
    category: string
    dress_code: string
    start_datetime: Date
    end_datetime: Date
    visibility: EventVisibility
    userId: string
  }) {
    return prisma.events.create({
      data: {
        name: data.name,
        place: data.place,
        leader: data.leader,
        category: data.category,
        dress_code: data.dress_code,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime,
        created_by: data.userId,
        visibility: data.visibility,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          }
        }
      }
    })
  }

  async updateEvent(
    id: string,
    data: {
      name?: string
      place?: string
      leader?: string
      category?: string
      dress_code?: string
      start_datetime?: Date
      end_datetime?: Date
    }
  ) {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.place !== undefined) updateData.place = data.place
    if (data.leader !== undefined) updateData.leader = data.leader
    if (data.category !== undefined) updateData.category = data.category
    if (data.dress_code !== undefined) updateData.dress_code = data.dress_code
    if (data.start_datetime !== undefined) updateData.start_datetime = data.start_datetime
    if (data.end_datetime !== undefined) updateData.end_datetime = data.end_datetime

    return prisma.events.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          }
        }
      }
    })
  }

  deleteEvent(id: string) {
    return prisma.events.delete({
      where: { id },
    })
  }

  getUpcomingEvents(limit: number = 5) {
    const now = new Date();
    return prisma.events.findMany({
      where: {
        start_datetime: {
          gte: now
        }
      },
      orderBy: {
        start_datetime: 'asc'
      },
      take: limit,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
  }
}

export default new Events()

