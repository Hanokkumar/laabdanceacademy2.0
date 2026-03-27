import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ArrowUp, Send, Loader2,
  LayoutDashboard, ChevronRight,
} from 'lucide-react';
import { footerData } from '../data/mockData';
import axios from 'axios';
import { API_BASE as API } from '../apiConfig';
const BRAND_LOGO = 'https://res.cloudinary.com/db3cpuhrq/image/upload/v1774629759/IMG_1458__1_-removebg-preview_rrcajv.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter`, { email });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      console.error('Newsletter subscription failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#home" className="flex items-center gap-3">
                <img src={BRAND_LOGO} alt="Laab Dance Academy logo" className="h-12 w-auto object-contain" />
                <span className="text-white font-bold text-lg font-manrope">Laab Dance Academy</span>
              </a>
            </div>

            {/* Newsletter */}
            <div className="flex-1 max-w-xl">
              <h4 className="text-lg font-manrope font-semibold mb-4 text-center md:text-left">
                {footerData.description}
              </h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-md px-4 py-3 text-white placeholder:text-gray-500 font-dm-sans text-sm focus:outline-none focus:border-primary transition-colors duration-300"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-6 py-3 rounded-md text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="text-green-400 text-sm mt-2 font-dm-sans">
                  Thank you for subscribing!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h5 className="font-manrope font-bold text-base mb-4">About Us</h5>
            <p className="text-gray-400 font-dm-sans text-sm leading-relaxed">
              Discover the rhythm that awakens your soul and sets your spirit free. Our studio brings movement, emotion, and artistry together.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
                  aria-label="Social link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-manrope font-bold text-base mb-4">Quick Links</h5>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'About', path: '/about' },
                { label: 'Classes', path: '/classes' },
                { label: 'Events', path: '/events' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => { navigate(link.path); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-gray-400 hover:text-primary font-dm-sans text-sm transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="font-manrope font-bold text-base mb-4">Contact Info</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 font-dm-sans text-sm">
                  1st Floor, No: 10, Rajiv Gandhi Salai, Navalur, Chennai, Tamil Nadu 600130
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 font-dm-sans text-sm">
                  073583 55216
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 font-dm-sans text-sm">
                  info@danceacademy.com
                </span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h5 className="font-manrope font-bold text-base mb-4">Working Hours</h5>
            <ul className="space-y-3">
              <li className="flex justify-between text-gray-400 font-dm-sans text-sm">
                <span>Mon - Fri</span>
                <span>8:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between text-gray-400 font-dm-sans text-sm">
                <span>Saturday</span>
                <span>9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between text-gray-400 font-dm-sans text-sm">
                <span>Sunday</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright + staff entry — utility strip */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-center text-gray-500 font-dm-sans text-sm sm:text-left sm:max-w-[min(100%,28rem)]">
              {footerData.copyright}
            </p>
            <button
              type="button"
              onClick={() => { navigate('/admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              aria-label="Open admin panel — sign in to manage site content"
              className="group relative w-full max-w-sm shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-4 py-3 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[0_12px_36px_-14px_rgba(189,9,23,0.5)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:translate-y-0 sm:max-w-[17.5rem] sm:py-2.5"
            >
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.18] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />
              <span className="relative flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-inner ring-1 ring-inset ring-primary/25 transition-colors duration-300 group-hover:bg-primary/25 group-hover:ring-primary/40 sm:h-8 sm:w-8">
                  <LayoutDashboard className="h-[18px] w-[18px] sm:h-4 sm:w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-manrope text-sm font-semibold tracking-tight text-white sm:text-[13px]">
                    Admin panel
                  </span>
                  <span className="mt-0.5 block font-dm-sans text-[11px] leading-snug text-gray-500 transition-colors group-hover:text-gray-400 sm:text-[10px] sm:leading-tight">
                    Manage classes, events & media
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-gray-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary sm:h-3.5 sm:w-3.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;
