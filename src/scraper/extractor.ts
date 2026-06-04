import { load } from 'cheerio';
import { CheckResult } from '../types';
import { fetchUrl } from './fetcher';
import { fetchWithPlaywright } from './playwright-fetcher';

export function extractValue(html: string, selector: string): string | null {
  const $ = load(html);
  const el = $(selector).first();
  if (!el.length) return null;
  return el.text().trim() || null;
}

export async function checkUrl(url: string, selector: string, jsRender = false): Promise<CheckResult> {
  try {
    const { html, statusCode } = jsRender ? await fetchWithPlaywright(url) : await fetchUrl(url);
    const value = extractValue(html, selector);
    return { value, statusCode, error: null };
  } catch (err) {
    return { value: null, statusCode: null, error: err instanceof Error ? err.message : String(err) };
  }
}
