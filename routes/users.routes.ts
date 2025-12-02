import { createUser, deleteUser, getAllPersonel, getAllUser, getUserById } from "../controllers/users.controller";
import authorization from "../middlewares/authorization";
import { upload } from "../services/upload";

export default function (app: any) {
  app.get("/users", authorization(['Admin']), getAllUser)
  app.get("/users/personel", authorization(['Admin']), getAllPersonel)
  app.get("/user/personel/:id", authorization(['Admin']), getUserById)
  app.post("/user", authorization(['Admin']), upload.single('image'), createUser)
  app.delete("/user/:id", authorization(['Admin']), deleteUser)
}