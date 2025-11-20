import { createAttendance, getAllAttendance, getTodayAttendance, getPersonelAttendance } from "../controllers/attendance.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get('/attendance', authorization(['Admin']), getAllAttendance)
  app.get('/attendance/today', authorization(['Admin', 'Personel']), getTodayAttendance)
  app.get('/attendance/personel', authorization(['Admin']), getPersonelAttendance)
  app.post('/attendance', authorization(['Admin', 'Personel']), createAttendance)
}