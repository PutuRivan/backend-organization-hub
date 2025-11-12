import { getAllAttendance } from "../controllers/attendance.controller";
import { getAllInventory } from "../controllers/inventory.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get('/inventory', authorization(['Admin']), getAllInventory)
}