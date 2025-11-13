import { createInventory, getAllInventory, getInventoryByID, updateInventory } from "../controllers/inventory.controller";
import authorization from "../middlewares/authorization";
import { upload } from "../services/upload";

export default function (app: any) {
  app.get('/inventory', authorization(['Admin']), getAllInventory)
  app.get('/inventory/:id', authorization(['Admin']), getInventoryByID)
  app.post('/inventory', authorization(['Admin']), upload.single("image"), createInventory)
  app.put('/inventory/:id', authorization(['Admin']), upload.single("image"), updateInventory)
}