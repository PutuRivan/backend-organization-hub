import { countAll, getDashboardData } from "../controllers/count.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get('/dashboard', authorization(['Admin', 'Personel']), getDashboardData)
  app.get('/count', authorization(['Admin']), countAll)
}