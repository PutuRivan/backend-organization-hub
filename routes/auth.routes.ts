import { checkToken, Login } from "../controllers/auth.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.post('/login', authorization(['Guest']), Login)
  app.get('/check-token', authorization(['Guest', 'Admin', 'Personel']), checkToken);
}