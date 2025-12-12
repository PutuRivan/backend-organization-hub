import { NextFunction, Request, Response } from "express";
import { Attendance, Events, Inventory, User } from "../queries";

export async function getDashboardData(req: Request, res: Response, next: NextFunction) {
  try {
    // Get date range for current day
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Get attendance statistics for current day
    const attendanceStats = await Attendance.getAttendanceStats(startOfDay, endOfDay);

    // Get upcoming events (next 5 events)
    const upcomingEvents = await Events.getUpcomingEvents(5);

    // Get inventory summary
    const inventorySummary = await Inventory.getInventorySummary();

    // Get total counts
    const totalPersonel = await User.countPersonel();
    const totalEvents = await Events.countAll();

    const data = {
      attendance: {
        ...attendanceStats,
        period: {
          start: startOfDay,
          end: endOfDay,
          month: now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
        }
      },
      upcomingEvents: upcomingEvents,
      inventory: inventorySummary,
      summary: {
        totalPersonel,
        totalEvents,
        totalInventoryItems: inventorySummary.totalItems,
        totalInventoryQuantity: inventorySummary.totalQuantity
      }
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function countAll(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.countAll()
    const inventory = await Inventory.countAll()
    const events = await Events.countAll()

    const data = {
      user,
      inventory,
      events
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}