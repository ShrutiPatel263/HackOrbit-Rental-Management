import React, { useState, useEffect } from 'react';
import { rentalService } from '../../services/api';

const RazorpayPayment = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  orderData, 
  bookingId 
}) => {
  const [step, setStep] = useState('init');
  const [orderId, setOrderId] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  // Initialize Razorpay
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        // Load Razorpay script using helper (as per docs)
        const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!ok) throw new Error('Razorpay SDK failed to load');
        if (!isMounted) return;
        setIsScriptReady(true);

        // Fetch public key from backend (interceptor returns data directly)
        const keyRes = await rentalService.getRazorpayKey();
        if (!isMounted) return;
        setPublicKey(keyRes.key);
        
        // If it's a mock key, we'll use fallback flow
        if (keyRes.mock) {
          console.log('Using mock Razorpay key, will use fallback flow');
        }
      } catch (e) {
        console.error('Failed to load Razorpay:', e);
        if (!isMounted) return;
        setError('Failed to load Razorpay. Please refresh and try again.');
        setIsScriptReady(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-start once script/key ready. If orderId exists, open directly; otherwise try createOrder (which falls back to client-only flow if server fails)
  useEffect(() => {
    if (!isScriptReady || !publicKey) return;
    
    // Always try to create order first, then open payment
    createOrder();
  }, [isScriptReady, publicKey]);

  // Separate effect to handle payment initiation after order is created
  useEffect(() => {
    if (orderId && step === 'init') {
      initiatePayment();
    }
  }, [orderId]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      // If already present
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    if (!orderData?.amount) {
      setError('Invalid order data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating Razorpay order...', { bookingId, amount: orderData.amount });
      const response = await rentalService.createRazorpayOrder({
        bookingId,
        amount: orderData.amount
      });
      
      console.log('Order creation response:', response);
      
      if (response?.orderId) {
        setOrderId(response.orderId);
      } else {
        setError('Failed to create order');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = () => {
    console.log('Initiating payment with:', { 
      windowRazorpay: !!window.Razorpay, 
      publicKey, 
      orderId, 
      amount: orderData.amount 
    });

    if (!window.Razorpay || !publicKey) {
      setError('Razorpay not ready');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const paise = Math.max(100, Math.round(Number(orderData.amount || 0) * 100));
      console.log('Amount in paise:', paise);
      
      const options = {
        key: publicKey,
        amount: paise,
        currency: 'INR',
        name: 'HackOrbit Rentals',
        description: `Booking #${bookingId}`,
        order_id: orderId, // Always include order_id since we should have real orders now
        handler: function (response) {
          console.log('Payment success:', response);
          verifyPayment(response);
        },
        prefill: {
          name: orderData.customerName || '',
          email: orderData.customerEmail || '',
          contact: orderData.customerPhone || ''
        },
        modal: {
          ondismiss: function () {
            console.log('Razorpay modal dismissed');
            setStep('init');
            onClose();
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      console.log('Razorpay options:', options);
      const rzp = new window.Razorpay(options);
      console.log('Razorpay instance created, opening...');
      rzp.open();
    } catch (err) {
      console.error('Failed to open Razorpay:', err);
      setError('Failed to open payment window');
      setStep('init');
    }
  };

  const verifyPayment = async (response) => {
    setStep('otp');
    setLoading(true);
    setError('');

    try {
      // Always verify with backend for real orders
      const result = await rentalService.verifyRazorpayPayment({
        ...response,
        bookingId
      });

      if (result.success) {
        setStep('success');
        onSuccess({ id: bookingId, ...response });
      } else {
        setError('Payment verification failed');
        setStep('init');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError('Payment verification failed');
      setStep('init');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await rentalService.verifyRazorpayOTP({
        bookingId,
        otp
      });

      if (result.success) {
        setStep('success');
        onSuccess({ id: bookingId });
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative" style={{ zIndex: 9999 }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {step === 'success' ? 'Payment Successful!' : 'Complete Payment'}
          </h2>

          {step === 'init' && (
            <div>
              <p className="text-gray-600 mb-4">
                Click the button below to proceed with Razorpay payment.
              </p>
              <button
                onClick={initiatePayment}
                disabled={!isScriptReady || !publicKey || loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Proceed to Payment'}
              </button>
              {!isScriptReady && (
                <p className="text-xs text-gray-500 mt-2">Loading Razorpay...</p>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div>
              <p className="text-gray-600 mb-4">
                Opening Razorpay payment window...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <button
                onClick={initiatePayment}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <p className="text-gray-600 mb-4">
                Please enter the OTP sent to your phone:
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-center text-lg tracking-widest"
                maxLength={6}
              />
              <button
                onClick={handleOTPSubmit}
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div>
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <p className="text-gray-600 mb-4">
                Your payment has been processed successfully!
              </p>
              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
              >
                Close
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
