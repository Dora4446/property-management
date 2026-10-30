import React, { useEffect, useState } from 'react';
import { TrendingDown, Plus, IndianRupee, Trash2, Calendar, FileText } from 'lucide-react';
import { Expense, Property } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    category: 'Maintenance',
    title: '',
    amount: 5000,
    paidTo: '',
    paymentMethod: 'Net Banking',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [expRes, sumRes, propsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
        api.get('/properties'),
      ]);
      setExpenses(expRes.data.data || []);
      setSummary(sumRes.data.data);
      setProperties(propsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
        propertyId: formData.propertyId || properties[0]?._id,
      });
      alert('Expense recorded successfully!');
      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Expenses & Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track society maintenance, utility bills, municipality taxes, and contractor fees in INR.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Record Expense
        </button>
      </div>

      {/* Financial Health Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Rental Income</p>
          <h3 className="text-2xl font-black text-teal-700 mt-1">{formatINR(summary?.totalIncome)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Settled invoices</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{formatINR(summary?.totalExpenses)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Maintenance, taxes & utilities</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Operating Income (NOI)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatINR(summary?.netIncome)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Net profit after all costs</p>
        </div>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No operational expenses recorded</h3>
          <p className="text-xs text-slate-400 mt-1">Record property maintenance or taxes to track net profit.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{e.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{e.propertyId?.title || 'General'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{e.paidTo}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-600">{formatINR(e.amount)}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(e.expenseDate)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Property Expense"
        description="Log vendor payments, municipal taxes, electricity/water bills, or repair costs."
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Property
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Maintenance">Maintenance & Repairs</option>
                <option value="Utility">Electricity / Water / Gas</option>
                <option value="Property Tax">BBMP / Municipal Property Tax</option>
                <option value="Insurance">Property Insurance</option>
                <option value="Management Fee">Management & Agency Fee</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount (INR ₹)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expense Title / Purpose
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lift Servicing Q3 or BESCOM Commercial Meter"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Paid To (Vendor / Entity)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Otis Elevators India"
                value={formData.paidTo}
                onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Net Banking">Net Banking / RTGS</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Log Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
