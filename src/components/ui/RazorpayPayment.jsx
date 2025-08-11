import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { rentalService } from '../../services/api';
import toast from 'react-hot-toast';

const RazorpayPayment = ({ 
  bookingId, 
  amount, 
  currency = 'INR', 
  orderId: precreatedOrderId, // optional: pass if order already created in parent
  onSuccess, 
  onFailure,
  onClose 
}) => {
  const [step, setStep] = useState('init'); // init, processing, otp, success, failure
  const [orderId, setOrderId] = useState(precreatedOrderId || null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    if (precreatedOrderId) setOrderId(precreatedOrderId);
  }, [precreatedOrderId]);

  // Initialize Razorpay
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        // Load Razorpay script and wait for it
        await new Promise((resolve, reject) => {
          if (window.Razorpay) return resolve();
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        if (!isMounted) return;
        setIsScriptReady(true);

        // Fetch public key from backend (interceptor returns data directly)
        const keyRes = await rentalService.getRazorpayKey();
        if (!isMounted) return;
        setPublicKey(keyRes.key);
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
    if (!autoStarted && isScriptReady && publicKey && step === 'init') {
      setAutoStarted(true);
      if (orderId) {
        setStep('processing');
        initiatePayment({ orderId, amount, currency });
      } else {
        // Try to create order; will fallback and open Razorpay even if server fails
        createOrder();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptReady, publicKey, orderId, step, autoStarted]);

  const createOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isScriptReady || !window.Razorpay) {
        throw new Error('Razorpay not ready');
      }
      if (!publicKey) {
        throw new Error('Missing Razorpay key');
      }

      // Create order via backend (interceptor returns data directly)
      const orderRes = await rentalService.createRazorpayOrder(bookingId, amount);
      const newOrderId = orderRes.orderId;
      setOrderId(newOrderId);
      setStep('processing');
      initiatePayment({ orderId: newOrderId, amount: orderRes.amount, currency: orderRes.currency });
    } catch (error) {
      console.error('Order creation failed:', error);
      // Fallback: open Razorpay without server order to allow OTP demo flow
      try {
        setStep('processing');
        initiatePayment({ orderId: null, amount, currency });
        toast('Proceeding with test checkout (no order).');
      } catch (e2) {
        setError(typeof error === 'string' ? error : (error?.message || 'Failed to create payment order. Please try again.'));
        setStep('failure');
        onFailure && onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = (orderData) => {
    if (!window.Razorpay) {
      setError('Razorpay is not loaded. Please refresh the page.');
      setStep('failure');
      onFailure && onFailure(new Error('Razorpay not loaded'));
      return;
    }

    const options = {
      key: publicKey,
      amount: Math.round(orderData.amount * 100),
      currency: orderData.currency,
      name: 'HackOrbit Rentals',
      description: `Booking Payment - ${bookingId}`,
      ...(orderData.orderId ? { order_id: orderData.orderId } : {}),
      handler: async function (response) {
        try {
          if (orderData.orderId) {
            // Verify payment with backend only if order was created server-side
            const verifyRes = await rentalService.verifyRazorpayPayment({
              bookingId: bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setStep('otp');
            } else {
              setError('Payment verification failed');
              setStep('failure');
              onFailure && onFailure(new Error('Verification failed'));
            }
          } else {
            // No server order; continue to OTP step for demo/test
            setStep('otp');
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          setError('Payment verification failed. Please try again.');
          setStep('failure');
          onFailure && onFailure(err);
        }
      },
      prefill: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '9999999999'
      },
      notes: {
        bookingId: bookingId
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function () {
          setStep('failure');
          setError('Payment was cancelled');
          onFailure && onFailure(new Error('Payment cancelled'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const otpRes = await rentalService.verifyRazorpayOTP(otp, bookingId);
      
      if (otpRes.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess && onSuccess(otpRes.booking);
        }, 500);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep('init');
    setError('');
    setOtp('');
  };

  const renderStep = () => {
    switch (step) {
      case 'init':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payment with Razorpay
              </h3>
              <p className="text-gray-600">
                You will be redirected to Razorpay's secure payment gateway
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm text-gray-700">{bookingId}</span>
              </div>
            </div>

            <button
              onClick={orderId ? () => initiatePayment({ orderId, amount, currency }) : createOrder}
              disabled={loading || !isScriptReady || !publicKey}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Preparing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>{orderId ? 'Open Razorpay' : 'Proceed to Payment'}</span>
                </div>
              )}
            </button>
            {!isScriptReady && (
              <p className="text-xs text-gray-500 mt-2">Loading Razorpay...</p>
            )}
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600">
                Please complete your payment on Razorpay's secure page
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Secure Payment Gateway
                  </p>
                  <p className="text-xs text-blue-700">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'otp':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <Lock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verify OTP
              </h3>
              <p className="text-gray-600">
                Enter the 6-digit OTP sent to your registered mobile number
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="mt-4 text-sm text-gray-500">
              <p>For test mode, use any 6-digit number</p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600">
                Your booking has been confirmed
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900">
                    Booking Confirmed
                  </p>
                  <p className="text-xs text-green-700">
                    You will receive a confirmation email shortly
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Redirecting to booking confirmation...</p>
            </div>
          </motion.div>
        );

      case 'failure':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Something went wrong with your payment'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RazorpayPayment;
