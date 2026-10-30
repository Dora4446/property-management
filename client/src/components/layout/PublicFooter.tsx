import React from 'react';
import { Building2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm">
              PH
            </div>
            <span className="font-bold text-white text-base">PropertyHub</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            India's premier MERN-powered property management platform for independent landlords, rental housing communities, and real estate agencies.
          </p>
          <p className="text-[11px] text-teal-400">
            Currency: INR (₹) • Date: DD-MM-YYYY • India Locale
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Platform Portals</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/login" className="hover:text-white transition-colors">Property Owner Portal</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Tenant Resident Portal</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Property Manager Desk</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Agent Showings</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Major Hubs</h4>
          <ul className="space-y-2 text-xs">
            <li>Bengaluru (Electronic City, Whitefield, Indiranagar)</li>
            <li>Mumbai (Bandra West, Powai, Thane)</li>
            <li>Hyderabad (Hitec City, Gachibowli, Jubilee Hills)</li>
            <li>Pune (Koregaon Park, Kalyani Nagar)</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Security & Compliance</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Razorpay verified Indian payment orders with HMAC-SHA256 signature checks. Bank-grade JWT authentication and bcrypt credential security.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 PropertyHub. Full-Stack MERN Property Management System. All rights reserved.
      </div>
    </footer>
  );
};
