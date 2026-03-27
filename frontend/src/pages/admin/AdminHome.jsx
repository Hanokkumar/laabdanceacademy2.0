import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  GraduationCap,
  Images,
  Users,
  Table2,
  BookOpen,
  MessageSquareQuote,
  ChevronRight,
} from 'lucide-react';

const cards = [
  {
    title: 'Events',
    desc: 'Manage upcoming performances and workshops',
    to: '/admin/events',
    icon: Calendar,
    accent: 'bg-primary/10 text-primary',
  },
  {
    title: 'Our Dance School',
    desc: 'Categories and class showcase cards',
    to: '/admin/dance-school',
    icon: GraduationCap,
    accent: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: 'Our Gallery',
    desc: 'Portfolio images',
    to: '/admin/gallery',
    icon: Images,
    accent: 'bg-violet-500/10 text-violet-600',
  },
  {
    title: 'Our Instructors',
    desc: 'Team profiles and social links',
    to: '/admin/instructors',
    icon: Users,
    accent: 'bg-sky-500/10 text-sky-600',
  },
  {
    title: 'Class Schedule',
    desc: 'Weekly timetable grid',
    to: '/admin/schedule',
    icon: Table2,
    accent: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Latest Blog',
    desc: 'Blog posts on the homepage',
    to: '/admin/blog',
    icon: BookOpen,
    accent: 'bg-rose-500/10 text-rose-600',
  },
  {
    title: 'Testimonials',
    desc: 'Student reviews carousel',
    to: '/admin/testimonials',
    icon: MessageSquareQuote,
    accent: 'bg-orange-500/10 text-orange-600',
  },
];

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#111] font-manrope">Overview</h2>
        <p className="text-gray-500 font-dm-sans text-sm mt-1">
          Choose a section to edit. Changes appear on the public site after you save.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(({ title, desc, to, icon: Icon, accent }) => (
          <button
            key={to}
            type="button"
            onClick={() => navigate(to)}
            className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-manrope font-bold text-[#111]">{title}</h3>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-primary transition-colors shrink-0"
                  />
                </div>
                <p className="text-gray-500 font-dm-sans text-sm mt-1">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
