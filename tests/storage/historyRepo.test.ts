import { closeDb } from '../../src/storage/db';
import * as trackerRepo from '../../src/storage/trackerRepo';
import * as historyRepo from '../../src/storage/historyRepo';

afterAll(() => closeDb());

describe('historyRepo', () => {
  let trackerId: number;

  beforeAll(() => {
    trackerId = trackerRepo.create({
      name: 'Test', url: 'https://example.com', selector: '.price',
    }).id;
  });

  it('inserts and retrieves an entry', () => {
    historyRepo.insert(trackerId, { value: '€10', statusCode: 200, error: null });
    const entries = historyRepo.findByTrackerId(trackerId);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].value).toBe('€10');
    expect(entries[0].trackerId).toBe(trackerId);
  });

  it('findLatestByTrackerId returns the most recent entry', () => {
    historyRepo.insert(trackerId, { value: '€11', statusCode: 200, error: null });
    expect(historyRepo.findLatestByTrackerId(trackerId)?.value).toBe('€11');
  });

  it('honours the limit parameter', () => {
    for (let i = 0; i < 5; i++) {
      historyRepo.insert(trackerId, { value: `€${i}`, statusCode: 200, error: null });
    }
    expect(historyRepo.findByTrackerId(trackerId, 3)).toHaveLength(3);
  });

  it('stores error entries correctly', () => {
    historyRepo.insert(trackerId, { value: null, statusCode: null, error: 'timeout' });
    const latest = historyRepo.findLatestByTrackerId(trackerId);
    expect(latest?.error).toBe('timeout');
    expect(latest?.value).toBeNull();
  });
});
