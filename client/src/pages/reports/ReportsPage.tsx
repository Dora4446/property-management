import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
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
  AreaChart,
  Area,
} from 'recharts';
import { formatINR } from '../../utils/formatters';
import api from '../../services/api';

const COLORS = ['#0f172a', '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, []);

  const handleExportPayments = () => {
    window.open('/api/reports/export?type=payments', '_blank');
  };

  const handleExportProperties = () => {
    window.open('/api/reports/export?type=properties', '_blank');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial & Occupancy Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual analytics powered by Recharts with CSV data export for audits and tax filing in India.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPayments}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-subtle flex items-center transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-teal-600" />
            Export Payments CSV
          </button>
          <button
            onClick={handleExportProperties}
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl shadow-md flex items-center transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Properties CSV
          </button>
        </div>
      </div>

      {/* Chart 1: Revenue vs Operating Expenses Area Trend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Cash Flow Growth (INR ₹)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rental Income vs Maintenance Expenses (Last 6 Months)</p>
          </div>
          <span className="text-xs font-bold text-teal-700 px-2.5 py-1 bg-teal-50 rounded-lg">
            Fiscal Period 2026
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyRevenueChart || []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [formatINR(val), '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Rent Collected"
                stroke="#0d9488"
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Property Operating Expenses"
                stroke="#f43f5e"
                fillOpacity={1}
                fill="url(#colorExp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
          <h3 className="font-bold text-slate-900 text-base">Payment Status Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Paid vs Pending vs Overdue Collections</p>

          <div className="h-60 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.paymentStatusChart || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Invoices`, name]}
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

          <div className="flex justify-around text-xs pt-3 border-t border-slate-100">
            <span className="flex items-center text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
              Paid
            </span>
            <span className="flex items-center text-amber-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
              Pending
            </span>
            <span className="flex items-center text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />
              Overdue
            </span>
          </div>
        </div>

        {/* Occupancy Rate Bar Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Unit Occupancy Dynamics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Occupied, Available, and Maintenance breakdown</p>
          </div>

          <div className="my-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Occupied Units ({data?.occupiedProperties || 0})</span>
                <span className="text-teal-700">{data?.occupancyRate || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all"
                  style={{ width: `${data?.occupancyRate || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Vacant / Available Units ({data?.vacantProperties || 0})</span>
                <span className="text-slate-600">
                  {data?.totalProperties
                    ? Math.round((data.vacantProperties / data.totalProperties) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-slate-400 h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      data?.totalProperties
                        ? (data.vacantProperties / data.totalProperties) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
            <strong>Target Occupancy:</strong> 92% benchmark for Indian Metro residential portfolios. Currently operating at healthy capacity.
          </div>
        </div>
      </div>
    </div>
  );
};
