import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { invalidateSiteContentCache } from '../../hooks/useSiteContent';
import { useDeferredImageUpload } from '../../hooks/useDeferredImageUpload';
import { IMAGE_FILE_ACCEPT } from '../../utils/imageFiles';
import { Loader2, Save, Trash2, Upload } from 'lucide-react';

import { BACKEND_URL, API_BASE as API } from '../../apiConfig';

const emptyForm = () => ({
  title: '',
  category: '',
  image: '',
  tags: '',
});

const AdminDanceSchool = () => {
  const { getAuthHeaders } = useAuth();
  const fileRef = useRef(null);
  const [categoriesText, setCategoriesText] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const { pendingFile, onFileInputChange, clearPending, resetAll, getDisplaySrc } =
    useDeferredImageUpload();
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        axios.get(`${API}/dance-school/categories`),
        axios.get(`${API}/dance-school/items`),
      ]);
      setCategoriesText((catsRes.data || []).join('\n'));
      setItems(itemsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveCategories = async () => {
    const categories = categoriesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!categories.length) return;
    setSaving(true);
    try {
      await axios.put(`${API}/dance-school/categories`, { categories }, getAuthHeaders());
      invalidateSiteContentCache();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    const tags = form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      let imageUrl = form.image;
      if (pendingFile) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('file', pendingFile);
          const res = await axios.post(`${API}/upload`, fd, {
            ...getAuthHeaders(),
            headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' },
          });
          imageUrl = res.data.url;
        } finally {
          setUploading(false);
        }
      }
      const body = { title: form.title, category: form.category, image: imageUrl, tags };
      if (editingId) {
        await axios.put(`${API}/dance-school/items/${editingId}`, body, getAuthHeaders());
      } else {
        await axios.post(`${API}/dance-school/items`, body, getAuthHeaders());
      }
      resetAll();
      if (fileRef.current) fileRef.current.value = '';
      setForm(emptyForm());
      setEditingId(null);
      invalidateSiteContentCache();
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await axios.delete(`${API}/dance-school/items/${id}`, getAuthHeaders());
      invalidateSiteContentCache();
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (item) => {
    resetAll();
    if (fileRef.current) fileRef.current.value = '';
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      category: item.category || '',
      image: item.image || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    });
  };

  const onPickImage = (e) => {
    onFileInputChange(e);
  };

  const onImageUrlChange = (e) => {
    clearPending();
    if (fileRef.current) fileRef.current.value = '';
    setForm((f) => ({ ...f, image: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-xl font-bold text-[#111] font-manrope">Filter categories</h2>
        <p className="text-gray-500 font-dm-sans text-sm mt-1">One category per line. Include &quot;All&quot; for the show-all tab.</p>
        <textarea
          value={categoriesText}
          onChange={(e) => setCategoriesText(e.target.value)}
          rows={8}
          className="mt-3 w-full border border-gray-200 rounded-lg p-3 font-dm-sans text-sm"
        />
        <button
          type="button"
          onClick={saveCategories}
          disabled={saving}
          className="mt-2 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-manrope"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save categories
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#111] font-manrope">School showcase cards</h2>
        <form onSubmit={saveItem} className="mt-4 bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          <input type="file" ref={fileRef} className="hidden" accept={IMAGE_FILE_ACCEPT} onChange={onPickImage} />
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || saving}
              className="inline-flex items-center gap-1 text-sm text-primary border border-primary/30 px-3 py-1.5 rounded-lg"
            >
              <Upload size={14} />
              {pendingFile ? 'Change file' : 'Choose image (uploads on Save)'}
            </button>
          </div>
          {getDisplaySrc(form.image, BACKEND_URL) && (
            <img
              src={getDisplaySrc(form.image, BACKEND_URL)}
              alt=""
              className="max-h-32 rounded-lg border border-gray-100 object-cover"
            />
          )}
          <input
            placeholder="Image URL (or pick file — Cloudinary on Save)"
            value={form.image}
            onChange={onImageUrlChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Title (e.g. London)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Primary category label"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <input
            placeholder="Tags (comma-separated, must match filter names)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-[#111] text-white px-4 py-2 rounded-lg text-sm">
              {editingId ? 'Update card' : 'Add card'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetAll();
                  if (fileRef.current) fileRef.current.value = '';
                  setEditingId(null);
                  setForm(emptyForm());
                }}
                className="text-gray-600 text-sm px-3"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="truncate font-medium">{item.title}</span>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => startEdit(item)} className="text-primary text-xs">
                  Edit
                </button>
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDanceSchool;
