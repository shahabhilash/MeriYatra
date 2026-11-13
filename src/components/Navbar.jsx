import React, { useState, useEffect } from 'react';
import { Menu, X, UserCircle, LogOut, Languages } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const desktopLinkClass = ({ isActive }) =>
  `relative h-16 inline-flex items-center font-medium transition-colors ${
    isActive
      ? 'text-red-600 after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-red-600 after:rounded-full'
      : 'text-gray-700 hover:text-red-600'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-4 py-3 font-medium rounded-lg transition-colors ${
    isActive ? 'bg-red-50 text-red-600' : 'text-gray-800 hover:bg-red-50 hover:text-red-600'
  }`;

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: t('navDashboard'), end: true },
    { to: '/routes', label: t('navRoutes') },
    { to: '/about', label: t('navAbout') },
  ];

  const langButton = (compact) => (
    <button
      onClick={toggleLanguage}
      aria-label="Switch language"
      className={`inline-flex items-center gap-1.5 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 ${
        compact ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'
      }`}
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'हिंदी' : 'English'}
    </button>
  );

  return (
    <nav className="bg-white/85 backdrop-blur-md border-b border-gray-200 sticky top-0 z-[1100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center" aria-label="मेरी yatra home">
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLinkClass}>
                {l.label}
              </NavLink>
            ))}

            {langButton(false)}

            {user ? (
              <div className="flex items-center gap-3">
                {profile?.role && (
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {profile.role === 'driver' ? t('authDriver') : t('authPassenger')}
                  </span>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm shadow-red-200"
              >
                <UserCircle className="h-5 w-5" />
                <span>{t('navLogin')}</span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {langButton(true)}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              className="text-gray-600 hover:text-gray-900 focus:outline-none bg-gray-50 p-2 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-xl absolute w-full left-0 top-16">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileLinkClass}>
                {l.label}
              </NavLink>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-4 px-4">
              {user ? (
                <button
                  onClick={signOut}
                  className="w-full flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('navLogout')}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <UserCircle className="h-5 w-5" />
                  <span>{t('navLogin')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
