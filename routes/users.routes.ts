import { getAllPersonel, getAllUser } from "../controllers/users.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get("/users", authorization(['Admin']), getAllUser)
  app.get("/users/personel", authorization(['Admin']), getAllPersonel)
}