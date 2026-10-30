import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  TrendingUp,
  Percent,
  Plus,
  FileSpreadsheet,
  Download,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { formatINR, formatDateTime } from '../../utils/formatters';
import api from '../../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0f172a', '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleGenerateInvoices = async () => {
    const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    try {
      const res = await api.post('/payments/generate-monthly', { month });
      alert(res.data.message || 'Generated invoices');
      fetchAnalytics();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error generating invoices');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/reports/export?type=payments', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics across all properties, leases, revenue collections, and tickets in India.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerateInvoices}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-subtle flex items-center"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-teal-600" />
            Generate Invoices
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-subtle flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-600" />
            Export CSV
          </button>
          <Link
            to="/properties"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Manage Units
          </Link>
        </div>
      </div>

      {/* Primary KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Rental Revenue"
          value={formatINR(data?.totalRevenue)}
          subtitle="Net collected rent this cycle"
          icon={TrendingUp}
          trend="+14.2% YoY"
          trendDirection="up"
          color="emerald"
        />
        <StatCard
          title="Pending / Overdue Rent"
          value={formatINR(data?.pendingRent)}
          subtitle="Outstanding invoices across units"
          icon={CreditCard}
          trend={data?.pendingRent > 0 ? 'Action required' : 'All clear'}
          trendDirection={data?.pendingRent > 0 ? 'down' : 'neutral'}
          color="amber"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${data?.occupancyRate || 0}%`}
          subtitle={`${data?.occupiedProperties || 0} occupied of ${data?.totalProperties || 0} units`}
          icon={Percent}
          trend={`${data?.vacantProperties || 0} vacant`}
          trendDirection="neutral"
          color="teal"
        />
        <StatCard
          title="Open Maintenance Tickets"
          value={data?.openTicketsCount || 0}
          subtitle="Active repair & service requests"
          icon={Wrench}
          trend={data?.openTicketsCount > 0 ? 'In progress' : 'Zero backlog'}
          trendDirection="neutral"
          color="rose"
        />
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Cash Flow (INR)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rental Income vs Maintenance Expenses</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">
              FY 2026-27
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRevenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(value), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue Collected" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Type Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Portfolio Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by asset class</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.propertyTypeChart || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.propertyTypeChart || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Units`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-100">
            {(data?.propertyTypeChart || []).map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-600 font-medium truncate">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & System Audits */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Platform Activities</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated event stream & system audits</p>
          </div>
          <span className="text-xs text-slate-400">Live feed</span>
        </div>

        <div className="divide-y divide-slate-100">
          {(data?.recentLogs || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent activities logged.</p>
          ) : (
            (data?.recentLogs || []).map((log: any) => (
              <div key={log._id} className="py-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{log.details}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    User: {log.userName} • Module: {log.module}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
