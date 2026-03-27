import React from 'react';
import { partnerLogos } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';

const PartnersSection = () => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section className="py-16 bg-white">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partnerLogos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Partner ${index + 1}`}
              className="h-12 md:h-16 object-contain opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
