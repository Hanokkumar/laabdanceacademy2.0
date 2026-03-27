import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, Upload, X, Loader2, Save, Calendar,
  MapPin, DollarSign, Image as ImageIcon, FileText
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', date: '', month: '',
    year: new Date().getFullYear().toString(), location: '',
    price: '', image: '', full_date: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (isEditing) {
      const fetchEvent = async () => {
        try {
          const res = await axios.get(`${API}/events/${id}`);
          setFormData(res.data);
          if (res.data.image) {
            setImagePreview(res.data.image.startsWith('http') ? res.data.image : `${BACKEND_URL}${res.data.image}`);
          }
        } catch (err) {
          setError('Failed to load event');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/upload`, fd, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await axios.put(`${API}/events/${id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API}/events`, formData, getAuthHeaders());
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#111] shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white font-manrope">
                {isEditing ? 'Edit Event' : 'Create Event'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#111] font-manrope mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Event Details
                </h3>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Event Title *</label>
                    <input
                      type="text" name="title" value={formData.title} onChange={handleChange} required
                      placeholder="e.g. Neon Light Dance Night"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Description *</label>
                    <textarea
                      name="description" value={formData.description} onChange={handleChange} required
                      placeholder="Describe the event..." rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5 flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" /> Location
                    </label>
                    <input
                      type="text" name="location" value={formData.location} onChange={handleChange}
                      placeholder="e.g. Main Auditorium, Chennai"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#111] font-manrope mb-4 flex items-center gap-2">
                  <ImageIcon size={18} className="text-primary" />
                  Event Image
                </h3>

                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-lg" />
                    <button
                      type="button" onClick={removeImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-dm-sans text-sm">Click to upload image</p>
                    <p className="text-gray-400 font-dm-sans text-xs mt-1">JPEG, PNG, GIF, WebP (Max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Date */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#111] font-manrope mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Date & Time
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Full Date</label>
                    <input
                      type="date" name="full_date" value={formData.full_date} onChange={(e) => {
                        const val = e.target.value;
                        const d = new Date(val);
                        handleChange(e);
                        setFormData(prev => ({
                          ...prev,
                          full_date: val,
                          date: String(d.getDate()).padStart(2, '0'),
                          month: months[d.getMonth()],
                          year: String(d.getFullYear()),
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 font-manrope mb-1">Day</label>
                      <input
                        type="text" name="date" value={formData.date} onChange={handleChange}
                        placeholder="30" maxLength={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-dm-sans text-sm text-center focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 font-manrope mb-1">Month</label>
                      <select
                        name="month" value={formData.month} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary transition-all bg-white"
                      >
                        <option value="">Select</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-[#111] font-manrope mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-primary" />
                  Pricing
                </h3>
                <input
                  type="text" name="price" value={formData.price} onChange={handleChange}
                  placeholder="e.g. $80 or Free"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {error && (
                  <p className="text-red-500 text-sm font-dm-sans bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                )}
                <button
                  type="submit" disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-manrope font-semibold py-3.5 rounded-lg text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEditing ? 'Update Event' : 'Create Event'}</>}
                </button>
                <button
                  type="button" onClick={() => navigate('/admin')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-manrope font-semibold py-3 rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
