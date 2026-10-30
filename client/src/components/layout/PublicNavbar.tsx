import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const PublicNavbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-lg shadow-md shadow-teal-600/20">
            PH
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-tight">
              PropertyHub
            </span>
            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
              India Real Estate SaaS
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-teal-600 transition-colors">
            About Platform
          </Link>
          <Link to="/contact" className="hover:text-teal-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
