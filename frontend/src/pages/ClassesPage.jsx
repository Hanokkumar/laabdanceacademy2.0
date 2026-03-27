import React from 'react';
import { useNavigate } from 'react-router-dom';
import DanceSchool from '../components/DanceSchool';
import ClassScheduleSection from '../components/ClassScheduleSection';
import CTABanner from '../components/CTABanner';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { Music, Star, Clock, Users } from 'lucide-react';

const classDetails = [
  { icon: Music, title: 'Ballet', desc: 'Master the grace and elegance of classical ballet with our expert instructors. Perfect for beginners and advanced dancers alike.', level: 'All Levels', duration: '60 min' },
  { icon: Star, title: 'Hip Hop', desc: 'Learn the latest hip hop moves and street dance styles. High energy classes that will keep you moving all session long.', level: 'Beginner - Advanced', duration: '75 min' },
  { icon: Music, title: 'Contemporary', desc: 'Explore fluid and expressive movements that blend ballet, jazz, and modern dance techniques in creative ways.', level: 'Intermediate', duration: '60 min' },
  { icon: Star, title: 'Jazz', desc: 'Dynamic and energetic jazz classes featuring sharp movements, kicks, and turns set to upbeat music.', level: 'All Levels', duration: '60 min' },
  { icon: Music, title: 'Salsa', desc: 'Feel the rhythm of Latin dance with our passionate salsa classes. Perfect for couples and solo dancers.', level: 'Beginner', duration: '60 min' },
  { icon: Star, title: 'Kathak', desc: 'Discover the beauty of Indian classical dance through intricate footwork and expressive storytelling.', level: 'All Levels', duration: '90 min' },
];

const ClassesPage = () => {
  const [ref1, isVisible1] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] bg-[#111] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=1920&q=80)' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-manrope animate-slideUp">Our Classes</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 font-dm-sans animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-primary">Classes</span>
          </div>
        </div>
      </section>

      {/* Class Details */}
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
              <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">What We Offer</span>
              <div className="w-10 h-[2px] bg-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">Dance Class Types</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classDetails.map((c, i) => (
              <div key={i} className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <c.icon size={24} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-[#111] font-manrope group-hover:text-primary transition-colors">{c.title}</h4>
                <p className="text-gray-500 font-dm-sans text-sm mt-2 leading-relaxed">{c.desc}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-dm-sans">
                    <Users size={12} />{c.level}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-dm-sans">
                    <Clock size={12} />{c.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DanceSchool />
      <ClassScheduleSection />
      <CTABanner />
    </>
  );
};

export default ClassesPage;
