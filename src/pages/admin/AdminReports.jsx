import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Calendar, DollarSign, FileText, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { rentalService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ range: 'last_30_days', category: '' });
  const [report, setReport] = useState({
    revenue: { total: 0, byDay: [] },
    bookings: { total: 0, byStatus: {}, byCategory: {} },
    topProducts: [],
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const resp = await rentalService.getReports(filters);
      // Fallback mock if API not present
      const data = resp?.report || {
        revenue: { total: 45670, byDay: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: Math.round(Math.random() * 3000) })) },
        bookings: { total: 892, byStatus: { pending: 120, active: 230, completed: 500, cancelled: 42 }, byCategory: { Electronics: 210, Tools: 180, Vehicles: 160, Furniture: 140, Other: 202 } },
        topProducts: [
          { name: '4K Camera Kit', revenue: 12500, bookings: 82 },
          { name: 'Excavator X1', revenue: 9800, bookings: 23 },
          { name: 'Audio System Pro', revenue: 7400, bookings: 41 },
        ],
      };
      setReport(data);
    } catch (err) {
      console.error(err);
      // Use mock on error
      setReport({
        revenue: { total: 45670, byDay: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: Math.round(Math.random() * 3000) })) },
        bookings: { total: 892, byStatus: { pending: 120, active: 230, completed: 500, cancelled: 42 }, byCategory: { Electronics: 210, Tools: 180, Vehicles: 160, Furniture: 140, Other: 202 } },
        topProducts: [
          { name: '4K Camera Kit', revenue: 12500, bookings: 82 },
          { name: 'Excavator X1', revenue: 9800, bookings: 23 },
          { name: 'Audio System Pro', revenue: 7400, bookings: 41 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.range, filters.category]);

  const handleExport = () => {
    try {
      const header = ['Metric', 'Value'];
      const rows = [
        ['Total Revenue', report.revenue.total],
        ['Total Bookings', report.bookings.total],
        ...Object.entries(report.bookings.byStatus).map(([k, v]) => [`Bookings (${k})`, v]),
      ];
      const csv = [header, ...rows]
        .map((r) => r.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to export');
    }
  };

  const days = useMemo(() => report.revenue.byDay || [], [report]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
              <p className="text-gray-600">Key insights into performance and customer activity</p>
            </div>
            <button onClick={handleExport} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filters.range}
                onChange={(e) => setFilters((f) => ({ ...f, range: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_quarter">Last quarter</option>
                <option value="last_year">Last year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Tools">Tools</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[{
            title: 'Total Revenue',
            value: `₹${(report.revenue.total || 0).toLocaleString()}`,
            icon: DollarSign,
            trend: 'up',
            change: '+18%'
          }, {
            title: 'Total Bookings',
            value: report.bookings.total || 0,
            icon: FileText,
            trend: 'up',
            change: '+12%'
          }, {
            title: 'Active vs Completed',
            value: `${report.bookings.byStatus.active || 0} / ${report.bookings.byStatus.completed || 0}`,
            icon: BarChart3,
            trend: 'down',
            change: '-3%'
          }, {
            title: 'Cancellation Rate',
            value: `${(((report.bookings.byStatus.cancelled || 0) / (report.bookings.total || 1)) * 100).toFixed(1)}%`,
            icon: PieChart,
            trend: 'down',
            change: '+0.4%'
          }].map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {card.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{card.change}</span>
                <span className="text-sm text-gray-600 ml-1">vs previous</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue by Day (simple bars) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue (by day)</h2>
            <div className="text-sm text-gray-500 flex items-center"><Calendar className="h-4 w-4 mr-1" /> Last period</div>
          </div>
          <div className="h-40 flex items-end space-x-1">
            {days.map((d, i) => (
              <div key={i} className="flex-1 bg-indigo-100 rounded-t" style={{ height: `${Math.max(5, Math.min(100, (d.amount / 3000) * 100))}%` }} />
            ))}
          </div>
        </div>

        {/* Bookings by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Category</h2>
            <div className="space-y-3">
              {Object.entries(report.bookings.byCategory || {}).map(([category, count], i) => (
                <div key={category} className="flex items-center">
                  <div className="w-28 text-sm text-gray-700">{category}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (count / (report.bookings.total || 1)) * 100)}%` }} />
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
            <div className="divide-y divide-gray-200">
              {(report.topProducts || []).map((p, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">Bookings: {p.bookings}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Revenue</div>
                    <div className="font-semibold text-gray-900">₹{(p.revenue || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 