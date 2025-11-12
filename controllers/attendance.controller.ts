import { NextFunction, Request, Response } from "express";
import { Attendance } from "../queries";

export async function getAllAttendance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Attendance.getAllAttendance()

    res.status(200).json({ success: true, data: data })
  } catch (error) {
    next(error)
  }
}