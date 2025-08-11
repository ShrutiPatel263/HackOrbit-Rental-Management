import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Package, 
  Clock, 
  DollarSign,
  TrendingUp,
  Star,
  MapPin,
  ArrowRight,
  Plus,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRental } from '../context/RentalContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { bookings, fetchBookings, loading } = useRental();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeRentals: 0,
    totalSpent: 0,
    upcomingReturns: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      const now = new Date();
      const activeRentals = bookings.filter(booking => 
        booking.status === 'active' && 
        new Date(booking.startDate) <= now && 
        new Date(booking.endDate) >= now
      ).length;

      const upcomingReturns = bookings.filter(booking => {
        const endDate = new Date(booking.endDate);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0 && booking.status === 'active';
      }).length;

      const totalSpent = bookings.reduce((sum, booking) => 
        sum + (booking.totalAmount || 0), 0
      );

      setStats({
        totalBookings: bookings.length,
        activeRentals,
        totalSpent,
        upcomingReturns
      });
    }
  }, [bookings]);

  const recentBookings = bookings.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your rentals today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeRentals}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Currently in use</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSpent}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Lifetime spending</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Returns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingReturns}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Due within 7 days</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                  <Link
                    to="/bookings"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={booking.product?.images?.[0] || `https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=100`}
                              alt={booking.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {booking.product?.name || 'Product Name'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ${booking.totalAmount || 0}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">Start exploring our products to make your first booking.</p>
                    <Link
                      to="/products"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Browse Products</p>
                    <p className="text-sm text-gray-600">Find equipment to rent</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>

                <Link
                  to="/bookings"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">My Bookings</p>
                    <p className="text-sm text-gray-600">Manage your rentals</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Profile Settings</p>
                    <p className="text-sm text-gray-600">Update your information</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                {stats.upcomingReturns > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Upcoming Returns
                      </p>
                      <p className="text-sm text-gray-600">
                        You have {stats.upcomingReturns} item(s) due for return within 7 days.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Rate Your Experience
                    </p>
                    <p className="text-sm text-gray-600">
                      Help us improve by rating your recent rentals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New Location Available
                    </p>
                    <p className="text-sm text-gray-600">
                      We now serve your area with free delivery!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;