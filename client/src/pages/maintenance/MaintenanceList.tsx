import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { MaintenanceRequest, Property } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const MaintenanceList: React.FC = () => {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Raise ticket modal
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [raisePropertyId, setRaisePropertyId] = useState('');
  const [raiseCategory, setRaiseCategory] = useState('Plumbing');
  const [raisePriority, setRaisePriority] = useState('Medium');
  const [raiseDescription, setRaiseDescription] = useState('');

  // Status update modal (Manager/Admin/Owner)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState('Assigned');
  const [techName, setTechName] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter ? `/maintenance?status=${statusFilter}` : '/maintenance';
      const res = await api.get(url);
      setTickets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProperties();
  }, [statusFilter]);

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        propertyId: raisePropertyId || properties[0]?._id,
        category: raiseCategory,
        priority: raisePriority,
        description: raiseDescription,
      });
      alert('Maintenance complaint ticket logged successfully!');
      setShowRaiseModal(false);
      setRaiseDescription('');
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit ticket');
    }
  };

  const handleOpenUpdate = (ticket: MaintenanceRequest) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setTechName(ticket.assignedTechnician?.name || 'Local Service Tech');
    setTechPhone(ticket.assignedTechnician?.phone || '+91 98765 00000');
    setEstimatedCost(ticket.estimatedCost || 1000);
    setActualCost(ticket.actualCost || 0);
    setResolutionNotes(ticket.resolutionNotes || '');
    setShowUpdateModal(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      await api.patch(`/maintenance/${selectedTicket._id}/status`, {
        status: updateStatus,
        assignedTechnician: {
          name: techName,
          phone: techPhone,
          assignedDate: new Date(),
        },
        estimatedCost: Number(estimatedCost),
        actualCost: Number(actualCost),
        resolutionNotes,
      });
      alert('Ticket updated and resolution recorded.');
      setShowUpdateModal(false);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROPERTY_MANAGER' || user?.role === 'PROPERTY_OWNER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance & Repairs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve residential complaints, dispatch certified technicians, and log repair expenditures.
          </p>
        </div>

        <button
          onClick={() => setShowRaiseModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Raise Complaint Ticket
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st || 'All Tickets'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No maintenance tickets found</h3>
          <p className="text-xs text-slate-400 mt-1">All properties are in top operating condition.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col justify-between hover-lift"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono font-bold text-xs text-slate-800">{t.ticketNumber}</span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
                    {t.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{t.propertyId?.title || 'Unit'}</h4>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                    {t.description}
                  </p>
                </div>

                {t.assignedTechnician?.name && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                    <p className="font-semibold text-slate-800 flex items-center">
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      {t.assignedTechnician.name}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {t.assignedTechnician.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{formatDate(t.createdAt)}</span>

                {canManage ? (
                  <button
                    onClick={() => handleOpenUpdate(t)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-xs"
                  >
                    Manage / Dispatch
                  </button>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px]">Logged by tenant</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raise Complaint Modal */}
      <Modal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Raise Maintenance Ticket"
        description="Log an urgent or routine property repair request."
      >
        <form onSubmit={handleRaiseTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Property Unit
            </label>
            <select
              required
              value={raisePropertyId}
              onChange={(e) => setRaisePropertyId(e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={raiseCategory}
                onChange={(e) => setRaiseCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Appliance">Appliance</option>
                <option value="HVAC">AC / HVAC</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={raisePriority}
                onChange={(e) => setRaisePriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what needs repair..."
              value={raiseDescription}
              onChange={(e) => setRaiseDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRaiseModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update / Dispatch Ticket Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title={`Update Ticket ${selectedTicket?.ticketNumber}`}
        description="Dispatch technician and update resolution status and costs."
      >
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ticket Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved (Work Completed)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Technician Name
              </label>
              <input
                type="text"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Technician Phone
              </label>
              <input
                type="tel"
                value={techPhone}
                onChange={(e) => setTechPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Cost (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Actual Cost (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Fixed water diverter and replaced sealing washers."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpdateModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Save & Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
