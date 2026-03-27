import React from 'react';
import { useNavigate } from 'react-router-dom';
import { aboutData, instructors } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { Facebook, Instagram, Linkedin, Twitter, Award, Users, Clock, Heart } from 'lucide-react';
import InstructorSection from '../components/InstructorSection';

const stats = [
  { icon: Users, label: 'Happy Students', value: '2,500+' },
  { icon: Award, label: 'Expert Instructors', value: '40+' },
  { icon: Clock, label: 'Years Experience', value: '15+' },
  { icon: Heart, label: 'Dance Styles', value: '20+' },
];

const AboutPage = () => {
  const [ref1, isVisible1] = useScrollAnimation();
  const [ref2, isVisible2] = useScrollAnimation();
  const [ref3, isVisible3] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] bg-[#111] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=1920&q=80)' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-manrope animate-slideUp">About Us</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 font-dm-sans animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-primary">About</span>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 lg:py-28 bg-white">
        <div
          ref={ref1}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative group">
              <div className="overflow-hidden rounded-lg">
                <img src={aboutData.image} alt="About" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-primary rounded-lg -z-10 hidden lg:block" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[2px] bg-primary" />
                <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">Our Story</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope leading-tight">{aboutData.title}</h2>
              <p className="text-gray-600 font-dm-sans text-base leading-relaxed mt-6">{aboutData.description}</p>
              <p className="text-gray-600 font-dm-sans text-base leading-relaxed mt-4">{aboutData.descriptionExtra}</p>
              <p className="text-gray-600 font-dm-sans text-base leading-relaxed mt-4">Our team of world-class instructors brings decades of experience across multiple dance genres. From classical ballet to high-energy hip hop, we offer a diverse range of classes designed to inspire dancers of all levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#111]">
        <div
          ref={ref2}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <stat.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-white font-manrope">{stat.value}</h3>
                <p className="text-gray-400 font-dm-sans text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#f5f5f5]">
        <div
          ref={ref3}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-500">
              <h3 className="text-2xl font-bold text-[#111] font-manrope mb-4">Our Mission</h3>
              <p className="text-gray-600 font-dm-sans leading-relaxed">To provide world-class dance education that empowers individuals to express themselves through movement, fostering creativity, discipline, and a lifelong love for dance.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-500">
              <h3 className="text-2xl font-bold text-[#111] font-manrope mb-4">Our Vision</h3>
              <p className="text-gray-600 font-dm-sans leading-relaxed">To be the leading dance academy that transforms lives through the art of dance, creating a vibrant community where every individual discovers the dancer within and achieves their full potential.</p>
            </div>
          </div>
        </div>
      </section>

      <InstructorSection />
    </>
  );
};

export default AboutPage;
