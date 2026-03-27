import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JoinClassModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dance_style: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const danceStyles = ['Ballet', 'Hip Hop', 'Contemporary', 'Jazz', 'Salsa', 'Belly', 'Kathak', 'Modern', 'Tap', 'Irish'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/join-class`, formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', dance_style: '', message: '' });
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111] px-6 py-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white font-manrope">Join Our Class</h3>
            <p className="text-gray-400 font-dm-sans text-sm mt-1">Start your dance journey today</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-colors duration-300"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#111] font-manrope">Registration Successful!</h4>
              <p className="text-gray-500 font-dm-sans text-sm mt-2">We've sent the details to your email. We'll get back to you soon!</p>
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              {/* Phone & Dance Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Dance Style</label>
                  <select
                    name="dance_style"
                    value={formData.dance_style}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 bg-white"
                  >
                    <option value="">Select style</option>
                    {danceStyles.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your dance experience..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-dm-sans bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-manrope font-semibold py-3.5 rounded-lg text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Submit Registration</>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default JoinClassModal;
