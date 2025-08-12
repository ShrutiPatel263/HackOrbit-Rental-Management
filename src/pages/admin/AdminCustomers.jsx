import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Mail, Phone, Calendar, Eye, Ban, CheckCircle2, Download } from 'lucide-react';
import { rentalService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const resp = await rentalService.getCustomers();
      setCustomers(resp.customers || []);
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    let list = customers;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((c) => (c.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    return list;
  }, [customers, searchTerm, statusFilter]);

  const exportCSV = () => {
    if (!filtered.length) {
      toast.error('No customers to export');
      return;
    }
    const header = ['Name', 'Email', 'Phone', 'Joined', 'Status', 'Bookings', 'Spent'];
    const rows = filtered.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
      c.status,
      c.totalBookings ?? 0,
      c.totalSpent ?? 0,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleView = (c) => toast.success(`Viewing ${c.name}`);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Customer Management</h1>
              <p className="text-gray-600">Browse, filter and manage your customers</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filtered.length ? (
              filtered.map((c, idx) => (
                <motion.div
                  key={c._id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-4">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{c.name || '—'}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1" /> {c.email || '—'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1" /> {c.phone || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 flex items-center justify-end">
                        <Calendar className="h-4 w-4 mr-1" /> Joined {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'active' ? 'bg-green-100 text-green-800' : c.status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {c.status || 'inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Bookings</p>
                      <p className="font-semibold text-gray-900">{c.totalBookings ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Spent</p>
                      <p className="font-semibold text-gray-900">₹{(c.totalSpent.toFixed(2) ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Booking</p>
                      <p className="font-semibold text-gray-900">{c.lastBookingAt ? new Date(c.lastBookingAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 md:justify-end">
                      <button onClick={() => handleView(c)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1">
                        <Eye className="h-4 w-4" /> <span>View</span>
                      </button>
                      {c.status !== 'banned' ? (
                        <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center space-x-1">
                          <Ban className="h-4 w-4" /> <span>Ban</span>
                        </button>
                      ) : (
                        <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center space-x-1">
                          <CheckCircle2 className="h-4 w-4" /> <span>Unban</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                No customers found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers; 