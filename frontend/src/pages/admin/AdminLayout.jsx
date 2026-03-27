import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Images,
  Users,
  Table2,
  BookOpen,
  MessageSquareQuote,
  LogOut,
  Eye,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/dance-school', label: 'Our Dance School', icon: GraduationCap },
  { to: '/admin/gallery', label: 'Our Gallery', icon: Images },
  { to: '/admin/instructors', label: 'Our Instructors', icon: Users },
  { to: '/admin/schedule', label: 'Class Schedule', icon: Table2 },
  { to: '/admin/blog', label: 'Latest Blog', icon: BookOpen },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 shrink-0 bg-[#111] text-white flex flex-col border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <p className="text-xs text-gray-500 font-dm-sans uppercase tracking-wider">Admin</p>
          <p className="font-manrope font-bold text-lg mt-1">Laab Dance Academy</p>
          <p className="text-gray-400 font-dm-sans text-xs mt-1 truncate">{user?.username}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-dm-sans text-sm transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <h1 className="text-lg font-bold text-[#111] font-manrope">Content management</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-primary font-dm-sans text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <Eye size={16} />
              View site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-[#111] hover:bg-black text-white font-dm-sans text-sm px-4 py-2 rounded-lg flex items-center gap-1.5"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
