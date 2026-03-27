import React from 'react';
import { useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/mockData';
import useScrollAnimation from '../hooks/useScrollAnimation';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

const moreBlogPosts = [
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1550026593-dd8ce0749590?w=600&q=80',
    title: 'The Art of Expression Through Dance',
    description: 'Explore how dance serves as a powerful medium for self-expression and emotional release...',
    date: 'Jan 15, 2025', category: 'Dance Tips',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&q=80',
    title: 'Beginner\'s Guide to Hip Hop',
    description: 'Everything you need to know to start your hip hop journey. From basic moves to full routines...',
    date: 'Jan 8, 2025', category: 'Hip Hop',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1537365587684-f490102e1225?w=600&q=80',
    title: 'Why Every Child Should Learn Dance',
    description: 'Discover the incredible benefits of dance education for children\'s physical, mental, and social development...',
    date: 'Dec 20, 2024', category: 'Education',
  },
];

const allPosts = [...blogPosts, ...moreBlogPosts];

const BlogPage = () => {
  const [ref1, isVisible1] = useScrollAnimation();
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] bg-[#111] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=1920&q=80)' }} />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white font-manrope animate-slideUp">Our Blog</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 font-dm-sans animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <span className="text-primary">Blog</span>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div
          ref={ref1}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post) => (
              <article key={post.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                <div className="relative overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <h5 className="text-lg font-bold text-[#111] font-manrope group-hover:text-primary transition-colors cursor-pointer">{post.title}</h5>
                  <p className="text-gray-500 font-dm-sans text-sm mt-2 leading-relaxed">{post.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar size={13} />
                        <span className="text-xs font-dm-sans">{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Tag size={13} />
                        <span className="text-xs font-dm-sans">{post.category}</span>
                      </div>
                    </div>
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
