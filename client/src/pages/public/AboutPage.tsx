import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Building2, Shield, HeartHandshake, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">About Us</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Digitizing Indian Real Estate & Rental Housing
          </h1>
          <p className="mt-4 text-slate-600 text-sm leading-relaxed">
            PropertyHub was built to eliminate paper-based rental friction in Indian metropolitan cities like Bengaluru, Mumbai, Hyderabad, and Pune. We combine modern MERN architecture, secure JWT role access, and Razorpay payment integration to give owners, managers, and tenants complete transparency.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
            <Building2 className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Standardized 11-Month Leases</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Automated renewal alerts, digital tenant KYC validation, and conflict-free occupancy tracking.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
            <Shield className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Verified Razorpay Payments</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Server-side cryptographic payment signature verification ensures every rupee is accounted for with instant downloadable PDF receipts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
            <HeartHandshake className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Transparent Financials</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Property-wise operating expense ledgers, BBMP property taxes, and Net Operating Income (NOI) analytics in INR (₹).
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
