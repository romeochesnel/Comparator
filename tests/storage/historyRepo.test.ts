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

describe('historyRepo.getStats', () => {
  it('returns nulls and count 0 when no numeric values', () => {
    const id = trackerRepo.create({ name: 'NoNums', url: 'https://a.test', selector: '.x' }).id;
    historyRepo.insert(id, { value: 'N/A', statusCode: 200, error: null });
    const stats = historyRepo.getStats(id);
    expect(stats.globalMin).toBeNull();
    expect(stats.globalMax).toBeNull();
    expect(stats.globalAvg).toBeNull();
    expect(stats.count).toBe(0);
  });

  it('computes min/max/avg from numeric values', () => {
    const id = trackerRepo.create({ name: 'Nums', url: 'https://b.test', selector: '.p' }).id;
    historyRepo.insert(id, { value: '€10.00', statusCode: 200, error: null });
    historyRepo.insert(id, { value: '€20.00', statusCode: 200, error: null });
    historyRepo.insert(id, { value: '€15.00', statusCode: 200, error: null });
    const stats = historyRepo.getStats(id);
    expect(stats.globalMin).toBe(10);
    expect(stats.globalMax).toBe(20);
    expect(stats.globalAvg).toBeCloseTo(15, 2);
    expect(stats.count).toBe(3);
  });

  it('includes today values in todayMin/todayMax', () => {
    const id = trackerRepo.create({ name: 'Today', url: 'https://c.test', selector: '.q' }).id;
    historyRepo.insert(id, { value: '5', statusCode: 200, error: null });
    historyRepo.insert(id, { value: '8', statusCode: 200, error: null });
    const stats = historyRepo.getStats(id);
    expect(stats.todayMin).toBe(5);
    expect(stats.todayMax).toBe(8);
  });

  it('returns nulls for empty tracker', () => {
    const id = trackerRepo.create({ name: 'Empty', url: 'https://d.test', selector: '.r' }).id;
    const stats = historyRepo.getStats(id);
    expect(stats.count).toBe(0);
    expect(stats.todayMin).toBeNull();
  });
});
