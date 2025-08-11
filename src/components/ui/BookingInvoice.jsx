import React from 'react';
import { Download, Printer, Calendar, MapPin, Package, User, CreditCard } from 'lucide-react';

const BookingInvoice = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    const dailyRate = booking.product?.dailyRate || 0;
    const days = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    const quantity = booking.items?.[0]?.quantity || 1;
    return dailyRate * days * quantity;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  };

  const handleDownload = () => {
    // Create a printable version of the invoice
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${booking.product?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info { margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .customer-info { margin-bottom: 30px; }
            .product-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .product-table th, .product-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .product-table th { background-color: #f8f9fa; }
            .totals { text-align: right; }
            .footer { margin-top: 50px; text-align: center; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RentEase</h1>
            <p>Comprehensive Rental Management</p>
          </div>
          
          <div class="company-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice Number:</strong> ${generateInvoiceNumber()}</p>
            <p><strong>Date:</strong> ${formatDate(new Date())}</p>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <h3>Bill To:</h3>
              <p><strong>${booking.user?.name || 'Customer'}</strong></p>
              <p>${booking.user?.email || 'Email not provided'}</p>
            </div>
            <div>
              <h3>Booking Details:</h3>
              <p><strong>Booking ID:</strong> ${booking._id}</p>
              <p><strong>Status:</strong> ${booking.status}</p>
              <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
            </div>
          </div>
          
          <table class="product-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Daily Rate</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.product?.name || 'Product'}</td>
                <td>${formatDate(booking.startDate)}</td>
                <td>${formatDate(booking.endDate)}</td>
                <td>${Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))}</td>
                <td>${formatCurrency(booking.product?.dailyRate || 0)}</td>
                <td>${booking.items?.[0]?.quantity || 1}</td>
                <td>${formatCurrency(calculateSubtotal())}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatCurrency(calculateSubtotal())}</p>
            <p><strong>Tax (8%):</strong> ${formatCurrency(calculateTax())}</p>
            <p><strong>Total:</strong> ${formatCurrency(booking.totalAmount || 0)}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing RentEase!</p>
            <p>For any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
              <p className="text-gray-600 mt-2">Invoice #{generateInvoiceNumber()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">RentEase</h1>
            <p className="text-gray-600">Comprehensive Rental Management</p>
            <p className="text-sm text-gray-500 mt-1">123 Rental Street, City, State 12345</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{booking.user?.name || 'Customer'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span>{booking.user?.email || 'Email not provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Invoice Details:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span><strong>Invoice #:</strong> {generateInvoiceNumber()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span><strong>Date:</strong> {formatDate(new Date())}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span><strong>Booking ID:</strong> {booking._id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="flex items-start space-x-4">
              <img
                src={booking.product?.images?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'}
                alt={booking.product?.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{booking.product?.name}</h4>
                <p className="text-gray-600 mb-3">{booking.product?.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{booking.product?.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">{booking.product?.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(booking.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(booking.endDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{booking.items?.[0]?.quantity || 1}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium">{booking.deliveryInfo?.pickupLocation || 'Store Pickup'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Daily Rate</span>
                <span className="font-medium">{formatCurrency(booking.product?.dailyRate || 0)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Rental Duration</span>
                <span className="font-medium">
                  {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">{booking.items?.[0]?.quantity || 1}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(booking.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-center text-gray-600">
              <p>Thank you for choosing RentEase!</p>
              <p className="text-sm">For any questions, please contact our support team.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingInvoice;
