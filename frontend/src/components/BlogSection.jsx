import React, { useMemo } from 'react';
import { Calendar, Tag } from 'lucide-react';
import { blogPosts as fallbackBlog } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollAnimation';
import { useSiteContent } from '../hooks/useSiteContent';
import { cn } from '../lib/utils';

const BlogSection = () => {
  const [refHead, revealHead] = useScrollReveal('up');
  const [refGrid, revealGrid] = useScrollReveal('left');
  const { data } = useSiteContent();
  const blogPosts = useMemo(
    () => (data?.blogPosts?.length ? data.blogPosts : fallbackBlog),
    [data]
  );

  return (
    <section id="blog" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={refHead} className={cn('text-center mb-12', revealHead)}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-primary font-dm-sans text-sm uppercase tracking-widest">
              Blog
            </span>
            <div className="w-10 h-[2px] bg-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111] font-manrope">
            Our Latest Blog
          </h2>
          <p className="text-gray-500 font-dm-sans text-base mt-4 max-w-2xl mx-auto">
            Stay connected to the rhythm of our world. From expert dance tips and training advice to behind-the-scenes stories
          </p>
        </div>

        {/* Blog Grid */}
        <div ref={refGrid} className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', revealGrid)}>
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 reveal-stagger"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h5 className="text-lg font-bold text-[#111] font-manrope group-hover:text-primary transition-colors duration-300 cursor-pointer">
                  {post.title}
                </h5>
                <p className="text-gray-500 font-dm-sans text-sm mt-2 leading-relaxed">
                  {post.description}
                </p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar size={13} />
                    <span className="text-xs font-dm-sans">{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Tag size={13} />
                    <span className="text-xs font-dm-sans">{post.category}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
