import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReports from './pages/admin/AdminReports';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { user, loading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (user) return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            
            <Route path="/booking-confirmation/:id" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/products" element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/bookings" element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/customers" element={
              <ProtectedRoute adminOnly>
                <AdminCustomers />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reports" element={
              <ProtectedRoute adminOnly>
                <AdminReports />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;