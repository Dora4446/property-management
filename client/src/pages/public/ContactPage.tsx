import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Support & Inquiries</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Get in Touch with PropertyHub India
          </h1>
          <p className="mt-3 text-slate-600 text-sm">
            Have questions about real estate onboarding or enterprise property management? Our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Details */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Corporate Hubs</h3>

            <div className="flex items-start space-x-3 text-xs text-slate-600">
              <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Bengaluru Headquarters:</p>
                <p>Level 5, Silicon Tech Park, Electronic City Phase 1, Bengaluru, Karnataka - 560100</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-600">
              <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Mumbai Operations:</p>
                <p>Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra - 400051</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <Phone className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Direct Helpline:</p>
                <p>+91 (080) 4123-8900 / +91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Email:</p>
                <p>support@propertyhub.in / sales@propertyhub.in</p>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card">
            {submitted ? (
              <div className="p-8 text-center bg-teal-50 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-900 text-base">Thank You!</h4>
                <p className="text-xs text-teal-700 mt-2">
                  Your message has been received. Our India property advisory team will contact you within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-2">Send an Inquiry</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we assist your property operations?"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
