import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, MapPin, DollarSign, Loader2, Search } from 'lucide-react';

import { BACKEND_URL, API_BASE as API } from '../../apiConfig';
const isVideoUrl = (url = '') => /\.(mp4|webm|mov)(\?.*)?$/i.test(url);

const AdminEventsPage = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${API}/events/${eventId}`, getAuthHeaders());
      setEvents(events.filter((e) => e.id !== eventId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${BACKEND_URL}${image}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111] font-manrope">{events.length}</p>
              <p className="text-gray-500 font-dm-sans text-sm">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111] font-manrope">
                {events.filter((e) => new Date(e.full_date || e.created_at) >= new Date()).length}
              </p>
              <p className="text-gray-500 font-dm-sans text-sm">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111] font-manrope">
                {events.filter((e) => e.price && e.price !== 'Free').length}
              </p>
              <p className="text-gray-500 font-dm-sans text-sm">Paid Events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#111] font-manrope">Manage Events</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary w-full sm:w-64 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/events/new')}
            className="bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-5 py-2.5 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 font-manrope">No events yet</h3>
          <p className="text-gray-400 font-dm-sans text-sm mt-1">Create your first event to get started</p>
          <button
            type="button"
            onClick={() => navigate('/admin/events/new')}
            className="mt-4 bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-6 py-2.5 rounded-lg text-sm transition-all inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {event.image ? (
                  isVideoUrl(getImageUrl(event.image)) ? (
                    <video
                      src={getImageUrl(event.image)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Calendar size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-primary text-white rounded-lg px-2.5 py-1.5 text-center">
                  <span className="block text-lg font-bold font-manrope leading-none">{event.date}</span>
                  <span className="block text-[10px] font-dm-sans uppercase">{event.month}</span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-[#111] font-manrope text-base truncate">{event.title}</h4>
                <p className="text-gray-500 font-dm-sans text-xs mt-1 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-3 mt-3 text-gray-400">
                  {event.location && (
                    <span className="flex items-center gap-1 text-xs font-dm-sans">
                      <MapPin size={12} />
                      {event.location}
                    </span>
                  )}
                  {event.price && (
                    <span className="text-primary font-bold font-manrope text-sm ml-auto">{event.price}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                    className="flex-1 bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary font-dm-sans text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(event.id)}
                    className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-dm-sans text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
          role="presentation"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#111] font-manrope">Delete Event?</h3>
            <p className="text-gray-500 font-dm-sans text-sm mt-2">
              This action cannot be undone. The event and its image will be permanently removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-manrope font-semibold py-2.5 rounded-lg text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-manrope font-semibold py-2.5 rounded-lg text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
