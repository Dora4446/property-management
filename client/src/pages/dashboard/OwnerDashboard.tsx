import React, { useEffect, useState } from 'react';
import { Building2, Users, IndianRupee, TrendingDown, CheckCircle2, Plus } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { formatINR } from '../../utils/formatters';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwnerStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Owner Portfolio Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track rental yield, tenant occupancies, and property operating expenses.
          </p>
        </div>
        <Link
          to="/properties"
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md flex items-center self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Property
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Owned Properties"
          value={data?.totalProperties || 0}
          subtitle={`${data?.occupiedProperties || 0} occupied • ${data?.vacantProperties || 0} vacant`}
          icon={Building2}
          color="navy"
        />
        <StatCard
          title="Monthly Rental Income"
          value={formatINR(data?.totalRevenue)}
          subtitle="Net received rental revenue"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Pending Rent Collection"
          value={formatINR(data?.pendingRent)}
          subtitle="Awaiting tenant payment"
          icon={IndianRupee}
          color="amber"
        />
        <StatCard
          title="Maintenance Expenses"
          value={formatINR(data?.totalExpenses)}
          subtitle="Repairs, utilities & taxes"
          icon={TrendingDown}
          color="rose"
        />
      </div>

      {/* Financial Health Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
        <h3 className="font-bold text-slate-900 text-base mb-2">Net Operating Income (NOI)</h3>
        <p className="text-xs text-slate-500 mb-6">Total rental income minus all documented property operating costs.</p>

        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Net Profit</span>
            <div className="text-3xl font-extrabold text-teal-700 mt-1">
              {formatINR(data?.netIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculated for current fiscal period across all owned units.
            </p>
          </div>

          <div className="flex space-x-3">
            <Link
              to="/payments"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 shadow-sm transition-colors"
            >
              View Rent Inflow
            </Link>
            <Link
              to="/expenses"
              className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors"
            >
              View Expense Ledger
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
