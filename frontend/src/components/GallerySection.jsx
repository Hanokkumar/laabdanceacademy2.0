import React, { useState, useMemo } from 'react';
import { ZoomIn } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { useSiteContent } from '../hooks/useSiteContent';
import { cn } from '../lib/utils';

const GallerySection = () => {
  const [ref, reveal] = useScrollReveal('right');
  const [lightboxImage, setLightboxImage] = useState(null);
  const { data } = useSiteContent();
  const galleryImages = useMemo(() => data?.galleryImages ?? [], [data]);

  return (
    <>
      <section className="py-20 lg:py-28 bg-[#111] overflow-hidden">
        <div ref={ref} className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', reveal)}>
          {/* Heading */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-[2px] bg-primary" />
              <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
                Portfolio
              </span>
              <div className="w-10 h-[2px] bg-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-manrope">
              Our Gallery
            </h2>
          </div>

          {/* Gallery Grid - Masonry Style */}
          {galleryImages.length === 0 ? (
            <p className="text-center text-gray-400 font-dm-sans py-12">
              Gallery images will appear here once added in the admin panel.
            </p>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, index) => {
              const isLarge = index === 0 || index === 4;
              return (
                <div
                  key={`${img}-${index}`}
                  className={`group relative overflow-hidden rounded-lg cursor-pointer reveal-stagger ${
                    isLarge ? 'row-span-2' : ''
                  }`}
                  onClick={() => setLightboxImage(img)}
                >
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      isLarge ? 'h-full min-h-[300px]' : 'h-48 md:h-52'
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/40 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500">
                      <ZoomIn size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Gallery preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default GallerySection;
