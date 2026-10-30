import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Calendar, CreditCard, Wrench, Download, Phone, Mail } from 'lucide-react';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const MyProperty: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/reports/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRental();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const prop = data?.property;
  const tenant = data?.tenant;

  if (!prop) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Rental Property Assigned</h3>
        <p className="text-xs text-slate-400 mt-1">Please contact your property manager to link your lease.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Rental Residence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete details about your leased home, landlord contacts, and building amenities.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={
              prop.images?.[0] ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
            }
            alt={prop.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <span className="px-2.5 py-1 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg uppercase">
                {prop.propertyType}
              </span>
              <h2 className="text-2xl font-bold mt-2">{prop.title}</h2>
              <p className="text-xs text-slate-300 mt-1">
                {prop.address}, {prop.city} - {prop.pincode}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-b border-slate-100 bg-slate-50">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Bedrooms</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{prop.bedrooms} BHK</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Area</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{prop.builtUpArea} sq ft</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Monthly Rent</p>
            <p className="text-base font-bold text-teal-700 mt-0.5">{formatINR(prop.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Furnishing</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">{prop.furnishingStatus}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Description</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{prop.description}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Included Society Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {(prop.amenities || []).map((amenity: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-lg border border-teal-200"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            <Link
              to="/payments"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Pay Rent Online
            </Link>
            <Link
              to="/maintenance"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center"
            >
              <Wrench className="w-4 h-4 mr-1.5" />
              Raise Repair Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
