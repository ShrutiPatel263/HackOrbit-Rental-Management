import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings,
  Package,
  Calendar,
  BarChart3,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRental } from '../../context/RentalContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useRental();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const userMenuItems = user?.role === 'admin' ? [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Admin Panel', path: '/admin', icon: Shield },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Profile', path: '/profile', icon: Settings }
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'My Bookings', path: '/bookings', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RentEase
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            {user && (
              <Link
                to="/checkout"
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                    >
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-gray-200"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium mb-1 ${
                    location.pathname === link.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg mt-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;