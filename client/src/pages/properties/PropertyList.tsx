import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Property } from '../../types';
import { formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { AddPropertyModal } from './AddPropertyModal';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const PropertyList: React.FC = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (propertyType) params.append('propertyType', propertyType);
      if (city) params.append('city', city);
      if (status) params.append('status', status);

      const res = await api.get(`/properties?${params.toString()}`);
      setProperties(res.data.data || []);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, propertyType, city, status]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
      alert('Property deleted successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const canAddProperty = user?.role === 'ADMIN' || user?.role === 'PROPERTY_OWNER' || user?.role === 'PROPERTY_MANAGER';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage real estate listings, rental pricing, amenities, and current occupancies.
          </p>
        </div>

        {canAddProperty && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Property
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, address, locality, or PIN code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Delhi">Delhi NCR</option>
          </select>

          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
            <option value="Office">Office</option>
            <option value="Commercial">Commercial</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Display */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No properties matched your filters</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-card hover-lift overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      prop.images?.[0] ||
                      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-950/80 text-white backdrop-blur-sm">
                      {prop.propertyType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={prop.availabilityStatus} />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400" />
                    {prop.address}, {prop.city}
                  </p>

                  <div className="grid grid-cols-3 gap-2 my-4 py-3 border-y border-slate-100 text-center text-xs text-slate-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.bedrooms} BHK</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.bathrooms} Bath</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.builtUpArea} sq ft</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-teal-700">
                        {formatINR(prop.monthlyRent)}
                      </span>
                      <span className="text-xs text-slate-400"> /month</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Dep: {formatINR(prop.securityDeposit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-between border-t border-slate-50">
                <Link
                  to={`/properties/${prop._id}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Details & Schedule →
                </Link>

                {(user?.role === 'ADMIN' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'PROPERTY_OWNER') && (
                  <button
                    onClick={() => handleDelete(prop._id, prop.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Rent (INR)</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((prop) => (
                <tr key={prop._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{prop.title}</td>
                  <td className="py-3 px-4 text-slate-500">{prop.city}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {prop.bedrooms} BHK • {prop.builtUpArea} sq ft
                  </td>
                  <td className="py-3 px-4 font-bold text-teal-700">{formatINR(prop.monthlyRent)}</td>
                  <td className="py-3 px-4 text-slate-500">{formatINR(prop.securityDeposit)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={prop.availabilityStatus} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      to={`/properties/${prop._id}`}
                      className="text-xs font-semibold text-teal-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchProperties}
      />
    </div>
  );
};
