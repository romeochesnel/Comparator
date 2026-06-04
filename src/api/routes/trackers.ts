import { Router, Request, Response, NextFunction } from 'express';
import * as trackerRepo from '../../storage/trackerRepo';
import * as historyRepo from '../../storage/historyRepo';
import { scheduleTracker, stopTracker } from '../../scheduler';
import { checkUrl } from '../../scraper/extractor';
import { HttpError } from '../middleware/errorHandler';
import { CreateTrackerDto } from '../../types';

export const trackersRouter = Router();

trackersRouter.get('/', (_req, res) => {
  const trackers = trackerRepo.findAll();
  res.json(trackers.map(t => ({ ...t, latest: historyRepo.findLatestByTrackerId(t.id) })));
});

trackersRouter.get('/:id', (req, res, next) => {
  const tracker = trackerRepo.findById(Number(req.params.id));
  if (!tracker) { next(new HttpError(404, 'Tracker not found')); return; }
  res.json(tracker);
});

trackersRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as CreateTrackerDto;
    if (!dto.name || !dto.url || !dto.selector) {
      res.status(400).json({ error: 'name, url and selector are required' });
      return;
    }
    const tracker = trackerRepo.create(dto);
    const result = await checkUrl(tracker.url, tracker.selector, tracker.jsRender);
    historyRepo.insert(tracker.id, result);
    scheduleTracker(tracker);
    res.status(201).json(tracker);
  } catch (err) { next(err); }
});

trackersRouter.patch('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const tracker = trackerRepo.update(id, req.body);
    if (!tracker) { next(new HttpError(404, 'Tracker not found')); return; }
    tracker.active ? scheduleTracker(tracker) : stopTracker(id);
    res.json(tracker);
  } catch (err) { next(err); }
});

trackersRouter.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    stopTracker(id);
    if (!trackerRepo.remove(id)) { next(new HttpError(404, 'Tracker not found')); return; }
    res.status(204).end();
  } catch (err) { next(err); }
});

trackersRouter.post('/:id/check', async (req, res, next) => {
  try {
    const tracker = trackerRepo.findById(Number(req.params.id));
    if (!tracker) { next(new HttpError(404, 'Tracker not found')); return; }
    const result = await checkUrl(tracker.url, tracker.selector, tracker.jsRender);
    res.json(historyRepo.insert(tracker.id, result));
  } catch (err) { next(err); }
});
