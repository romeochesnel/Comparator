import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_KEY;
  if (!apiKey) { next(); return; }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || header.slice(7) !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
