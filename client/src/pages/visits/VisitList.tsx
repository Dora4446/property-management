import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, Mail, CheckCircle2, XCircle, Plus, Search, Building2 } from 'lucide-react';
import { PropertyVisit, Property } from '../../types';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const VisitList: React.FC = () => {
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const [visitsRes, propsRes] = await Promise.all([
        api.get('/visits'),
        api.get('/properties'),
      ]);
      setVisits(visitsRes.data.data || []);
      setProperties(propsRes.data.data || []);
      if (propsRes.data.data?.length > 0 && !propertyId) {
        setPropertyId(propsRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/visits/${id}/status`, { status });
      fetchVisits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update visit status');
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/visits', {
        propertyId: propertyId || properties[0]?._id,
        visitorName,
        visitorPhone,
        visitorEmail,
        visitDate,
        visitTime,
      });
      alert('Property visit scheduled successfully!');
      setIsScheduleOpen(false);
      setVisitorName('');
      setVisitorPhone('');
      setVisitorEmail('');
      setVisitDate('');
      fetchVisits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule showing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Visits & Showings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real Estate Agent desk: prospective tenant appointments and physical walkthrough schedules.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5 text-teal-400" />
          Schedule Client Showing
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : visits.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scheduled visits</h3>
          <p className="text-xs text-slate-400 mt-1">Visits booked by prospective clients will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{v.visitorName}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{v.visitorPhone}</p>
                    {v.visitorEmail && <p className="text-[11px] text-slate-400">{v.visitorEmail}</p>}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {v.propertyId?.title || 'Property'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-semibold text-slate-900">{formatDate(v.visitDate)}</span> at {v.visitTime}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {v.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(v._id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-[11px]"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(v._id, 'Cancelled')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold text-[11px]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Showing Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Client Showing"
        description="Book a property walkthrough and tour for an interested tenant."
      >
        <form onSubmit={handleCreateVisit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Property Unit
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.city}) - ₹{p.monthlyRent?.toLocaleString('en-IN')}/mo
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Visitor / Prospective Tenant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Verma"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (10 Digits)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
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
                placeholder="rahul@example.com"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Showing Date
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
                Preferred Time Slot
              </label>
              <select
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="10:00 AM">10:00 AM - Morning Slot</option>
                <option value="11:30 AM">11:30 AM - Morning Slot</option>
                <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                <option value="04:30 PM">04:30 PM - Evening Slot</option>
                <option value="06:00 PM">06:00 PM - Evening Slot</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Confirm Showing Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
