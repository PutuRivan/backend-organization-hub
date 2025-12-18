import { createUser, deleteUser, getAllPersonel, getAllUser, getUserById, updateUser } from "../controllers/users.controller";
import authorization from "../middlewares/authorization";
import { createUpload } from "../services/upload";

const userUpload = createUpload('siRotekinfo/users')

export default function (app: any) {
  app.get("/users", authorization(['Admin']), getAllUser)
  app.get("/users/personel", authorization(['Admin']), getAllPersonel)
  app.get("/user/personel/:id", authorization(['Admin']), getUserById)
  app.post("/user", authorization(['Admin']), userUpload.single('image'), createUser)
  app.put("/user/:id", authorization(['Admin']), userUpload.single('image'), updateUser)
  app.delete("/user/:id", authorization(['Admin']), deleteUser)
}