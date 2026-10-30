import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Phone, Mail, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Tenant, Property } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New tenant form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    emergencyName: '',
    emergencyRelation: 'Relative',
    emergencyPhone: '',
    employerName: '',
    designation: '',
    monthlyIncome: 100000,
  });

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/tenants${search ? `?search=${search}` : ''}`);
      setTenants(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableProperties = async () => {
    try {
      const res = await api.get('/properties?status=Available');
      setProperties(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchAvailableProperties();
  }, [search]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tenants', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId: formData.propertyId || undefined,
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
        employmentDetails: {
          employerName: formData.employerName,
          designation: formData.designation,
          monthlyIncome: Number(formData.monthlyIncome),
        },
      });
      alert('Tenant registered successfully! Default password is "Password@123"');
      setIsAddOpen(false);
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tenant Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered residents, emergency contacts, Aadhaar/PAN verifications, and assigned units.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Tenant
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant by name, email, or emergency contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Tenants Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No tenants found</h3>
          <p className="text-xs text-slate-400 mt-1">Add a tenant profile to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Property</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">KYC / Identity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          t.userId?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={t.userId?.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{t.userId?.name || 'Resident'}</p>
                        <p className="text-[11px] text-slate-400">
                          {t.employmentDetails?.designation || 'Employed'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{t.userId?.phone || '—'}</p>
                    <p className="text-[11px] text-slate-400">{t.userId?.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.propertyId ? (
                      <div>
                        <p className="font-semibold text-slate-900">{t.propertyId.title}</p>
                        <p className="text-[11px] text-teal-700 font-medium">
                          {formatINR(t.propertyId.monthlyRent)}/mo
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{t.emergencyContact?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {t.emergencyContact?.relationship} • {t.emergencyContact?.phone}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {t.identityProof?.idType || 'Aadhaar'} Verified
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Tenant Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Tenant"
        description="Creates a tenant resident profile and assigns an available property."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assign Unit
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">— Select Available Unit —</option>
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.city} - {formatINR(p.monthlyRent)}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Emergency Contact Information
            </span>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                required
                placeholder="Relationship"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="tel"
                required
                placeholder="Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Save Tenant Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
