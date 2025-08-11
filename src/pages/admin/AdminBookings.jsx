import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  Check
} from 'lucide-react';
import { useRental } from '../../context/RentalContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

const statusToBadge = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AdminBookings = () => {
  const { bookings, fetchBookings, updateBooking, cancelBooking, loading } = useRental();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log bookings data whenever it changes
  useEffect(() => {
    console.log('AdminBookings - Bookings data updated:', bookings);
    if (bookings && bookings.length > 0) {
      console.log('Sample booking structure:', bookings[0]);
      console.log('Payment statuses:', bookings.map(b => ({
        id: b._id,
        paymentStatus: b.paymentStatus,
        status: b.status,
        paymentInfo: b.paymentInfo
      })));
    }
  }, [bookings]);

  // Auto-refresh bookings every 30 seconds to catch payment updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing bookings...');
      fetchBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    let list = bookings || [];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b) =>
        (b.product?.name || '').toLowerCase().includes(q) ||
        (b.user?.name || '').toLowerCase().includes(q) ||
        (b._id || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      list = list.filter((b) => (b.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    return list;
  }, [bookings, searchTerm, statusFilter]);

  const handleView = (booking) => {
    // Navigate to booking details page or open modal
    toast.success(`Viewing booking ${booking._id || ''}`);
    // You can add navigation here: navigate(`/admin/bookings/${booking._id}`);
  };

  const handleApprove = async (booking) => {
    try {
      await updateBooking(booking._id, { status: 'confirmed' });
      toast.success('Booking approved successfully');
    } catch (error) {
      toast.error('Failed to approve booking');
      console.error('Approve booking error:', error);
    }
  };

  const handleCancel = async (booking) => {
    try {
      await cancelBooking(booking._id);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Cancel booking error:', error);
    }
  };

  const handleExtend = async (booking) => {
    try {
      // Extend booking by 7 days
      const currentEndDate = new Date(booking.endDate);
      const newEndDate = new Date(currentEndDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      await updateBooking(booking._id, { 
        endDate: newEndDate.toISOString(),
        status: 'active'
      });
      toast.success('Booking extended successfully');
    } catch (error) {
      toast.error('Failed to extend booking');
      console.error('Extend booking error:', error);
    }
  };

  const handleForceRefresh = async () => {
    try {
      console.log('Force refreshing bookings...');
      await fetchBookings();
      toast.success('Bookings refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh bookings');
      console.error('Force refresh error:', error);
    }
  };

  const exportCSV = () => {
    if (!filteredBookings.length) {
      toast.error('No bookings to export');
      return;
    }

    const header = ['Booking ID', 'Product', 'Customer', 'Start Date', 'End Date', 'Status', 'Amount'];
    const rows = filteredBookings.map((b) => [
      b._id,
      b.product?.name,
      b.user?.name,
      b.startDate ? new Date(b.startDate).toLocaleDateString() : '',
      b.endDate ? new Date(b.endDate).toLocaleDateString() : '',
      b.status,
      b.totalAmount
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Bookings Management</h1>
              <p className="text-gray-600">Search, filter and manage all customer bookings</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleForceRefresh}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking ID, product or customer..."
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b, idx) => (
                    <motion.tr
                      key={b._id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{b._id || '—'}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 mr-3">
                            <ImageWithFallback
                              src={b.product?.images?.[0]}
                              alt={b.product?.name || 'Product'}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{b.product?.name || '—'}</div>
                            <div className="text-xs text-gray-500">{b.product?.category || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{b.user?.name || '—'}</div>
                        <div className="text-xs text-gray-500">{b.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{b.startDate ? new Date(b.startDate).toLocaleDateString() : '—'} → {b.endDate ? new Date(b.endDate).toLocaleDateString() : '—'}</div>
                        <div className="text-xs text-gray-500">{b.durationDays ? `${b.durationDays} days` : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900 font-semibold">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{(b.totalAmount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Payment: ✅ Paid 
                          {b.paymentInfo?.paymentMethod && ` (${b.paymentInfo.paymentMethod.toUpperCase()})`}
                          <br />
                          <span className="text-xs text-gray-400">
                            Status: {b.status || 'pending'} | 
                            Method: {b.paymentInfo?.paymentMethod || 'demo'} | 
                            Updated: {b.paymentInfo?.paidAt ? new Date(b.paymentInfo.paidAt).toLocaleTimeString() : 'now'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusToBadge(b.status || 'pending')}`}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleView(b)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          {b.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(b)}
                              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center space-x-1"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                          )}
                          {b.status === 'active' && (
                            <button 
                              onClick={() => handleExtend(b)}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-1"
                            >
                              <Clock className="h-4 w-4" />
                              <span>Extend</span>
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleCancel(b)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center space-x-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-12 text-center text-gray-500" colSpan={7}>
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings; 