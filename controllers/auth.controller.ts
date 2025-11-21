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
      role: dataUser.role,
      pangkat: dataUser.pangkat,
      jabatan: dataUser.jabatan,
      image: dataUser.image,
      nrp: dataUser.nrp,
      status: dataUser.status,
    }

    return res
      .cookie('access_token', token, { signed: true })
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

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.signedCookies['access_token'];
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token == undefined) {
      res.status(500).json({ token: 'undefined' });
    } else {
      const signature = jwt.verify(token, process.env.JWT_SECRET!);
      res.status(200).json({ dataToken: signature });
    }
    next();
  } catch (error) {
    res.status(403).json({
      message: 'Unauthorized',
    });
  }
};
