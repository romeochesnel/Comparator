import { Router } from 'express';
import * as historyRepo from '../../storage/historyRepo';
import * as trackerRepo from '../../storage/trackerRepo';
import { HttpError } from '../middleware/errorHandler';

export const historyRouter = Router();

historyRouter.get('/:trackerId', (req, res, next) => {
  const trackerId = Number(req.params.trackerId);
  if (!trackerRepo.findById(trackerId)) { next(new HttpError(404, 'Tracker not found')); return; }
  const limit = Number(req.query.limit) || 100;
  res.json(historyRepo.findByTrackerId(trackerId, limit));
});
