import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
function authorization(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      let token: string | undefined = '';
      let user: any = { role: 'Guest' };
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
        if (token !== null && token !== undefined && token !== '') {
          user = jwt.verify(token, process.env.JWT_SECRET!);
          req.user = user;
        } else {
          user = { role: 'Guest' };
        }

      }
      if (!roles.includes(user.role)) {
        throw new Error('You are not authorized with this token');
      }
      next();
    } catch (error: any) {
      res.status(401).json({ message: 'Authorization failed', error: error.message });
    }
  };
}

export default authorization;