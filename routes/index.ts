import errorHandler from "../handler/errorHandler";
import attendanceRoutes from "./attendance.routes";
import authRoutes from "./auth.routes";
import inventoryRoutes from "./inventory.routes";

export default function routes(app: any) {
  authRoutes(app)
  attendanceRoutes(app)
  inventoryRoutes(app)
  app.use(errorHandler)
}