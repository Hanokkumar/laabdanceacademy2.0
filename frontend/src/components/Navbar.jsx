import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const BRAND_LOGO = 'https://res.cloudinary.com/db3cpuhrq/image/upload/v1774629759/IMG_1458__1_-removebg-preview_rrcajv.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Classes', path: '/classes' },
  { label: 'Events', path: '/events' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = ({ onJoinClassClick }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNavClick('/')} className="flex items-center gap-2">
            <img src={BRAND_LOGO} alt="Laab Dance Academy logo" className="h-12 w-auto object-contain" />
            <span className="text-white font-bold text-lg font-manrope hidden sm:inline">Laab Dance Academy</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.path)}
                className={`font-dm-sans text-sm uppercase tracking-wider transition-colors duration-300 relative group ${
                  location.pathname === link.path ? 'text-primary' : 'text-white/80 hover:text-primary'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <button
              onClick={onJoinClassClick}
              className="bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-6 py-2.5 rounded-md text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Join Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? 'max-h-[500px] mt-4' : 'max-h-0'
          }`}
        >
          <div className="bg-black/90 backdrop-blur-md rounded-lg p-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.path)}
                className={`block w-full text-left font-dm-sans text-sm uppercase tracking-wider transition-colors duration-300 py-2 ${
                  location.pathname === link.path ? 'text-primary' : 'text-white/80 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setIsMobileMenuOpen(false); onJoinClassClick(); }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-manrope font-semibold px-6 py-2.5 rounded-md text-sm uppercase tracking-wider transition-all duration-300 mt-2"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
