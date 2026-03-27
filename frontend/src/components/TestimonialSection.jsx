import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';

const TestimonialSection = () => {
  const [ref, isVisible] = useScrollAnimation();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-20 lg:py-28 bg-[#111]">
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
              Reviews
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-manrope">
            Testimonial
          </h2>
          <p className="text-gray-400 font-dm-sans text-base mt-4 max-w-2xl mx-auto">
            Hear what our dancers say about their journey, growth, and the joy they've found in every move.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            {testimonials.map((t, index) => (
              <div
                key={t.id}
                className={`transition-all duration-700 ${
                  index === current
                    ? 'opacity-100 translate-x-0 block'
                    : 'opacity-0 translate-x-8 hidden'
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 relative">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-8 opacity-10">
                    <Quote size={64} className="text-white" />
                  </div>

                  <p className="text-white/80 font-dm-sans text-base md:text-lg leading-relaxed relative z-10">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-4 mt-8">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                    />
                    <div>
                      <h6 className="text-white font-manrope font-bold text-base">
                        {t.name}
                      </h6>
                      <p className="text-gray-400 font-dm-sans text-sm">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`transition-all duration-500 rounded-full ${
                    index === current
                      ? 'w-8 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
