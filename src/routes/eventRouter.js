import { Router } from 'express';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByUserId,
  getEventsNearToLocation,
  searchEvents,
} from '../controllers/eventController.js';
import { authGuard } from '../middleware/index.js';

const eventRouter = Router();

eventRouter.post('', authGuard, createEvent);
eventRouter.get('/search', searchEvents);
eventRouter.get('/search/all', getAllEvents);
eventRouter.get('/search/event/:eventId', getEventById);
eventRouter.get('/search/users', authGuard, getEventsByUserId);
eventRouter.get('/search/locations', getEventsNearToLocation);
eventRouter.post('/:eventId', authGuard, updateEvent);
eventRouter.delete('/:eventId', authGuard, deleteEvent);

export { eventRouter };
