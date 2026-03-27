import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JoinClassModal from './components/JoinClassModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ClassesPage from './pages/ClassesPage';
import EventsPage from './pages/EventsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import { GraduationCap } from 'lucide-react';

function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar onJoinClassClick={() => setIsJoinModalOpen(true)} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>

        <Footer />

        {/* Floating Join Class Button - Left Side */}
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-3 py-4 rounded-r-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:pl-5 group writing-vertical"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          aria-label="Join Class"
        >
          <span className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <GraduationCap size={18} className="rotate-90" />
            Join Class
          </span>
        </button>

        {/* Join Class Modal */}
        <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      </BrowserRouter>
    </div>
  );
}

export default App;
