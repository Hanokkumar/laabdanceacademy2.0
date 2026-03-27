import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Deferred multi-file image upload:
 * - User picks files => we create local blob URLs for preview only
 * - No network calls happen in this hook
 * - Caller uploads when user clicks Save/Confirm
 */
export function useDeferredImageUploadMulti() {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [blobUrls, setBlobUrls] = useState([]);
  const blobUrlsRef = useRef([]);

  const revokeAllBlobs = useCallback(() => {
    for (const u of blobUrlsRef.current) {
      try {
        URL.revokeObjectURL(u);
      } catch {
        // ignore
      }
    }
    blobUrlsRef.current = [];
    setBlobUrls([]);
  }, []);

  useEffect(() => {
    return () => {
      revokeAllBlobs();
    };
  }, [revokeAllBlobs]);

  const onFilesInputChange = (e) => {
    const fileList = e.target.files;
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    // Replace selection (clear previous picks first).
    revokeAllBlobs();
    setPendingFiles([]);

    const urls = files.map((f) => URL.createObjectURL(f));
    blobUrlsRef.current = urls;
    setBlobUrls(urls);
    setPendingFiles(files);
  };

  const clearPending = useCallback(() => {
    revokeAllBlobs();
    setPendingFiles([]);
  }, [revokeAllBlobs]);

  const resetAll = useCallback(() => {
    clearPending();
  }, [clearPending]);

  return {
    pendingFiles,
    blobUrls,
    onFilesInputChange,
    clearPending,
    resetAll,
  };
}

