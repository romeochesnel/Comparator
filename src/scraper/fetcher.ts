import axios from 'axios';

export interface FetchResult {
  html: string;
  statusCode: number;
}

export async function fetchUrl(url: string): Promise<FetchResult> {
  const response = await axios.get<string>(url, {
    timeout: 10_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Comparator/1.0)' },
    responseType: 'text',
    validateStatus: () => true,
  });
  return { html: response.data as string, statusCode: response.status };
}
