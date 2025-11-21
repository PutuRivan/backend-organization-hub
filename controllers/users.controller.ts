import { NextFunction, Request, Response } from "express";
import { User } from "../queries";

export async function getAllUser(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const totalUser = await User.countAll()
    const totalPages = Math.ceil(totalUser / limit)

    const data = await User.getAllUser(limit, offset)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalUser,
        totalPages,
        currentPages: page,
        limit
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllPersonel(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const totalUser = await User.countAll()
    const totalPages = Math.ceil(totalUser / limit)

    const data = await User.getAllPersonel(limit, offset)

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalUser,
        totalPages,
        currentPages: page,
        limit
      }
    })
  } catch (error) {
    next(error)
  }
}