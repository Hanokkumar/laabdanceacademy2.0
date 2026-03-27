import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [ref1, isVisible1] = useScrollAnimation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/contact`, formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: 'Our Location', text: '1st Floor, No: 10, Rajiv Gandhi Salai, Navalur, Chennai, Tamil Nadu 600130' },
    { icon: Phone, title: 'Phone Number', text: '073583 55216' },
    { icon: Mail, title: 'Email Address', text: 'info@danceacademy.com' },
    { icon: Clock, title: 'Working Hours', text: 'Mon - Sat: 8:00 AM - 9:00 PM' },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] bg-[#111] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1537365587684-f490102e1225?w=1920&q=80)' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-manrope animate-slideUp">Contact Us</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 font-dm-sans animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-primary">Contact</span>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 lg:py-28 bg-white">
        <div
          ref={ref1}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[2px] bg-primary" />
                <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">Get In Touch</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111] font-manrope mb-6">We'd Love To Hear From You</h2>
              <p className="text-gray-500 font-dm-sans text-base leading-relaxed mb-8">Have a question or want to learn more about our classes? Reach out and let us know how we can help you start your dance journey.</p>
              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                      <info.icon size={20} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-manrope font-bold text-[#111] text-sm">{info.title}</h5>
                      <p className="text-gray-500 font-dm-sans text-sm mt-0.5">{info.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-[#f5f5f5] rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-[#111] font-manrope mb-6">Send Us A Message</h3>
                {success ? (
                  <div className="text-center py-12 animate-fadeIn">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-[#111] font-manrope">Message Sent!</h4>
                    <p className="text-gray-500 font-dm-sans text-sm mt-2">Thank you for reaching out. We'll respond shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Your email"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Subject</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 font-manrope mb-1.5">Message *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Write your message..." rows={5}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-dm-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none" />
                    </div>
                    {error && <p className="text-red-500 text-sm font-dm-sans bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-8 py-3.5 rounded-lg text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 flex items-center gap-2">
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-gray-200">
        <iframe
          title="Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8!2d80.2272!3d12.8449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525a00f72e0c7b%3A0x3b7b4c8f5e8f0c0a!2sNavalur%2C%20Chennai%2C%20Tamil%20Nadu%20600130!5e0!3m2!1sen!2sin!4v1234567890"
          width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
        />
      </section>
    </>
  );
};

export default ContactPage;
