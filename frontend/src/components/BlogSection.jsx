import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { blogPosts } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';

const BlogSection = () => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="blog" className="py-20 lg:py-28 bg-white">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
              style={{ transitionDelay: `${index * 100}ms` }}
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
