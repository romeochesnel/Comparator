import request from 'supertest';
import { createApp } from '../../src/app';
import { closeDb } from '../../src/storage/db';

jest.mock('../../src/scheduler', () => ({
  startScheduler: jest.fn(),
  scheduleTracker: jest.fn(),
  stopTracker: jest.fn(),
}));

const app = createApp();
afterAll(() => closeDb());

describe('Auth middleware', () => {
  const ORIGINAL_API_KEY = process.env.API_KEY;

  afterEach(() => {
    if (ORIGINAL_API_KEY === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = ORIGINAL_API_KEY;
  });

  it('allows all requests when API_KEY is not set', async () => {
    delete process.env.API_KEY;
    const res = await request(app).get('/api/trackers');
    expect(res.status).toBe(200);
  });

  it('returns 401 when API_KEY is set and no token is provided', async () => {
    process.env.API_KEY = 'secret123';
    const res = await request(app).get('/api/trackers');
    expect(res.status).toBe(401);
  });

  it('returns 401 when the token is wrong', async () => {
    process.env.API_KEY = 'secret123';
    const res = await request(app)
      .get('/api/trackers')
      .set('Authorization', 'Bearer wrong-key');
    expect(res.status).toBe(401);
  });

  it('allows requests with the correct Bearer token', async () => {
    process.env.API_KEY = 'secret123';
    const res = await request(app)
      .get('/api/trackers')
      .set('Authorization', 'Bearer secret123');
    expect(res.status).toBe(200);
  });
});
