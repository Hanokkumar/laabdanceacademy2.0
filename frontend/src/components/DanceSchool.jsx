import React, { useState, useMemo } from 'react';
import { danceSchoolCategories, danceSchoolItems } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { useSiteContent } from '../hooks/useSiteContent';
import { cn } from '../lib/utils';

const DanceSchool = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [refHead, revealHead] = useScrollReveal('up');
  const [refSide, revealSide] = useScrollReveal('left');
  const [refGrid, revealGrid] = useScrollReveal('right');
  const { data } = useSiteContent();

  const categories = useMemo(
    () => (data?.danceSchoolCategories?.length ? data.danceSchoolCategories : danceSchoolCategories),
    [data]
  );
  const schoolItems = useMemo(
    () => (data?.danceSchoolItems?.length ? data.danceSchoolItems : danceSchoolItems),
    [data]
  );

  const filteredItems =
    activeFilter === 'All'
      ? schoolItems
      : schoolItems.filter((item) => (item.tags || []).includes(activeFilter));

  return (
    <section id="classes" className="py-20 lg:py-28 bg-[#f5f5f5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={refHead} className={cn('text-center mb-12', revealHead)}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
              Classes
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">
            Our Dance School
          </h2>
          <p className="text-gray-500 font-dm-sans text-base mt-4 max-w-2xl mx-auto">
            Let me know if you want longer versions, tagline-style alternatives, or a version focused on kids, professionals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Tabs */}
          <div ref={refSide} className={cn('lg:col-span-1', revealSide)}>
            <div className="flex lg:flex-col flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2.5 text-left font-dm-sans text-sm transition-all duration-300 rounded-md ${
                    activeFilter === cat
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div ref={refGrid} className={cn('lg:col-span-3', revealGrid)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer reveal-stagger"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-center justify-center">
                    <div className="text-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <h5 className="text-white font-manrope font-bold text-lg">
                        {item.title}
                      </h5>
                      <p className="text-primary font-dm-sans text-sm mt-1">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DanceSchool;
