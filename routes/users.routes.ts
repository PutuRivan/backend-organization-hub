import { createUser, getAllPersonel, getAllUser } from "../controllers/users.controller";
import authorization from "../middlewares/authorization";
import { upload } from "../services/upload";

export default function (app: any) {
  app.get("/users", authorization(['Admin']), getAllUser)
  app.get("/users/personel", authorization(['Admin']), getAllPersonel)
  app.post("/user", authorization(['Admin']), upload.single('image'), createUser)
}