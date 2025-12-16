import { createEvent, deleteEvent, getAllEvents, getEventByID, updateEvent } from "../controllers/events.controller";
import authorization from "../middlewares/authorization";

export default function (app: any) {
  app.get('/events', authorization(['Admin', 'Personel']), getAllEvents)
  app.get('/events/:id', authorization(['Admin', 'Personel']), getEventByID)
  app.post('/events', authorization(['Admin', 'Personel']), createEvent)
  app.put('/events/:id', authorization(['Admin', 'Personel']), updateEvent)
  app.delete('/events/:id', authorization(['Admin', 'Personel']), deleteEvent)
}
