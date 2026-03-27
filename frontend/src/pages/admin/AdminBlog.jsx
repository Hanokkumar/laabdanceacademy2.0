import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { invalidateSiteContentCache } from '../../hooks/useSiteContent';
import { useDeferredImageUpload } from '../../hooks/useDeferredImageUpload';
import { IMAGE_FILE_ACCEPT } from '../../utils/imageFiles';
import { Loader2, Save, Trash2, Upload } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const emptyForm = () => ({
  title: '',
  description: '',
  date: '',
  category: '',
  image: '',
});

const AdminBlog = () => {
  const { getAuthHeaders } = useAuth();
  const fileRef = useRef(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const { pendingFile, onFileInputChange, clearPending, resetAll, getDisplaySrc } =
    useDeferredImageUpload();
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/blog-posts`);
      setList(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
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
      const payload = { ...form, image: imageUrl };
      if (editingId) {
        await axios.put(`${API}/blog-posts/${editingId}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API}/blog-posts`, payload, getAuthHeaders());
      }
      resetAll();
      setForm(emptyForm());
      setEditingId(null);
      if (fileRef.current) fileRef.current.value = '';
      invalidateSiteContentCache();
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API}/blog-posts/${id}`, getAuthHeaders());
      invalidateSiteContentCache();
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (row) => {
    resetAll();
    if (fileRef.current) fileRef.current.value = '';
    setEditingId(row.id);
    setForm({
      title: row.title || '',
      description: row.description || '',
      date: row.date || '',
      category: row.category || '',
      image: row.image || '',
    });
  };

  const onPickCover = (e) => {
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
    <div className="max-w-3xl space-y-8">
      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-bold font-manrope">{editingId ? 'Edit blog post' : 'New blog post'}</h2>
        <input type="file" ref={fileRef} className="hidden" accept={IMAGE_FILE_ACCEPT} onChange={onPickCover} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || saving}
          className="text-sm text-primary border border-primary/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
        >
          <Upload size={14} />
          {pendingFile ? 'Change file' : 'Choose cover (uploads on Save)'}
        </button>
        {getDisplaySrc(form.image, BACKEND_URL) && (
          <img
            src={getDisplaySrc(form.image, BACKEND_URL)}
            alt=""
            className="max-h-32 rounded-lg border border-gray-100 object-cover"
          />
        )}
        <input
          placeholder="Image URL (or pick file above — Cloudinary on Save)"
          value={form.image}
          onChange={onImageUrlChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          required
        />
        <textarea
          placeholder="Short description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Date (e.g. Feb 21, 2025)"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="bg-[#111] text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save
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
              className="text-gray-600 text-sm px-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {list.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm gap-2"
          >
            <span className="truncate font-medium">{row.title}</span>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => startEdit(row)} className="text-primary text-xs">
                Edit
              </button>
              <button type="button" onClick={() => remove(row.id)} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBlog;
