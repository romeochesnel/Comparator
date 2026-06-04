import { schedule, ScheduledTask } from 'node-cron';
import { findActive } from '../storage/trackerRepo';
import { insert } from '../storage/historyRepo';
import { checkUrl } from '../scraper/extractor';
import { Tracker } from '../types';

const tasks = new Map<number, ScheduledTask>();

export function startScheduler(): void {
  for (const tracker of findActive()) {
    scheduleTracker(tracker);
  }
}

export function scheduleTracker(tracker: Tracker): void {
  stopTracker(tracker.id);
  if (!tracker.active) return;
  const task = schedule(intervalToCron(tracker.interval), async () => {
    const result = await checkUrl(tracker.url, tracker.selector, tracker.jsRender);
    insert(tracker.id, result);
  });
  tasks.set(tracker.id, task);
}

export function stopTracker(id: number): void {
  const task = tasks.get(id);
  if (task) {
    task.stop();
    tasks.delete(id);
  }
}

export function stopScheduler(): void {
  for (const [id] of tasks) stopTracker(id);
}

function intervalToCron(minutes: number): string {
  const mins = Math.max(1, Math.round(minutes));
  if (mins < 60) return `*/${mins} * * * *`;
  const hours = Math.max(1, Math.round(mins / 60));
  return `0 */${hours} * * *`;
}
