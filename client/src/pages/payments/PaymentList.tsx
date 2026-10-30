import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Plus,
} from 'lucide-react';
import { Payment } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export const PaymentList: React.FC = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Manual payment recording modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [manualMethod, setManualMethod] = useState<'Cash' | 'Net Banking' | 'UPI' | 'Card'>('Net Banking');
  const [txnRef, setTxnRef] = useState('');
  const [notes, setNotes] = useState('');

  // Razorpay Pay modal for tenant/admin
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const url = statusFilter ? `/payments?status=${statusFilter}` : '/payments';
      const res = await api.get(url);
      setPayments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleDownloadPdf = (paymentId: string) => {
    window.open(`/api/payments/${paymentId}/receipt`, '_blank');
  };

  const handleOpenManualRecord = (p: Payment) => {
    setSelectedPayment(p);
    setTxnRef(`MAN-${Date.now().toString().slice(-6)}`);
    setShowManualModal(true);
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      await api.post('/payments/manual-record', {
        paymentId: selectedPayment._id,
        paymentMethod: manualMethod,
        transactionReference: txnRef,
        notes,
      });
      alert('Payment marked as paid successfully!');
      setShowManualModal(false);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handlePayViaRazorpay = (p: Payment) => {
    setSelectedPayment(p);
    setShowPayModal(true);
  };

  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const canManage = user?.role === 'ADMIN' || user?.role === 'PROPERTY_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rent & Payment Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track monthly invoices, overdue rents, Razorpay transactions, and official PDF receipts.
          </p>
        </div>

        <button
          onClick={() => window.open('/api/reports/export?type=payments', '_blank')}
          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-subtle transition-colors flex items-center self-start"
        >
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-teal-600" />
          Export Payments CSV
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rent Collected</p>
          <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatINR(totalCollected)}</h4>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues</p>
          <h4 className="text-2xl font-extrabold text-amber-600 mt-1">{formatINR(totalPending)}</h4>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoices Ledger</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{payments.length} Records</h4>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            statusFilter === '' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setStatusFilter('Paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            statusFilter === 'Paid' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            statusFilter === 'Pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('Overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            statusFilter === 'Overdue' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No rent invoices match criteria</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Property & Tenant</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{p.propertyId?.title || 'Unit'}</p>
                    <p className="text-[11px] text-slate-400">{p.tenantId?.userId?.name || 'Tenant'}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{p.paymentMonth}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatINR(p.amount)}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(p.dueDate)}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.paymentMethod || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {p.status === 'Paid' ? (
                      <button
                        onClick={() => handleDownloadPdf(p._id)}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg font-semibold text-[11px] inline-flex items-center"
                        title="Download Receipt"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Receipt
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePayViaRazorpay(p)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] shadow-sm inline-flex items-center"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay Online
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleOpenManualRecord(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center"
                          >
                            Manual Record
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Razorpay Online Pay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        payment={selectedPayment}
        onPaymentSuccess={() => {
          fetchPayments();
          setShowPayModal(false);
        }}
      />

      {/* Manual Payment Record Modal (Admin/Manager) */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Record Offline Rent Payment"
        description="Record cash, bank cheque, or RTGS received directly from tenant."
      >
        <form onSubmit={handleSubmitManual} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">Invoice:</span>{' '}
            <strong className="text-slate-900">{selectedPayment?.invoiceNumber}</strong> •{' '}
            <span className="text-slate-500">Amount:</span>{' '}
            <strong className="text-teal-700">{formatINR(selectedPayment?.amount)}</strong>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={manualMethod}
              onChange={(e: any) => setManualMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Net Banking">Net Banking (NEFT / RTGS / IMPS)</option>
              <option value="UPI">UPI Direct</option>
              <option value="Cash">Cash in Hand</option>
              <option value="Card">Bank Cheque / Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transaction Reference / Cheque #
            </label>
            <input
              type="text"
              required
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Deposited in HDFC Property Account #9910"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Confirm Offline Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
