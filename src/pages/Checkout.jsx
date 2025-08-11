import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  MapPin, 
  Calendar, 
  Package,
  Trash2,
  Plus,
  Minus,
  Shield,
  Truck,
  Clock
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RazorpayPayment from '../components/ui/RazorpayPayment';
import toast from 'react-hot-toast';
import { rentalService } from '../services/api';

const Checkout = () => {
  const { cart, removeFromCart, updateCartQuantity, calculateTotal, createBooking, clearCart } = useRental();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    phone: user?.phone || '',
    deliveryDate: '',
    deliveryTime: 'morning',
    specialInstructions: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const subtotal = calculateTotal();
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/products');
    }
  }, [cart, navigate]);

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateCartQuantity(itemId, newQuantity);
    }
  };

  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      return cart.length > 0;
    } else if (stepNumber === 2) {
      return deliveryInfo.address && deliveryInfo.city && deliveryInfo.phone && deliveryInfo.deliveryDate;
    } else if (stepNumber === 3) {
      if (paymentInfo.method === 'card') {
        return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardName;
      }
      return true;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all payment information');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
          dailyRate: item.product.dailyRate
        })),
        deliveryInfo,
        paymentInfo: {
          method: paymentInfo.method,
          amount: total
        },
        totalAmount: total,
        subtotal,
        deliveryFee,
        tax
      };

      const result = await createBooking(bookingData, paymentInfo.method !== 'razorpay');
      
      if (paymentInfo.method === 'razorpay') {
        try {
          // Try to create Razorpay order using authenticated API client (adds Authorization header)
          const orderRes = await rentalService.createRazorpayOrder(result.booking._id, total);
          setCurrentBooking({
            ...result.booking,
            razorpayOrderId: orderRes?.orderId || null,
          });
          setShowRazorpay(true);
        } catch (err) {
          // Even if server fails (500), open the Razorpay modal and let it use client-side fallback
          console.error('Razorpay order creation failed, using fallback:', err);
          toast('Opening Razorpay test checkout...');
          setCurrentBooking({
            ...result.booking,
            razorpayOrderId: null,
          });
          setShowRazorpay(true);
        }
      } else {
        // For regular card payment, proceed as before
        toast.success('Booking created successfully!');
        navigate(`/booking-confirmation/${result.booking._id}`);
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Checkout
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {stepNumber === 1 && 'Review Items'}
                  {stepNumber === 2 && 'Delivery Info'}
                  {stepNumber === 3 && 'Payment'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Review Items */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Review Your Items
                </h2>
                
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || `https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=100`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          ${item.product.dailyRate}/day
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Delivery Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Delivery Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={deliveryInfo.address}
                          onChange={handleDeliveryChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={deliveryInfo.city}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={deliveryInfo.state}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter state"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={deliveryInfo.zipCode}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter ZIP code"
                      />
                    </div>

                    <div>
                      <label className="block text_sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={deliveryInfo.phone}
                        onChange={handleDeliveryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          name="deliveryDate"
                          value={deliveryInfo.deliveryDate}
                          onChange={handleDeliveryChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Time
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'morning', label: 'Morning (8AM - 12PM)', icon: Clock },
                        { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: Clock },
                        { value: 'evening', label: 'Evening (5PM - 8PM)', icon: Clock }
                      ].map((time) => (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() => setDeliveryInfo(prev => ({ ...prev, deliveryTime: time.value }))}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            deliveryInfo.deliveryTime === time.value
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <time.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {time.value.charAt(0).toUpperCase() + time.value.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {time.label.split('(')[1].replace(')', '')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={deliveryInfo.specialInstructions}
                      onChange={handleDeliveryChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Payment Information
                </h2>
                
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentInfo(prev => ({ ...prev, method: 'card' }))}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          paymentInfo.method === 'card'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Credit/Debit Card</span>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentInfo(prev => ({ ...prev, method: 'razorpay' }))}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          paymentInfo.method === 'razorpay'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Razorpay</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentInfo.method === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Razorpay Info */}
                  {paymentInfo.method === 'razorpay' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-blue-900">Secure Payment with Razorpay</h3>
                          <p className="text-sm text-blue-700">
                            You will be redirected to Razorpay's secure payment gateway to complete your transaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <span>Complete Booking</span>
                      <Shield className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items_center justify-between">
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Delivery Fee</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify_between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal < 500 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Add ${(500 - subtotal).toFixed(2)} more for free delivery!
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text_green-600" />
                  <span>All items insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Free pickup service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Razorpay Payment Modal */}
      {showRazorpay && (
        <RazorpayPayment
          isOpen={showRazorpay}
          onClose={() => setShowRazorpay(false)}
          onSuccess={(result) => {
            setShowRazorpay(false);
            clearCart(); // Clear cart after successful payment
            // Navigate to booking confirmation
            navigate('/booking-confirmation', { 
              state: { 
                booking: currentBooking,
                paymentSuccess: true 
              } 
            });
          }}
          orderData={{
            _id: currentBooking?._id || `booking_${Date.now()}`,
            amount: currentBooking?.totalAmount || 0,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            tax: tax,
            totalAmount: total,
            customerName: user?.fullName || 'Guest',
            customerEmail: user?.email || '',
            customerPhone: user?.phone || '',
            items: cart.map(item => ({
              product: item.product,
              startDate: item.startDate,
              endDate: item.endDate,
              quantity: item.quantity,
              dailyRate: item.product.dailyRate
            })),
            deliveryInfo: deliveryInfo,
            user: user,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: new Date().toISOString()
          }}
          bookingId={currentBooking?.id}
        />
      )}
    </div>
  );
};

export default Checkout;