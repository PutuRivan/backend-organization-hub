import { NextFunction, Request, Response } from "express";
import { Inventory } from "../queries";

export async function getAllInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await Inventory.getAllInventory()

    res.status(200).json({ Status: "Success", data: data })
  } catch (error) {
    next(error)
  }
}