import React, { useEffect, useState } from 'react';
import { Calendar, Building2, Users, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export const AgentDashboard: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const [visitsRes, propsRes] = await Promise.all([
          api.get('/visits'),
          api.get('/properties?status=Available'),
        ]);
        setVisits(visitsRes.data.data || []);
        setProperties(propsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgentData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const scheduledVisits = visits.filter((v) => v.status === 'Scheduled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Real Estate Agent Portal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Coordinate client showings, follow up on prospective tenant leads, and showcase available units.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Scheduled Property Visits"
          value={scheduledVisits.length}
          subtitle="Showings booked this week"
          icon={Calendar}
          color="teal"
        />
        <StatCard
          title="Available Inventory"
          value={properties.length}
          subtitle="Vacant units ready for lease"
          icon={Building2}
          color="navy"
        />
        <StatCard
          title="Total Visit Inquiries"
          value={visits.length}
          subtitle="All-time prospective leads"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Scheduled Showings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Upcoming Client Showings</h3>
            <p className="text-xs text-slate-400 mt-0.5">Assigned prospective tenants</p>
          </div>
          <Link
            to="/visits"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            View All Showings →
          </Link>
        </div>

        {visits.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No visits scheduled yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visits.slice(0, 5).map((v) => (
              <div key={v._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-900">{v.visitorName}</p>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Property: <span className="font-medium text-slate-700">{v.propertyId?.title || 'Unit'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Phone: {v.visitorPhone}</p>
                </div>

                <div className="text-xs text-slate-600 flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {formatDate(v.visitDate)} at {v.visitTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
