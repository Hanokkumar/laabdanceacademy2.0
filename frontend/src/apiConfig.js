/**
 * Single place for backend origin. Set REACT_APP_BACKEND_URL in env (see frontend/.env.example).
 *
 * Windows/macOS often have REACT_APP_BACKEND_URL=http://localhost:8000 in the **shell or user
 * environment**. Create React App does not override existing env vars from .env files, so the
 * bundle can still bake localhost. We ignore localhost/127.0.0.1 unless REACT_APP_USE_LOCAL_API=true.
 */
const DEFAULT_BACKEND = 'https://laabdanceacademy2-0.onrender.com';

/** Set to "true" in .env.development.local when you intentionally run the API on this machine. */
const USE_LOCAL_API =
  process.env.REACT_APP_USE_LOCAL_API === 'true' || process.env.REACT_APP_USE_LOCAL_API === '1';

function isLocalHostOrigin(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function normalizeBackendUrl(url) {
  if (url == null || typeof url !== 'string') return DEFAULT_BACKEND;
  const t = url.trim();
  if (!t) return DEFAULT_BACKEND;
  const noTrail = t.replace(/\/$/, '');
  if (!USE_LOCAL_API && isLocalHostOrigin(noTrail)) {
    return DEFAULT_BACKEND;
  }
  return noTrail;
}

export const BACKEND_URL = normalizeBackendUrl(process.env.REACT_APP_BACKEND_URL);
export const API_BASE = `${BACKEND_URL}/api`;
