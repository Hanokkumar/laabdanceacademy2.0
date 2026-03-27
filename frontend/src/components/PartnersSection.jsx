import React from 'react';
import { partnerLogos } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { cn } from '../lib/utils';

const PartnersSection = () => {
  const [ref, reveal] = useScrollReveal('up');

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div ref={ref} className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', reveal)}>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partnerLogos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Partner ${index + 1}`}
              className="h-12 md:h-16 object-contain opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0 reveal-stagger"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
