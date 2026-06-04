import { chromium, Browser } from 'playwright';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function fetchWithPlaywright(url: string): Promise<{ html: string; statusCode: number }> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    const html = await page.content();
    return { html, statusCode: response?.status() ?? 200 };
  } finally {
    await page.close();
  }
}
