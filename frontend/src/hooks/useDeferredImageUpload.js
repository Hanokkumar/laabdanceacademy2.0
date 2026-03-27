import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pick image locally first; upload to Cloudinary only when you call uploadPending() from the parent.
 * Avoids orphaned Cloudinary files when the user cancels or leaves without saving.
 */
export function useDeferredImageUpload() {
  const [pendingFile, setPendingFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const blobUrlRef = useRef(null);
  const originalSavedUrlRef = useRef('');

  const revokeCurrentBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(null);
  }, []);

  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    []
  );

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokeCurrentBlob();
    const next = URL.createObjectURL(file);
    blobUrlRef.current = next;
    setBlobUrl(next);
    setPendingFile(file);
  };

  const clearPending = useCallback(() => {
    revokeCurrentBlob();
    setPendingFile(null);
  }, [revokeCurrentBlob]);

  const resetAll = useCallback(() => {
    revokeCurrentBlob();
    setPendingFile(null);
    originalSavedUrlRef.current = '';
  }, [revokeCurrentBlob]);

  /**
   * @param {string} savedUrl - current image URL from form/API
   * @param {string} [backendBase] - for relative paths
   */
  const getDisplaySrc = (savedUrl, backendBase = '') => {
    if (pendingFile && blobUrl) return blobUrl;
    if (!savedUrl) return null;
    return savedUrl.startsWith('http') ? savedUrl : `${backendBase}${savedUrl}`;
  };

  return {
    pendingFile,
    blobUrl,
    originalSavedUrlRef,
    onFileInputChange,
    clearPending,
    resetAll,
    getDisplaySrc,
  };
}
