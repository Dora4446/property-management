import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  FileText,
  Wrench,
  IndianRupee,
  CalendarCheck,
  TrendingDown,
  Plus,
  ArrowRight,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagerData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Dual Ownership & Agent Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Operations & Portfolio Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Unified Manager
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Integrated Command Center: Property Ownership, Financial NOI, Real Estate Agent Showings, Leases & Maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <Link
            to="/visits"
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-subtle flex items-center"
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Schedule Showing
          </Link>
          <Link
            to="/expenses"
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-subtle flex items-center"
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            Log Expense
          </Link>
          <Link
            to="/properties"
            className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Primary KPI Strip (Covering Units, Income, Agent Visits, NOI, Maintenance, Pending Collections) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Portfolio Units"
          value={data?.totalProperties || 0}
          subtitle={`${data?.occupiedProperties || 0} occupied • ${data?.vacantProperties || 0} vacant`}
          icon={Building2}
          color="navy"
        />
        <StatCard
          title="Rental Income"
          value={formatINR(data?.totalRevenue)}
          subtitle="Collected monthly rent"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Net Operating Income"
          value={formatINR(data?.netIncome)}
          subtitle="Revenue minus expenses"
          icon={TrendingDown}
          color="teal"
        />
        <StatCard
          title="Agent Showings"
          value={data?.scheduledVisitsCount || 0}
          subtitle={`${data?.totalVisitsCount || 0} total client leads`}
          icon={CalendarCheck}
          color="navy"
        />
        <StatCard
          title="Maintenance Dues"
          value={data?.openTicketsCount || 0}
          subtitle="Open work orders"
          icon={Wrench}
          color="rose"
        />
        <StatCard
          title="Pending Rent"
          value={formatINR(data?.pendingRent)}
          subtitle="Uncollected invoices"
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Financial NOI & Operating Yield Banner (Property Owner Capability) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 rounded-full bg-teal-400 mr-2 animate-ping"></span>
              Owner Financial Overview & Yield
            </span>
            <h3 className="text-xl font-black tracking-tight text-white">
              Net Operating Income (NOI): {formatINR(data?.netIncome)}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consolidated real estate cash flow across all units. Calculates gross monthly rent receipts against documented property maintenance, taxes, and repairs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <div>
              <span className="text-slate-400 block text-[11px]">Gross Revenue</span>
              <strong className="text-emerald-400 text-sm font-bold block mt-0.5">
                {formatINR(data?.totalRevenue)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Expenses</span>
              <strong className="text-rose-400 text-sm font-bold block mt-0.5">
                {formatINR(data?.totalExpenses)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Occupancy Rate</span>
              <strong className="text-teal-300 text-sm font-bold block mt-0.5">
                {data?.occupancyRate || 0}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Section: Real Estate Agent Showings + Maintenance Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Estate Agent Desk: Upcoming Client Showings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <CalendarCheck className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-base">Client Showings & Tours</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prospective tenant property walkthroughs (Agent Desk)
                </p>
              </div>
              <Link
                to="/visits"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center"
              >
                View All ({data?.totalVisitsCount || 0}) →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {!data?.upcomingVisits || data.upcomingVisits.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p>No client showings currently scheduled.</p>
                  <Link
                    to="/visits"
                    className="mt-2 inline-block font-semibold text-teal-600 hover:underline"
                  >
                    + Schedule First Walkthrough
                  </Link>
                </div>
              ) : (
                data.upcomingVisits.slice(0, 4).map((v: any) => (
                  <div key={v._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{v.visitorName}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {v.propertyId?.title || 'Property Unit'} • {v.propertyId?.city || 'Bengaluru'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(v.visitDate)} at {v.visitTime}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <StatusBadge status={v.status} />
                      <a
                        href={`tel:${v.visitorPhone}`}
                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Available vacant units ready to showcase:</span>
            <strong className="text-teal-700 font-bold">{data?.vacantProperties || 0} units</strong>
          </div>
        </div>

        {/* Property Operations: Maintenance Work Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-base">Active Maintenance Work Orders</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tenant repair requests & technician assignments
                </p>
              </div>
              <Link
                to="/maintenance"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center"
              >
                View Desk →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {!data?.recentTickets || data.recentTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p>All units operating smoothly. No pending repair tickets.</p>
                </div>
              ) : (
                data.recentTickets.slice(0, 4).map((ticket: any) => (
                  <div key={ticket._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{ticket.category}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            ticket.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : ticket.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ticket.propertyId?.title || 'Unit'} • {ticket.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(ticket.createdAt)}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Requires technician attention:</span>
            <strong className="text-rose-600 font-bold">{data?.openTicketsCount || 0} tickets</strong>
          </div>
        </div>
      </div>

      {/* Unified Action Hubs (Owner + Agent + Manager) */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Integrated Operational Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/properties"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Property Portfolio & Listings</h4>
              <p className="text-xs text-slate-500 mt-1">
                Add properties, update monthly rents & deposits, manage photos, and monitor occupancy status.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-600 mt-4 flex items-center">
              Manage Inventory <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/visits"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Agent Client Showings & Leads</h4>
              <p className="text-xs text-slate-500 mt-1">
                Coordinate client walkthroughs, schedule showings, and convert prospective tenant inquiries.
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-600 mt-4 flex items-center">
              View Schedule <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/agreements"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">11-Month Rental Agreements</h4>
              <p className="text-xs text-slate-500 mt-1">
                Draft legal contracts, monitor upcoming 11-month lease expirations, and process renewals.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-600 mt-4 flex items-center">
              Draft & Renew <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/payments"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Rent Ledger & Razorpay Gateway</h4>
              <p className="text-xs text-slate-500 mt-1">
                Track monthly collections, record offline bank cheques/cash, and download digital PDF receipts.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-4 flex items-center">
              Open Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/expenses"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Property Operating Expenses</h4>
              <p className="text-xs text-slate-500 mt-1">
                Record repair bills, BBMP property taxes, building maintenance, and electricity overheads.
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-600 mt-4 flex items-center">
              Track Expenses <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>

          <Link
            to="/reports"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-card hover-lift flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Financial Analytics & Reports</h4>
              <p className="text-xs text-slate-500 mt-1">
                Analyze monthly yield trends, property occupancy rates, and export official CSV reports.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 mt-4 flex items-center">
              View Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
