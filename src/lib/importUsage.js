import { api } from './api.js';

const CACHE_MS = 60000;
let cached;
let expires = 0;
let reading;
let revision = 0;

export function rememberImportUsage(usage) {
  revision++;
  cached = usage;
  expires = usage ? Math.min(Date.now() + CACHE_MS, usage.resetsAt) : 0;
}

export async function loadImportUsage() {
  if (cached && expires > Date.now()) return cached;
  if (reading) return reading;
  const started = revision;
  reading = api.get('/analyze').then(({ data }) => {
    // An older allowance read must not replace a newer import reservation.
    if (started === revision) rememberImportUsage(data.usage);
    return cached;
  });
  try { return await reading; }
  finally { reading = null; }
}
