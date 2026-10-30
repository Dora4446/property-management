import React, { useEffect, useState } from 'react';
import { FileText, Plus, Calendar, RefreshCw, XCircle, CheckCircle2, Search } from 'lucide-react';
import { RentalAgreement, Property, Tenant } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const AgreementList: React.FC = () => {
  const { user } = useAuthStore();
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create form
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    leaseStartDate: '2026-11-01',
    leaseEndDate: '2027-09-30',
    monthlyRent: 45000,
    securityDeposit: 200000,
    paymentDueDay: 5,
    termsAndConditions: 'Standard 11-month Indian residential tenancy agreement with 2 months notice period.',
  });

  const fetchAgreements = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/agreements');
      setAgreements(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [propsRes, tenantsRes] = await Promise.all([
        api.get('/properties'),
        api.get('/tenants'),
      ]);
      setProperties(propsRes.data.data || []);
      setTenants(tenantsRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAgreements();
    fetchDependencies();
  }, []);

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/agreements', formData);
      alert('Rental agreement created and activated!');
      setIsCreateOpen(false);
      fetchAgreements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create rental agreement');
    }
  };

  const handleRenew = async (id: string) => {
    const newEndDate = prompt('Enter new lease expiration date (YYYY-MM-DD):', '2027-10-31');
    if (!newEndDate) return;

    try {
      await api.post(`/agreements/${id}/renew`, { newEndDate });
      alert('Lease agreement renewed successfully!');
      fetchAgreements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew agreement');
    }
  };

  const handleTerminate = async (id: string, agreementNumber: string) => {
    if (!window.confirm(`Are you sure you want to terminate lease ${agreementNumber}? This will mark the property as Available.`)) return;

    try {
      await api.post(`/agreements/${id}/terminate`);
      alert('Lease terminated and unit released to available inventory.');
      fetchAgreements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to terminate agreement');
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'PROPERTY_OWNER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rental Agreements & Leases</h1>
          <p className="text-sm text-slate-500 mt-1">
            Digital 11-month lease contracts, rent due dates, security deposits, and renewal workflows.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Agreement
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : agreements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active rental agreements found</h3>
          <p className="text-xs text-slate-400 mt-1">Create a lease contract to link property and tenant.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Agreement #</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Resident Tenant</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Security Deposit</th>
                <th className="py-3 px-4">Lease Term</th>
                <th className="py-3 px-4">Status</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agreements.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {a.agreementNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {a.propertyId?.title || 'Property'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {a.tenantId?.userId?.name || 'Tenant'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-teal-700">
                    {formatINR(a.monthlyRent)}/mo
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatINR(a.securityDeposit)}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {formatDate(a.leaseStartDate)} to {formatDate(a.leaseEndDate)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={a.agreementStatus} />
                  </td>
                  {canManage && (
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {a.agreementStatus === 'Active' && (
                        <>
                          <button
                            onClick={() => handleRenew(a._id)}
                            className="p-1.5 text-teal-600 hover:text-teal-800 rounded-lg hover:bg-teal-50 transition-colors font-medium text-[11px]"
                            title="Renew Agreement"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => handleTerminate(a._id, a.agreementNumber)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium text-[11px]"
                            title="Terminate Lease"
                          >
                            Terminate
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Agreement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Digital Rental Agreement"
        description="Binds property to tenant and activates 11-month residential tenancy."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAgreement} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Property
              </label>
              <select
                required
                value={formData.propertyId}
                onChange={(e) => {
                  const prop = properties.find((p) => p._id === e.target.value);
                  setFormData({
                    ...formData,
                    propertyId: e.target.value,
                    monthlyRent: prop ? prop.monthlyRent : formData.monthlyRent,
                    securityDeposit: prop ? prop.securityDeposit : formData.securityDeposit,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">— Select Unit —</option>
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Tenant
              </label>
              <select
                required
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">— Select Tenant —</option>
                {tenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.userId?.name} ({t.userId?.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lease Start Date
              </label>
              <input
                type="date"
                required
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lease End Date
              </label>
              <input
                type="date"
                required
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Rent (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Security Deposit (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Day of Month
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={formData.paymentDueDay}
                onChange={(e) => setFormData({ ...formData, paymentDueDay: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Sign & Activate Agreement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
