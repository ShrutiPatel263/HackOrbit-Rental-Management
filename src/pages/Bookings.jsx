import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package,
  Filter,
  Search,
  Eye,
  Download,
  Star,
  MessageCircle
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Bookings = () => {
  const { bookings, fetchBookings, loading } = useRental();
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      case 'cancelled': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Bookings
          </h1>
          <p className="text-gray-600">
            Track and manage all your rental bookings
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Product Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={booking.product?.images?.[0] || `https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=100`}
                          alt={booking.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {booking.product?.name || 'Product Name'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Booking ID: {booking.bookingId || booking._id?.slice(-8)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.deliveryAddress || 'Pickup Location'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col lg:items-end space-y-4">
                      <div className="flex items-center justify-between lg:justify-end space-x-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${booking.totalAmount || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Amount
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        
                        {booking.status === 'completed' && (
                          <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                            <Star className="h-4 w-4" />
                            <span>Rate</span>
                          </button>
                        )}
                        
                        <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                          <Download className="h-4 w-4" />
                          <span>Invoice</span>
                        </button>

                        {booking.status === 'active' && (
                          <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>Support</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Active Bookings */}
                  {booking.status === 'active' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Rental Progress</span>
                        <span>
                          {Math.max(0, Math.ceil((new Date(booking.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, 
                              ((new Date() - new Date(booking.startDate)) / 
                               (new Date(booking.endDate) - new Date(booking.startDate))) * 100
                            ))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No bookings found' : 'No bookings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Start exploring our products to make your first booking.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Browse Products
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bookings;