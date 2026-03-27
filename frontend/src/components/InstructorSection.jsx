import React, { useMemo } from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { instructors as fallbackInstructors } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { useSiteContent } from '../hooks/useSiteContent';
import { cn } from '../lib/utils';

const InstructorSection = () => {
  const [refHead, revealHead] = useScrollReveal('up');
  const [refGrid, revealGrid] = useScrollReveal('left');
  const { data } = useSiteContent();
  const instructors = useMemo(
    () => (data?.instructors?.length ? data.instructors : fallbackInstructors),
    [data]
  );

  const socialIcons = [
    { Icon: Facebook, key: 'facebook' },
    { Icon: Twitter, key: 'twitter' },
    { Icon: Linkedin, key: 'linkedin' },
    { Icon: Instagram, key: 'instagram' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={refHead} className={cn('text-center mb-12', revealHead)}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
              Team
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">
            Our Instructor
          </h2>
          <p className="text-gray-500 font-dm-sans text-base mt-4 max-w-2xl mx-auto">
            Blending technique and creativity to shape every dancer's journey.
          </p>
        </div>

        {/* Instructors Grid */}
        <div ref={refGrid} className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', revealGrid)}>
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="group text-center reveal-stagger"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-xl bg-[#f5f5f5]">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-80 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                {/* Social Overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center justify-center gap-3">
                    {socialIcons.map(({ Icon, key }) => (
                      <a
                        key={key}
                        href={instructor.socials?.[key] || '#'}
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all duration-300"
                        aria-label={key}
                      >
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="mt-4">
                <h5 className="text-lg font-bold text-[#111] font-manrope group-hover:text-primary transition-colors duration-300">
                  {instructor.name}
                </h5>
                <p className="text-gray-500 font-dm-sans text-sm mt-1">
                  {instructor.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
