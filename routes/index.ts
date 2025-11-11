import errorHandler from "../handler/errorHandler";
import authRoutes from "./auth.routes";

export default function routes(app: any) {
  authRoutes(app)
  app.use(errorHandler)
}