import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { invalidateSiteContentCache } from '../../hooks/useSiteContent';
import { useDeferredImageUploadMulti } from '../../hooks/useDeferredImageUploadMulti';
import { Loader2, Trash2, Upload, Link2, Database, X, RefreshCw } from 'lucide-react';
import { IMAGE_FILE_ACCEPT, isImageLikeFile } from '../../utils/imageFiles';

import { BACKEND_URL, API_BASE as API } from '../../apiConfig';

const AdminGallery = () => {
  const { getAuthHeaders } = useAuth();
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const { pendingFiles, blobUrls, onFilesInputChange, clearPending, resetAll } =
    useDeferredImageUploadMulti();

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/gallery`);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createGalleryRow = async (cloudinaryUrl) => {
    const res = await axios.post(
      `${API}/gallery`,
      { url: cloudinaryUrl, sort_order: -1 },
      getAuthHeaders()
    );
    return res.data;
  };

  const onPickFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const bad = files.find((f) => !isImageLikeFile(f));
    if (bad) {
      window.alert('Please choose image files only (including HEIC/HEIF).');
      if (fileRef.current) fileRef.current.value = '';
      resetAll();
      return;
    }

    onFilesInputChange(e);
  };

  const clearPickedFiles = () => {
    clearPending();
    if (fileRef.current) fileRef.current.value = '';
  };

  const addPickedToGallery = async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    try {
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'gallery');

        const uploadRes = await axios.post(`${API}/upload`, fd, getAuthHeaders());
        const url = uploadRes.data?.url;
        const public_id = uploadRes.data?.public_id;
        if (!url || !public_id) throw new Error('Cloudinary upload failed to return url/public_id');

        await createGalleryRow(url);
      }

      invalidateSiteContentCache();
      await load();
      clearPickedFiles();
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const importRemote = async (e) => {
    e.preventDefault();
    const u = remoteUrl.trim();
    if (!u) return;
    setImporting(true);
    try {
      await axios.post(`${API}/gallery/import-remote`, { url: u }, getAuthHeaders());
      setRemoteUrl('');
      invalidateSiteContentCache();
      await load();
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this image from the gallery? It will be deleted from Cloudinary if hosted there.')) return;
    try {
      await axios.delete(`${API}/gallery/${id}`, getAuthHeaders());
      invalidateSiteContentCache();
      await load();
    } catch (e) {
      console.error(e);
      window.alert(e.response?.data?.detail || 'Delete failed');
    }
  };

  const migrateLegacy = async () => {
    if (
      !window.confirm(
        'This will upload the old demo gallery images into your Cloudinary folder "gallery" and add them to the database. Run once. Continue?'
      )
    ) {
      return;
    }
    setMigrating(true);
    try {
      const res = await axios.post(`${API}/gallery/migrate-legacy`, { confirm: true }, getAuthHeaders());
      invalidateSiteContentCache();
      await load();
      const msg = `Added ${res.data?.created ?? 0} image(s). Errors: ${(res.data?.errors || []).length}`;
      window.alert(msg);
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.detail || 'Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  const repairFromCloudinary = async () => {
    if (
      !window.confirm(
        'Add missing gallery rows for images that already exist in Cloudinary (folders "events" and "gallery") but are not in the database? Safe to run more than once.'
      )
    ) {
      return;
    }
    setRepairing(true);
    try {
      const res = await axios.post(`${API}/gallery/repair-cloudinary`, { confirm: true }, getAuthHeaders());
      invalidateSiteContentCache();
      await load();
      window.alert(`Repair finished. Added ${res.data?.added ?? 0} image(s) to the gallery list.`);
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.detail || err.message || 'Repair failed');
    } finally {
      setRepairing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#111] font-manrope">Gallery images</h2>
        <p className="text-gray-500 font-dm-sans text-sm mt-1">
          The <strong>visible gallery list</strong> is stored in your database (MongoDB). <strong>Cloudinary</strong> only holds the
          image files. If the server could not reach MongoDB or restarted in in-memory mode, the list can look empty even though
          files still exist in Cloudinary — use <strong>Repair from Cloudinary</strong> below to re-link them.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <h3 className="font-manrope font-semibold text-[#111] flex items-center gap-2">
          <Upload size={18} className="text-primary" />
          Upload from device
        </h3>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_FILE_ACCEPT}
          multiple
          className="hidden"
          onChange={onPickFile}
        />

        {blobUrls.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {blobUrls.map((src, idx) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${src}-${idx}`}
                  className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addPickedToGallery}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-manrope disabled:opacity-60"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {uploading ? `Uploading…` : `Add to gallery (${blobUrls.length})`}
              </button>
              <button
                type="button"
                onClick={clearPickedFiles}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-manrope disabled:opacity-60"
              >
                <X size={18} />
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-lg text-sm font-manrope disabled:opacity-60"
          >
            <Upload size={18} />
            Choose images
          </button>
        )}
      </div>

      <form onSubmit={importRemote} className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
        <h3 className="font-manrope font-semibold text-[#111] flex items-center gap-2">
          <Link2 size={18} className="text-primary" />
          Import from URL
        </h3>
        <p className="text-gray-500 font-dm-sans text-xs">
          Any public image URL (http/https). The server uploads it to Cloudinary under <code className="font-mono">gallery/</code> and
          adds it to the gallery.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={importing || !remoteUrl.trim()}
            className="inline-flex items-center justify-center gap-2 bg-[#111] text-white px-4 py-2 rounded-lg text-sm"
          >
            {importing ? <Loader2 className="animate-spin" size={16} /> : null}
            Import to Cloudinary
          </button>
        </div>
      </form>

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <h3 className="font-manrope font-semibold text-[#111] flex items-center gap-2">
          <RefreshCw size={18} className="text-sky-700" />
          Repair: missing list but files in Cloudinary
        </h3>
        <p className="text-gray-600 font-dm-sans text-xs mt-2">
          Scans Cloudinary folders <code className="font-mono">events</code> (older uploads) and <code className="font-mono">gallery</code>{' '}
          (new uploads from this screen) and adds database rows for any image not already listed. The{' '}
          <code className="font-mono">events</code> folder may also contain event banners — remove extras from the gallery if needed.
        </p>
        <button
          type="button"
          onClick={repairFromCloudinary}
          disabled={repairing}
          className="mt-3 text-sm border border-sky-300 bg-white text-sky-900 px-4 py-2 rounded-lg hover:bg-sky-100/80"
        >
          {repairing ? <Loader2 className="animate-spin inline mr-2" size={14} /> : null}
          Repair from Cloudinary
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-manrope font-semibold text-[#111] flex items-center gap-2">
          <Database size={18} className="text-amber-700" />
          One-time: migrate old demo gallery
        </h3>
        <p className="text-gray-600 font-dm-sans text-xs mt-2">
          If you previously used the bundled demo gallery images, this uploads them into your Cloudinary and adds them to the DB.
          Safe to skip if you already uploaded your own images.
        </p>
        <button
          type="button"
          onClick={migrateLegacy}
          disabled={migrating}
          className="mt-3 text-sm border border-amber-300 bg-white text-amber-900 px-4 py-2 rounded-lg hover:bg-amber-100/80"
        >
          {migrating ? <Loader2 className="animate-spin inline mr-2" size={14} /> : null}
          Run migration
        </button>
      </div>

      <div>
        <h3 className="font-manrope font-semibold text-[#111] mb-3">Current gallery ({items.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((g) => (
            <div key={g.id} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-100 aspect-square">
              <img src={g.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(g.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border border-dashed rounded-xl">
              <p className="font-dm-sans text-sm">No images yet — upload from your device above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
