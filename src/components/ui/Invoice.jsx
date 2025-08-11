import React from 'react';

const Invoice = ({ booking, paymentDetails, onClose, onDownload }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Invoice Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RentEase</h1>
              <p className="text-gray-600 mt-1">Your Trusted Rental Partner</p>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>123 Rental Street, Tech City</p>
                <p>Phone: +91 98765 43210</p>
                <p>Email: support@rentease.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
              <p className="text-gray-600 mt-2">Invoice #: {booking._id}</p>
              <p className="text-gray-600">Date: {formatDate(new Date())}</p>
              <p className="text-gray-600">Status: <span className="text-green-600 font-semibold">PAID</span></p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium">{booking.user?.fullName || booking.customerName || 'Guest User'}</p>
                <p>{booking.user?.email || booking.customerEmail || 'guest@example.com'}</p>
                <p>{booking.user?.phone || booking.customerPhone || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Information:</h3>
              <div className="space-y-1 text-gray-600">
                <p>{booking.deliveryInfo?.address || 'N/A'}</p>
                <p>{booking.deliveryInfo?.city || 'N/A'}, {booking.deliveryInfo?.state || 'N/A'}</p>
                <p>{booking.deliveryInfo?.zipCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Date:</p>
                <p className="font-medium">{formatDate(booking.items[0]?.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">End Date:</p>
                <p className="font-medium">{formatDate(booking.items[0]?.endDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-medium">{calculateDays(booking.items[0]?.startDate, booking.items[0]?.endDate)} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Items:</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">Item</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">Daily Rate</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">Quantity</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">Days</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.items?.map((item, index) => {
                  const days = calculateDays(item.startDate, item.endDate);
                  const itemTotal = item.dailyRate * days * item.quantity;
                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.product?.images?.[0] || 'https://via.placeholder.com/48x48'}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-500">{item.product?.category || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{formatCurrency(item.dailyRate)}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{days}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 font-medium">{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-medium">{formatCurrency(booking.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium">{formatCurrency(booking.tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-blue-600">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information:</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Method:</p>
                <p className="font-medium text-green-700">UPI via Razorpay</p>
              </div>
              <div>
                <p className="text-gray-600">Transaction ID:</p>
                <p className="font-medium">{paymentDetails?.razorpay_payment_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Order ID:</p>
                <p className="font-medium">{paymentDetails?.razorpay_order_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Date:</p>
                <p className="font-medium">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <p>Thank you for choosing RentEase!</p>
            <p className="mt-1">For any queries, please contact our support team</p>
            <p className="mt-1">This is a computer-generated invoice</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onDownload}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📥 Download Invoice
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
