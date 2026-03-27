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
  name: '',
  role: '',
  image: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
});

const AdminInstructors = () => {
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
      const res = await axios.get(`${API}/instructors`);
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
    const socials = {
      facebook: form.facebook || '#',
      twitter: form.twitter || '#',
      linkedin: form.linkedin || '#',
      instagram: form.instagram || '#',
    };
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
      const body = { name: form.name, role: form.role, image: imageUrl, socials };
      if (editingId) {
        await axios.put(`${API}/instructors/${editingId}`, body, getAuthHeaders());
      } else {
        await axios.post(`${API}/instructors`, body, getAuthHeaders());
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

  const remove = async (id) => {
    if (!window.confirm('Delete this instructor?')) return;
    try {
      await axios.delete(`${API}/instructors/${id}`, getAuthHeaders());
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
    const s = row.socials || {};
    setForm({
      name: row.name || '',
      role: row.role || '',
      image: row.image || '',
      facebook: s.facebook || '',
      twitter: s.twitter || '',
      linkedin: s.linkedin || '',
      instagram: s.instagram || '',
    });
  };

  const onPickPhoto = (e) => {
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
        <h2 className="text-lg font-bold font-manrope">{editingId ? 'Edit instructor' : 'Add instructor'}</h2>
        <input type="file" ref={fileRef} className="hidden" accept={IMAGE_FILE_ACCEPT} onChange={onPickPhoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || saving}
          className="text-sm text-primary border border-primary/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
        >
          <Upload size={14} />
          {pendingFile ? 'Change file' : 'Choose photo (uploads on Save)'}
        </button>
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
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Role / style"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            placeholder="Facebook URL"
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            className="border border-gray-200 rounded px-2 py-1.5"
          />
          <input
            placeholder="Twitter URL"
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            className="border border-gray-200 rounded px-2 py-1.5"
          />
          <input
            placeholder="LinkedIn URL"
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            className="border border-gray-200 rounded px-2 py-1.5"
          />
          <input
            placeholder="Instagram URL"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className="border border-gray-200 rounded px-2 py-1.5"
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
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium">{row.name}</span>
              <span className="text-gray-500 ml-2">{row.role}</span>
            </span>
            <div className="flex gap-2">
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

export default AdminInstructors;
