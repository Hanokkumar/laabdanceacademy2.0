/**
 * Canonical backend origin for the FastAPI service.
 * Keep in sync with `REACT_APP_BACKEND_URL` in:
 * - frontend/.env.development, frontend/.env.production, netlify.toml [build.environment]
 *
 * All HTTP calls should go through `apiConfig.js` (BACKEND_URL / API_BASE), which resolves this
 * value together with env and local-dev overrides.
 */
export const SITE_API_ORIGIN = 'https://laabdanceacademy2-0.onrender.com';
