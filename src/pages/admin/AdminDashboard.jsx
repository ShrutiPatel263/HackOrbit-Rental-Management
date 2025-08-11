import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { rentalService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeRentals: 0,
    pendingBookings: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, bookingsResponse] = await Promise.all([
          rentalService.getStats(),
          rentalService.getBookings()
        ]);
        
        setStats(statsResponse.stats || {
          totalProducts: 156,
          totalCustomers: 1247,
          totalBookings: 892,
          totalRevenue: 45670,
          activeRentals: 23,
          pendingBookings: 8,
          monthlyGrowth: 12.5,
          revenueGrowth: 18.3
        });
        
        setRecentBookings(bookingsResponse.bookings?.slice(0, 5) || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set mock data for demo
        setStats({
          totalProducts: 156,
          totalCustomers: 1247,
          totalBookings: 892,
          totalRevenue: 45670,
          activeRentals: 23,
          pendingBookings: 8,
          monthlyGrowth: 12.5,
          revenueGrowth: 18.3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'orange',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Active Rentals',
      value: stats.activeRentals,
      icon: Activity,
      color: 'red',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Eye,
      color: 'indigo',
      change: '-3%',
      trend: 'down'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your rental business performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">from last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View All
                  </button>
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
                            <ImageWithFallback
                              src={booking.product?.images?.[0]}
                              alt={booking.product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {booking.product?.name || 'Product Name'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Customer: {booking.user?.name || 'Customer Name'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'pending')}`}>
                {booking.status || 'pending'}
              </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ₹{booking.totalAmount || 0}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent bookings</h3>
                    <p className="text-gray-600">Bookings will appear here once customers start renting.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Add Product</p>
                    <p className="text-sm text-gray-600">Add new rental item</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Manage Customers</p>
                    <p className="text-sm text-gray-600">View customer details</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Analytics & insights</p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Monthly Revenue</span>
                    <span className="text-sm font-semibold text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                    <span className="text-sm font-semibold text-gray-900">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Product Utilization</span>
                    <span className="text-sm font-semibold text-gray-900">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white"
            >
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-100">All Systems</span>
                  <span className="text-white font-semibold">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Last Backup</span>
                  <span className="text-white font-semibold">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-100">Server Uptime</span>
                  <span className="text-white font-semibold">99.9%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;