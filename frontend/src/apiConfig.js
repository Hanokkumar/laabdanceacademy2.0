/**
 * Single place for backend origin. Set REACT_APP_BACKEND_URL in env (see frontend/.env.example).
 * Falls back to the deployed API if the env var is missing or empty.
 */
const DEFAULT_BACKEND = 'https://laabdanceacademy2-0.onrender.com';

function normalizeBackendUrl(url) {
  if (url == null || typeof url !== 'string') return DEFAULT_BACKEND;
  const t = url.trim();
  if (!t) return DEFAULT_BACKEND;
  return t.replace(/\/$/, '');
}

export const BACKEND_URL = normalizeBackendUrl(process.env.REACT_APP_BACKEND_URL);
export const API_BASE = `${BACKEND_URL}/api`;
