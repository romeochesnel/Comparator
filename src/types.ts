export interface Tracker {
  id: number;
  name: string;
  url: string;
  selector: string;
  interval: number;
  active: boolean;
  jsRender: boolean;
  createdAt: string;
}

export interface HistoryEntry {
  id: number;
  trackerId: number;
  value: string | null;
  statusCode: number | null;
  error: string | null;
  checkedAt: string;
}

export interface CheckResult {
  value: string | null;
  statusCode: number | null;
  error: string | null;
}

export interface CreateTrackerDto {
  name: string;
  url: string;
  selector: string;
  interval?: number;
  jsRender?: boolean;
}

export interface TrackerStats {
  globalMin: number | null;
  globalMax: number | null;
  globalAvg: number | null;
  todayMin: number | null;
  todayMax: number | null;
  count: number;
}
