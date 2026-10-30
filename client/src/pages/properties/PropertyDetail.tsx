import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';
import { Property } from '../../types';
import { formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Visit scheduling modal state
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('04:00 PM');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data.data);
      } catch (err) {
        console.error('Failed to load property details', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsScheduling(true);
      await api.post('/visits', {
        propertyId: id,
        visitorName,
        visitorPhone,
        visitorEmail,
        visitDate,
        visitTime,
      });
      alert('Property showing visit booked successfully!');
      setShowVisitModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule visit');
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Property not found</h3>
        <Link to="/properties" className="text-xs font-semibold text-teal-600 mt-2 inline-block">
          ← Back to property list
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const owner: any = property.ownerId || {};
  const manager: any = property.managerId || {};

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Directory
        </Link>
      </div>

      {/* Main Showcase Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Main Photo Gallery */}
        <div className="h-80 sm:h-96 w-full relative bg-slate-900">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex space-x-2">
            <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-white font-bold text-xs rounded-lg">
              {property.propertyType}
            </span>
            <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-white font-medium text-xs rounded-lg">
              {property.furnishingStatus}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <StatusBadge status={property.availabilityStatus} />
          </div>
        </div>

        {/* Thumbnails if multiple images */}
        {images.length > 1 && (
          <div className="p-3 bg-slate-50 flex space-x-3 overflow-x-auto border-b border-slate-100">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === idx ? 'border-teal-600 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Property Overview */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {property.title}
              </h1>
              <p className="text-sm text-slate-500 mt-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400 flex-shrink-0" />
                {property.address}, {property.city}, {property.state} - {property.pincode}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between lg:flex-col lg:items-end gap-3 min-w-[200px]">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Rent
                </span>
                <span className="text-2xl font-extrabold text-teal-700">
                  {formatINR(property.monthlyRent)}
                </span>
                <span className="text-xs text-slate-500"> / mo</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Security Deposit: {formatINR(property.securityDeposit)}
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Bed className="w-5 h-5 mx-auto text-teal-600 mb-1" />
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Bedrooms</p>
              <p className="text-base font-bold text-slate-900">{property.bedrooms} BHK</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Bath className="w-5 h-5 mx-auto text-teal-600 mb-1" />
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Bathrooms</p>
              <p className="text-base font-bold text-slate-900">{property.bathrooms}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Maximize2 className="w-5 h-5 mx-auto text-teal-600 mb-1" />
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Built-Up Area</p>
              <p className="text-base font-bold text-slate-900">{property.builtUpArea} sq ft</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Building2 className="w-5 h-5 mx-auto text-teal-600 mb-1" />
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Furnishing</p>
              <p className="text-base font-bold text-slate-900">{property.furnishingStatus}</p>
            </div>
          </div>

          {/* Description */}
          <div className="py-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">Description & Property Details</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="py-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Amenities & Infrastructure</h3>
            <div className="flex flex-wrap gap-2">
              {(property.amenities || []).map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200 flex items-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Stakeholders: Landlord and Assigned Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Property Landlord / Owner
              </p>
              <h4 className="font-bold text-slate-900 text-sm">{owner.name || 'Owner'}</h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {owner.email || 'contact@propertyhub.in'}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {owner.phone || '+91 98000 00000'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Showings & Visits
                </p>
                <p className="text-xs text-slate-600">
                  Schedule an in-person physical property inspection with our assigned verified agent.
                </p>
              </div>
              <button
                onClick={() => setShowVisitModal(true)}
                className="mt-4 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center justify-center space-x-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Schedule Showing Visit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Showing Visit Modal */}
      <Modal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        title="Schedule Property Visit"
        description="Book a confirmed physical site visit with our real estate agent."
      >
        <form onSubmit={handleScheduleVisit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={visitorPhone}
              onChange={(e) => setVisitorPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="ramesh@gmail.com"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Time
              </label>
              <select
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowVisitModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {isScheduling ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
