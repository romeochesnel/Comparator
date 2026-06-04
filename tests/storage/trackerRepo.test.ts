import { closeDb } from '../../src/storage/db';
import * as repo from '../../src/storage/trackerRepo';

afterAll(() => closeDb());

const base = { name: 'Test', url: 'https://example.com', selector: '.price' };

describe('trackerRepo', () => {
  it('creates a tracker with defaults', () => {
    const t = repo.create(base);
    expect(t.id).toBeDefined();
    expect(t.interval).toBe(60);
    expect(t.active).toBe(true);
  });

  it('findById returns the tracker', () => {
    const t = repo.create(base);
    expect(repo.findById(t.id)).toMatchObject({ name: 'Test' });
  });

  it('findById returns undefined for unknown id', () => {
    expect(repo.findById(999999)).toBeUndefined();
  });

  it('findAll returns all trackers', () => {
    const before = repo.findAll().length;
    repo.create(base);
    repo.create({ ...base, name: 'Second' });
    expect(repo.findAll().length).toBe(before + 2);
  });

  it('findActive only returns active trackers', () => {
    const t = repo.create(base);
    repo.update(t.id, { active: false });
    const active = repo.findActive().map(x => x.id);
    expect(active).not.toContain(t.id);
  });

  it('update modifies fields', () => {
    const t = repo.create(base);
    const updated = repo.update(t.id, { name: 'Renamed', interval: 30 });
    expect(updated?.name).toBe('Renamed');
    expect(updated?.interval).toBe(30);
  });

  it('update returns undefined for unknown id', () => {
    expect(repo.update(999999, { name: 'X' })).toBeUndefined();
  });

  it('remove deletes the tracker', () => {
    const t = repo.create(base);
    expect(repo.remove(t.id)).toBe(true);
    expect(repo.findById(t.id)).toBeUndefined();
  });

  it('remove returns false for unknown id', () => {
    expect(repo.remove(999999)).toBe(false);
  });
});
