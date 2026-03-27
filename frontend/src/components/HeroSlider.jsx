import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Instagram } from 'lucide-react';
import { heroSlides } from '../data/mockData';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback(
    (index) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 800);
    },
    [isAnimating]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section id="home" className="relative h-screen overflow-hidden bg-[#111]">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]"
              style={{
                backgroundImage: `url(${slide.bgImage})`,
                transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
              {/* Text Content */}
              <div
                className={`transition-all duration-[900ms] ease-out delay-200 ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : 'opacity-0 -translate-x-10 translate-y-4'
                }`}
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight">
                  <span className="font-playball text-primary">{slide.title}</span>
                  <br />
                  <span className="font-playball text-white">{slide.titleAccent}</span>
                </h1>
                <p className="text-white/80 font-manrope text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
                  {slide.description}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <button className="bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-8 py-3 rounded-md text-sm capitalize transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
                    View More
                  </button>
                </div>
                {/* Social Icons */}
                <div className="mt-10 flex items-center gap-4">
                  <div className="w-20 h-[2px] bg-white/30" />
                  {[
                    { Icon: Facebook, label: 'Facebook' },
                    { Icon: Instagram, label: 'Instagram' },
                  ].map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary transition-all duration-300"
                      aria-label={label}
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div
                className={`hidden lg:flex justify-center transition-all duration-[900ms] ease-out delay-500 ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-16 scale-95'
                }`}
              >
                <img
                  src={slide.image}
                  alt="Dancer"
                  className="max-h-[700px] object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/80 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/80 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide
                ? 'w-2 h-10 bg-primary'
                : 'w-2 h-8 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Number */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 text-white font-dm-sans">
        <span className="text-2xl font-bold">0{currentSlide + 1}</span>
        <div className="w-12 h-[1px] bg-white/30" />
        <span className="text-sm text-white/50">0{heroSlides.length}</span>
      </div>
    </section>
  );
};

export default HeroSlider;
