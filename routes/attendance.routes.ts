import { getAllAttendance } from "../controllers/attendance.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get('/attendance', authorization(['Admin']), getAllAttendance)
}