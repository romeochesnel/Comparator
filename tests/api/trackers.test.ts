import request from 'supertest';
import { createApp } from '../../src/app';
import { closeDb } from '../../src/storage/db';

jest.mock('../../src/scheduler', () => ({
  startScheduler: jest.fn(),
  scheduleTracker: jest.fn(),
  stopTracker: jest.fn(),
}));

jest.mock('../../src/scraper/extractor', () => ({
  checkUrl: jest.fn().mockResolvedValue({ value: '€29.99', statusCode: 200, error: null }),
}));

const app = createApp();
afterAll(() => closeDb());

describe('POST /api/trackers', () => {
  it('creates a tracker and returns 201', async () => {
    const res = await request(app)
      .post('/api/trackers')
      .send({ name: 'Test', url: 'https://example.com', selector: '.price' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/trackers').send({ name: 'Only name' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/trackers', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/api/trackers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('DELETE /api/trackers/:id', () => {
  it('deletes an existing tracker', async () => {
    const created = await request(app)
      .post('/api/trackers')
      .send({ name: 'To delete', url: 'https://example.com', selector: 'h1' });
    const del = await request(app).delete(`/api/trackers/${created.body.id}`);
    expect(del.status).toBe(204);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/trackers/99999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/trackers/:id', () => {
  it('toggles active state', async () => {
    const created = await request(app)
      .post('/api/trackers')
      .send({ name: 'Pausable', url: 'https://example.com', selector: 'h1' });
    const patched = await request(app)
      .patch(`/api/trackers/${created.body.id}`)
      .send({ active: false });
    expect(patched.status).toBe(200);
    expect(patched.body.active).toBe(false);
  });
});
