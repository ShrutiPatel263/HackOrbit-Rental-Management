import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Package,
  Download,
  Share2,
  Clock,
  Phone,
  Mail,
  Truck,
  Star
} from 'lucide-react';
import { rentalService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await rentalService.getBooking(id);
        setBooking(response.booking);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your rental has been successfully booked
          </p>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-lg font-semibold">Booking Details</h2>
                <p className="text-blue-100">Booking ID: {booking.bookingId || booking._id?.slice(-8)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${booking.totalAmount}</p>
                <p className="text-blue-100">Total Amount</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rental Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rental Information
                </h3>
                <div className="space-y-4">
                  {booking.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={item.product?.images?.[0] || `https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=100`}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product?.name || 'Product Name'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} | ${item.dailyRate}/day
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Rental Period</p>
                      <p className="text-sm">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {booking.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 text-gray-600">
                    <MapPin className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm">
                        {booking.deliveryInfo?.address}<br />
                        {booking.deliveryInfo?.city}, {booking.deliveryInfo?.state} {booking.deliveryInfo?.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Contact Number</p>
                      <p className="text-sm">{booking.deliveryInfo?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-600">
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Delivery Date</p>
                      <p className="text-sm">
                        {new Date(booking.deliveryInfo?.deliveryDate).toLocaleDateString()} 
                        ({booking.deliveryInfo?.deliveryTime})
                      </p>
                    </div>
                  </div>

                  {booking.deliveryInfo?.specialInstructions && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Special Instructions</p>
                      <p className="text-sm text-blue-700">{booking.deliveryInfo.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Order Processing</h4>
              <p className="text-sm text-gray-600">
                We're preparing your items and will confirm availability within 2 hours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery</h4>
              <p className="text-sm text-gray-600">
                Your items will be delivered on the scheduled date and time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Enjoy & Return</h4>
              <p className="text-sm text-gray-600">
                Use your rental and we'll pick it up when your rental period ends.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-6 text-white mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-300" />
                  <div>
                    <p className="font-medium">Call us</p>
                    <p className="text-blue-100">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-300" />
                  <div>
                    <p className="font-medium">Email us</p>
                    <p className="text-blue-100">support@rentease.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Important Notes</h3>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li>• You'll receive email updates about your booking</li>
                <li>• Our team will contact you before delivery</li>
                <li>• Keep your booking ID for reference</li>
                <li>• Items are insured during the rental period</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download Invoice</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
            <span>Share Booking</span>
          </button>
          
          <Link
            to="/dashboard"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>View All Bookings</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;