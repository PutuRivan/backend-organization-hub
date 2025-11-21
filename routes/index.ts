import errorHandler from "../handler/errorHandler";
import attendanceRoutes from "./attendance.routes";
import authRoutes from "./auth.routes";
import inventoryRoutes from "./inventory.routes";
import usersRoutes from "./users.routes";
import eventsRoutes from "./events.routes";
import countRoutes from "./count.routes";

export default function routes(app: any) {
  authRoutes(app)
  attendanceRoutes(app)
  inventoryRoutes(app)
  usersRoutes(app)
  eventsRoutes(app)
  countRoutes(app)
  app.use(errorHandler)
}