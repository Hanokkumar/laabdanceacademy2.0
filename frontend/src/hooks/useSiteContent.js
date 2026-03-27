import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

let siteContentCache = null;

export function invalidateSiteContentCache() {
  siteContentCache = null;
}

/**
 * Loads /api/site-content for homepage sections.
 * Refetches when the tab becomes visible again so admin edits are not stuck behind a stale cache.
 */
export function useSiteContent() {
  const [data, setData] = useState(siteContentCache);
  const [loading, setLoading] = useState(siteContentCache == null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      invalidateSiteContentCache();
      setRefreshKey((k) => k + 1);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const d = (await axios.get(`${API}/site-content`, { params: { _t: Date.now() } })).data;
        if (!cancelled) {
          siteContentCache = d;
          setData(d);
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { data, loading };
}
