import { NextFunction, Request, Response } from "express";
import { Events, Archive } from "../queries";
import CustomError from "../handler/CustomError";

export async function getAllEvents(req: Request, res: Response, next: NextFunction) {
  try {
    // Get query params page and limit (default: page = 1, limit = 10)
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string
    const offset = (page - 1) * limit

    // Count total data for pagination
    const totalItems = await Events.countAll(search)
    const totalPages = Math.ceil(totalItems / limit)

    // Get data with pagination
    const data = await Events.getAllEvents(limit, offset, search)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getEventByID(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    if (!id) throw new CustomError("Parameter tidak lengkap", 400)

    const data = await Events.getEventByID(id)

    if (!data) throw new CustomError("Tidak ada data dengan id tersebut", 404)

    res.status(200).json({ success: true, data: data })
  } catch (error) {
    next(error)
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, place, leader, category, dress_code, start_date, end_date, visibility } = req.body;

    // Check required parameters
    if (!name || !place || !leader || !category || !dress_code || !start_date || !end_date) {
      throw new CustomError("Parameter tidak lengkap", 400);
    }

    // Validate datetime format
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new CustomError("Format tanggal tidak valid", 400);
    }

    // Validate that end_datetime is after start_datetime
    if (endDate <= startDate) {
      throw new CustomError("Tanggal selesai harus setelah tanggal mulai", 400);
    }

    const data = await Events.createEvent({
      name,
      place,
      leader,
      category,
      dress_code,
      start_datetime: startDate,
      end_datetime: endDate,
      userId: req.user.id,
      visibility,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, place, leader, category, dress_code, start_datetime, end_datetime } = req.body;

    if (!id) throw new CustomError("Parameter id tidak lengkap", 400);

    // Check if event exists
    const existingEvent = await Events.getEventByID(id);
    if (!existingEvent) throw new CustomError("Data event tidak ditemukan", 404);

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (place !== undefined) updateData.place = place;
    if (leader !== undefined) updateData.leader = leader;
    if (category !== undefined) updateData.category = category;
    if (dress_code !== undefined) updateData.dress_code = dress_code;

    // Validate and convert datetime if provided
    if (start_datetime !== undefined) {
      const startDate = new Date(start_datetime);
      if (isNaN(startDate.getTime())) {
        throw new CustomError("Format tanggal mulai tidak valid", 400);
      }
      updateData.start_datetime = startDate;
    }

    if (end_datetime !== undefined) {
      const endDate = new Date(end_datetime);
      if (isNaN(endDate.getTime())) {
        throw new CustomError("Format tanggal selesai tidak valid", 400);
      }
      updateData.end_datetime = endDate;
    }

    // Validate that end_datetime is after start_datetime if both are provided
    if (updateData.start_datetime && updateData.end_datetime) {
      if (updateData.end_datetime <= updateData.start_datetime) {
        throw new CustomError("Tanggal selesai harus setelah tanggal mulai", 400);
      }
    }

    // Update data in database
    const updatedData = await Events.updateEvent(id, updateData);
    console.log(updateData)
    if (!updatedData) throw new CustomError("Gagal memperbarui event", 500)

    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    if (!id) throw new CustomError("Parameter id tidak lengkap", 400)

    // Check if event exists
    const existingEvent = await Events.getEventByID(id);
    if (!existingEvent) throw new CustomError("Data event tidak ditemukan", 404);

    // Archive the event
    const archivedEvent = await Archive.archiveEvent(existingEvent, req.user.id)

    if (!archivedEvent) throw new CustomError("Gagal mengarsipkan event", 500)

    // Delete the event
    const data = await Events.deleteEvent(id)

    res.status(200).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
