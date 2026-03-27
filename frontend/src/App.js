import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JoinClassModal from './components/JoinClassModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import EventsPage from './pages/EventsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventForm from './pages/admin/EventForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Layout wrapper to conditionally show navbar/footer
const AppLayout = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar onJoinClassClick={() => setIsJoinModalOpen(true)} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
        <Route path="/admin/events/:id/edit" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
      </Routes>

      {!isAdminRoute && <Footer />}

      {/* Floating Join Class Button - Left Side (only on public pages) */}
      {!isAdminRoute && (
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-3 py-4 rounded-r-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:pl-5 group"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          aria-label="Join Class"
        >
          <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <GraduationCap size={18} className="rotate-90" />
            Join Class
          </span>
        </button>
      )}

      {/* Join Class Modal */}
      <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
