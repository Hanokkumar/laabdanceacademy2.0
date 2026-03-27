import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { events as mockEvents } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventsSection = () => {
  const [ref, isVisible] = useScrollAnimation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API}/events`);
        if (res.data && res.data.length > 0) {
          setEvents(res.data.slice(0, 3));
        } else {
          setEvents(mockEvents);
        }
      } catch {
        setEvents(mockEvents);
      }
    };
    fetchEvents();
  }, []);

  const getImageUrl = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1550026593-dd8ce0749590?w=600&q=80';
    if (image.startsWith('http')) return image;
    return `${BACKEND_URL}${image}`;
  };

  return (
    <section id="events" className="py-20 lg:py-28 bg-white">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
              Events
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">
            Upcoming Dance Events
          </h2>
          <p className="text-gray-500 font-dm-sans text-base mt-4 max-w-2xl mx-auto">
            Join us for electrifying performances, vibrant showcases, and unforgettable nights that celebrate movement, music, and passion
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={getImageUrl(event.image)}
                  alt={event.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-primary text-white rounded-lg px-3 py-2 text-center">
                  <span className="block text-2xl font-bold font-manrope leading-none">
                    {event.date}
                  </span>
                  <span className="block text-xs font-dm-sans uppercase mt-0.5">
                    {event.month}
                  </span>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-primary text-white font-manrope font-semibold px-6 py-2.5 rounded-md text-sm hover:bg-primary/90">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h5 className="text-lg font-bold text-[#111] font-manrope group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </h5>
                <p className="text-gray-500 font-dm-sans text-sm mt-2 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span className="text-xs font-dm-sans truncate max-w-[150px]">
                      {event.location}
                    </span>
                  </div>
                  <span className="text-primary font-bold font-manrope text-lg">
                    {event.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
