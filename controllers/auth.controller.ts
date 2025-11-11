import { NextFunction, Request, Response } from "express";
import CustomError from "../handler/CustomError";
import { User } from "../queries";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    const dataUser = await User.getUserByEmail(email)
    if (!dataUser) throw new CustomError("Email Tidak Ditemukan", 404)

    const match = await bcrypt.compare(password, dataUser.password)
    if (!match) throw new CustomError("Password Tidak Valid", 401)

    const token = jwt.sign({ id: dataUser.id, role: dataUser.role, email: dataUser.email }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    const userDataMapper = {
      id: dataUser.id,
      name: dataUser.name,
      email: dataUser.email,
      role: dataUser.role
    }

    return res
      .cookie('token', token, { signed: true })
      .status(200)
      .json({
        success: true,
        token: token,
        data: userDataMapper,
      })
  } catch (error) {
    next(error)
  }
}