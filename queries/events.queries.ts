import { prisma } from "../config/prisma"

class Events {
  countAll() {
    return prisma.events.count()
  }

  getAllEvents(limit: number, offset: number) {
    return prisma.events.findMany({
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
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
            position: true,
          }
        }
      }
    })
  }

  async createEvent(data: {
    title: string
    description: string
    location: string
    start_datetime: Date
    end_datetime: Date
    userId: string
  }) {
    return prisma.events.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime,
        created_by: data.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          }
        }
      }
    })
  }

  async updateEvent(
    id: string,
    data: {
      title?: string
      description?: string
      location?: string
      start_datetime?: Date
      end_datetime?: Date
    }
  ) {
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.location !== undefined) updateData.location = data.location
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
            position: true,
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
            position: true,
          }
        }
      }
    })
  }
}

export default new Events()

