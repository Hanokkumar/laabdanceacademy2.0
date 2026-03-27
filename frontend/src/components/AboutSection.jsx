import React from 'react';
import { aboutData } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { cn } from '../lib/utils';

const AboutSection = () => {
  const [refImg, revealImg] = useScrollReveal('left');
  const [refText, revealText] = useScrollReveal('right');

  return (
    <section id="about" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div ref={refImg} className={cn('relative group', revealImg)}>
            <div className="overflow-hidden rounded-lg">
              <img
                src={aboutData.image}
                alt="About our dance school"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-primary rounded-lg -z-10 hidden lg:block" />
          </div>

          {/* Text Content */}
          <div ref={refText} className={revealText}>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[2px] bg-primary" />
                <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
                  {aboutData.subtitle}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope leading-tight">
                {aboutData.title}
              </h2>
            </div>
            <p className="text-gray-600 font-dm-sans text-base leading-relaxed mt-6">
              {aboutData.description}
            </p>
            <p className="text-gray-600 font-dm-sans text-base leading-relaxed mt-4">
              {aboutData.descriptionExtra}
            </p>
            <button className="mt-8 bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-8 py-3 rounded-md text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 group">
              <span className="relative">{aboutData.buttonText}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
