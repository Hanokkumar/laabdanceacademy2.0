import React from 'react';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { cn } from '../lib/utils';

const CTABanner = () => {
  const [ref, reveal] = useScrollReveal('scale');

  return (
    <section
      className="relative py-20 lg:py-28 bg-cover bg-center bg-fixed overflow-hidden"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=1920&q=80)',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        ref={ref}
        className={cn('relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center', reveal)}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-manrope leading-tight">
          Dance Competition Camp.
          <br />
          Train Your Skills To The Max.
        </h2>
        <button className="mt-8 bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-10 py-4 rounded-md text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
          Register Now
        </button>
      </div>
    </section>
  );
};

export default CTABanner;
