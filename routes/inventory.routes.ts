import { createInventory, deleteInventory, getAllInventory, getInventoryByID, updateInventory } from "../controllers/inventory.controller";
import authorization from "../middlewares/authorization";
import { createUpload } from "../services/upload";

// Membuat upload instance khusus untuk inventory dengan folder "inventory"
const inventoryUpload = createUpload("siRotekinfo/inventory");

export default function (app: any) {
  app.get('/inventory', authorization(['Admin', 'Personel']), getAllInventory)
  app.get('/inventory/:id', authorization(['Admin', 'Personel']), getInventoryByID)
  app.post('/inventory', authorization(['Admin', 'Personel']), inventoryUpload.single("image"), createInventory)
  app.put('/inventory/:id', authorization(['Admin', 'Personel']), inventoryUpload.single("image"), updateInventory)
  app.delete('/inventory/:id', authorization(['Admin', 'Personel']), deleteInventory)
}