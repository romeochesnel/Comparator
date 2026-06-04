import { z } from 'zod';

export const createTrackerSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  selector: z.string().min(1),
  interval: z.number().int().min(1).optional(),
  jsRender: z.boolean().optional(),
});

export const patchTrackerSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  selector: z.string().min(1).optional(),
  interval: z.number().int().min(1).optional(),
  jsRender: z.boolean().optional(),
  active: z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Body must not be empty' });
