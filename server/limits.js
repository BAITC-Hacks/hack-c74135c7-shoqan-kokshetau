import { fail } from './domain.js';

// Single-process fixed windows. Forwarded headers are intentionally not trusted.
export function createLimiter({ now = Date.now, maxKeys = 10000 } = {}) {
  const windows = new Map();
  return function consume(key, maximum, intervalMs) {
    const time = now();
    for (const [id, item] of windows) if (item.until <= time) windows.delete(id);
    let item = windows.get(key);
    if (!item) {
      // Fail closed if the table is full; never evict an active limit.
      if (windows.size >= maxKeys) throw Object.assign(new Error('Rate limit capacity reached'), { status: 429, retryAfter: Math.ceil(intervalMs / 1000) });
      item = { count: 0, until: time + intervalMs }; windows.set(key, item);
    }
    if (item.count >= maximum) throw Object.assign(new Error('Too many requests'), { status: 429, retryAfter: Math.max(1, Math.ceil((item.until - time) / 1000)) });
    item.count++;
  };
}

export function createRequestLimits(options = {}) {
  const consume = createLimiter(options);
  return function check(req, path) {
    if (!path.startsWith('/api/') || path === '/api/health') return;
    const address = req.socket.remoteAddress || 'unknown';
    consume('all', options.totalPerMinute ?? 1200, 60000);
    consume(`client:${address}`, options.clientPerMinute ?? 240, 60000);
    if (['POST', 'PATCH'].includes(req.method)) consume(`write:${address}`, options.writesPerMinute ?? 60, 60000);
    if (req.method === 'POST' && /\/(translate|clarify|mentor)$/.test(path)) consume(`ai:${address}`, options.aiPerMinute ?? 30, 60000);
  };
}

export function positiveInteger(value, fallback, name) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) fail(500, `Invalid configuration: ${name}`);
  return number;
}

// Counts real outbound requests, not cached translations or calls without an API key.
export function createOpenAIGateway({ fetcher = fetch, now = Date.now, maxConcurrent = 3, perDay = 200 } = {}) {
  const consume = createLimiter({ now });
  let active = 0;
  return async function request(url, options) {
    if (active >= maxConcurrent) throw Object.assign(new Error('AI busy'), { code: 'AI_LIMIT' });
    try { consume('outbound', perDay, 24 * 60 * 60 * 1000); }
    catch { throw Object.assign(new Error('AI request budget reached'), { code: 'AI_LIMIT' }); }
    active++;
    try {
      const response = await fetcher(url, options);
      // Read within the slot: fetch() resolves before its response body is consumed.
      const body = await response.json();
      return { ok: response.ok, status: response.status, json: async () => body };
    } finally { active--; }
  };
}

export const openAIFetch = createOpenAIGateway({
  perDay: positiveInteger(process.env.AI_REQUESTS_PER_DAY, 200, 'AI_REQUESTS_PER_DAY'),
  maxConcurrent: positiveInteger(process.env.AI_MAX_CONCURRENT, 3, 'AI_MAX_CONCURRENT')
});
