import React, { useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Wrench,
  Users,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Property } from '../../types';
import { formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    api
      .get('/properties?limit=3')
      .then((res) => setProperties(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Real Estate & Rental Housing Platform for India</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
              Smarter Property Management <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-200">
                Tailored for India
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Centralized property operations for Owners, Tenants, Property Managers, and Agents. Integrated with Razorpay INR payments, digital 11-month lease tracking, and automated PDF rent receipts.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center space-x-2"
              >
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* 5-Role Portals Feature Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Role-Based Access Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Built for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Granular role-based permissions enforced across React dashboards and Node.js REST endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                AD
              </div>
              <h3 className="font-bold text-slate-900 text-base">Administrator</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Full platform governance, user activation, master database controls, financial compliance, and comprehensive audit logs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border-2 border-teal-500/40 shadow-card hover-lift relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Merged Capabilities
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-md shadow-teal-600/20">
                PM
              </div>
              <h3 className="font-bold text-slate-900 text-base">Property Manager</h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5 text-teal-700">
                Owner Portfolio • Agent Showings • Operations
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Manages complete property ownership, rental yield & NOI calculations, client walkthrough showings, 11-month lease contracts, and technician dispatch.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
                TN
              </div>
              <h3 className="font-bold text-slate-900 text-base">Tenant Resident</h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5 text-emerald-700">
                Resident Portal
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Seamless digital portal to pay rent online via Razorpay (UPI/Cards/Net Banking), download tax-compliant PDF receipts, and submit repair requests.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Live Inventory Section */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Verified Real Estate Listings
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  Premium Homes in Top Metros
                </h2>
              </div>
              <Link
                to="/login"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center"
              >
                Explore All Units →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div
                  key={p._id}
                  className="rounded-2xl border border-slate-200 shadow-card overflow-hidden hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 w-full relative">
                      <img
                        src={
                          p.images?.[0] ||
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 text-white font-bold text-[10px]">
                          {p.propertyType}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={p.availabilityStatus} />
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {p.city}, {p.state}
                      </p>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-600 font-medium">
                          {p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'Commercial'} • {p.builtUpArea} sq ft
                        </span>
                        <span className="font-extrabold text-teal-700 text-sm">
                          {formatINR(p.monthlyRent)}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      to="/login"
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs block text-center transition-colors border border-slate-200"
                    >
                      Login to View & Rent
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
