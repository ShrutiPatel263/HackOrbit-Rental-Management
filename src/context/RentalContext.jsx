import React, { createContext, useContext, useState, useEffect } from 'react';
import { rentalService } from '../services/api';

const RentalContext = createContext();

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};

export const RentalProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToCart = (product, startDate, endDate, quantity = 1) => {
    const existingItem = cart.find(item => 
      item.product._id === product._id && 
      item.startDate === startDate && 
      item.endDate === endDate
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id && 
        item.startDate === startDate && 
        item.endDate === endDate
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        startDate,
        endDate,
        quantity,
        id: Date.now()
      }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const days = Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));
      return total + (item.product.dailyRate * days * item.quantity);
    }, 0);
  };

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await rentalService.getProducts(filters);
      setProducts(response.products);
      return response;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await rentalService.getBookings();
      setBookings(response.bookings);
      return response;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData, clearCartAfter = true) => {
    try {
      const response = await rentalService.createBooking(bookingData);
      if (clearCartAfter) {
        clearCart();
      }
      return response;
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId, updateData) => {
    try {
      const response = await rentalService.updateBooking(bookingId, updateData);
      await fetchBookings(); // Refresh bookings after update
      return response;
    } catch (error) {
      console.error('Failed to update booking:', error);
      throw error;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await rentalService.cancelBooking(bookingId);
      await fetchBookings(); // Refresh bookings after cancellation
      return response;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const value = {
    cart,
    products,
    bookings,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    calculateTotal,
    fetchProducts,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking
  };

  return (
    <RentalContext.Provider value={value}>
      {children}
    </RentalContext.Provider>
  );
};