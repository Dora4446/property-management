import React, { useEffect, useState } from 'react';
import {
  Building2,
  Calendar,
  CreditCard,
  Wrench,
  Download,
  AlertCircle,
  CheckCircle2,
  Phone,
  Plus,
} from 'lucide-react';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const TenantDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);
  // New ticket state
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');

  const fetchTenantData = async () => {
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

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.property?._id) return;

    try {
      await api.post('/maintenance', {
        propertyId: data.property._id,
        category,
        priority,
        description,
      });
      alert('Maintenance request submitted to property manager.');
      setShowComplaintModal(false);
      setDescription('');
      fetchTenantData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit maintenance request');
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    window.open(`/api/payments/${paymentId}/receipt`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const prop = data?.property;
  const pending = data?.pendingPayment;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tenant Resident Portal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your rental unit, monthly invoices, lease agreement, and maintenance tickets.
        </p>
      </div>

      {/* Success Alert Banner if just paid */}
      {paymentSuccessData && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Rent Payment Successful: {formatINR(paymentSuccessData.amount)}
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Receipt #{paymentSuccessData.receiptNumber} generated for {paymentSuccessData.paymentMonth}.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReceipt(paymentSuccessData._id)}
            className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-colors shadow-sm flex items-center"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Receipt
          </button>
        </div>
      )}

      {/* Main Grid: Rental Unit Card & Rent Due Invoicing Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rented Property Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="h-56 w-full relative">
            <img
              src={
                prop?.images?.[0] ||
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
              }
              alt={prop?.title || 'Rented Unit'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs font-semibold px-2.5 py-1 bg-teal-500 text-slate-950 rounded-lg uppercase tracking-wider">
                  Active Rented Home
                </span>
                <h3 className="text-xl font-bold mt-2">{prop?.title || 'Assigned Property'}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {prop?.address}, {prop?.city} - {prop?.pincode}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-b border-slate-100 bg-slate-50/50">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Property Type</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{prop?.propertyType || 'Apartment'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Bedrooms</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{prop?.bedrooms || 0} BHK</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Built-Up Area</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{prop?.builtUpArea || 0} sq ft</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Monthly Rent</p>
              <p className="text-sm font-bold text-teal-700 mt-0.5">{formatINR(prop?.monthlyRent)}</p>
            </div>
          </div>

          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Lease Active: {formatDate(data?.tenant?.leaseStartDate)} to{' '}
                {formatDate(data?.tenant?.leaseEndDate)}
              </span>
            </div>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Raise Maintenance Ticket
            </button>
          </div>
        </div>

        {/* Rent Due / Payment Invoicing Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Current Rent Due</h3>
              <StatusBadge status={pending ? pending.status : 'Paid'} />
            </div>

            {pending ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">Billing Period: {pending.paymentMonth}</p>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">
                    {formatINR(pending.amount)}
                  </div>
                  <p className="text-xs text-amber-700 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    Due on {formatDate(pending.dueDate)}
                  </p>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Invoice #: <span className="font-semibold text-slate-800">{pending.invoiceNumber}</span></p>
                  <p>Accepted Modes: UPI, Cards, Net Banking, Razorpay</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">All Dues Cleared!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  No pending rent invoices for your active rental.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            {pending ? (
              <button
                onClick={() => setShowPayModal(true)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Rent ({formatINR(pending.amount)})</span>
              </button>
            ) : (
              <Link
                to="/payments"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center"
              >
                View Payment Receipts
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Payment History & Maintenance Tickets tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Payment History</h3>
            <Link to="/payments" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentPayments || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment history found.</p>
            ) : (
              (data?.recentPayments || []).map((p: any) => (
                <div key={p._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-900">{p.paymentMonth}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Invoice: {p.invoiceNumber} • Paid: {p.paidDate ? formatDate(p.paidDate) : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-900">{formatINR(p.amount)}</span>
                    {p.status === 'Paid' && (
                      <button
                        onClick={() => handleDownloadReceipt(p._id)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Download PDF Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Service Requests</h3>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Ticket
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.tickets || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active repair tickets.</p>
            ) : (
              (data?.tickets || []).map((t: any) => (
                <div key={t._id} className="py-3.5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{t.ticketNumber}</span>
                      <StatusBadge status={t.status} />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{t.description}</p>
                    {t.assignedTechnician?.name && (
                      <p className="text-[11px] text-teal-700 mt-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Technician: {t.assignedTechnician.name} ({t.assignedTechnician.phone})
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDate(t.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pay Rent Modal (Razorpay integration with UPI, Net Banking, Cards, and instant PDF Receipt) */}
      <RazorpayCheckoutModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        payment={pending}
        onPaymentSuccess={(updatedPayment) => {
          setPaymentSuccessData(updatedPayment);
          fetchTenantData();
          setShowPayModal(false);
        }}
      />

      {/* Raise Maintenance Complaint Modal */}
      <Modal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        title="Raise Maintenance Ticket"
        description="Submit a service request for plumbing, electrical, carpentry, or appliance repair."
      >
        <form onSubmit={handleRaiseComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Painting">Painting</option>
              <option value="Appliance">Appliance / Geyser</option>
              <option value="HVAC">AC / HVAC</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Low">Low (General Inquiry)</option>
              <option value="Medium">Medium (Standard Repair)</option>
              <option value="High">High (Impacting Daily Routine)</option>
              <option value="Urgent">Urgent (Water Leakage / Power Outage)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details of the issue (e.g. Master bathroom tap leaking continuously)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowComplaintModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
