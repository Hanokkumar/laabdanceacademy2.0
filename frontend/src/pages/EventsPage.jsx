import React from 'react';
import { useNavigate } from 'react-router-dom';
import { events } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { MapPin, Calendar, Clock } from 'lucide-react';

const moreEvents = [
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1550026593-dd8ce0749590?w=600&q=80',
    date: '10', month: 'Jun',
    title: 'Summer Dance Gala',
    description: 'A spectacular summer evening featuring performances from our top students across all dance styles...',
    location: 'Main Auditorium', price: '$45',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&q=80',
    date: '28', month: 'Jul',
    title: 'International Dance Day',
    description: 'Celebrate the universal language of dance with performances, workshops, and open classes for everyone...',
    location: 'City Park Arena', price: 'Free',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600&q=80',
    date: '05', month: 'Aug',
    title: 'Street Dance Battle',
    description: 'Watch the best street dancers compete in an epic battle of styles, creativity, and raw talent...',
    location: 'Downtown Plaza', price: '$35',
  },
];

const allEvents = [...events, ...moreEvents];

const EventsPage = () => {
  const [ref1, isVisible1] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] bg-[#111] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550026593-dd8ce0749590?w=1920&q=80)' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-manrope animate-slideUp">Events</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 font-dm-sans animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-primary">Events</span>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div
          ref={ref1}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-[2px] bg-primary" />
              <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">Upcoming</span>
              <div className="w-10 h-[2px] bg-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">All Dance Events</h2>
            <p className="text-gray-500 font-dm-sans text-base mt-4 max-w-2xl mx-auto">Join us for electrifying performances, vibrant showcases, and unforgettable nights</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event, index) => (
              <div key={event.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                <div className="relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-primary text-white rounded-lg px-3 py-2 text-center">
                    <span className="block text-2xl font-bold font-manrope leading-none">{event.date}</span>
                    <span className="block text-xs font-dm-sans uppercase mt-0.5">{event.month}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-primary text-white font-manrope font-semibold px-6 py-2.5 rounded-md text-sm">Book Now</button>
                  </div>
                </div>
                <div className="p-5">
                  <h5 className="text-lg font-bold text-[#111] font-manrope group-hover:text-primary transition-colors">{event.title}</h5>
                  <p className="text-gray-500 font-dm-sans text-sm mt-2 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={14} />
                      <span className="text-xs font-dm-sans">{event.location}</span>
                    </div>
                    <span className="text-primary font-bold font-manrope text-lg">{event.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default EventsPage;
