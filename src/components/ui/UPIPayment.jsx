import React, { useState } from 'react';
import { rentalService } from '../../services/api';
import toast from 'react-hot-toast';

const UPIPayment = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  bookingId, 
  amount 
}) => {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUPISubmit = async (e) => {
    e.preventDefault();
    
    if (!upiId.trim()) {
      setError('Please enter a valid UPI ID');
      return;
    }

    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g., username@bank)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying UPI payment:', { bookingId, upiId, amount });
      
      const result = await rentalService.verifyUPIPayment({
        bookingId,
        upiId: upiId.trim(),
        amount
      });

      if (result.success) {
        toast.success('UPI payment verified successfully!');
        onSuccess({ id: bookingId, paymentMethod: 'upi', upiId: upiId.trim() });
        onClose();
      } else {
        setError('UPI payment verification failed');
      }
    } catch (err) {
      console.error('UPI payment verification error:', err);
      setError(err.message || 'Failed to verify UPI payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">UPI Payment</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 font-medium mb-2">💳 UPI Payment Details:</p>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Amount:</strong> ₹{amount}</p>
              <p><strong>Booking ID:</strong> {bookingId}</p>
            </div>
          </div>

          <form onSubmit={handleUPISubmit} className="space-y-4">
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your UPI ID (e.g., john@icici, sarah@hdfc)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !upiId.trim()}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying Payment...' : 'Verify UPI Payment'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p>💡 <strong>Note:</strong> This is a demo UPI payment system.</p>
            <p>Any valid UPI ID format will be accepted for testing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;
