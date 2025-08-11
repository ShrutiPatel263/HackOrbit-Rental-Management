import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Save,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPromotions: false,
    smsReminders: true,
    pushNotifications: true
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // API call to update password
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-3">
                  {user?.name}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h2>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            name="address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Security Settings
                  </h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {key === 'emailBookings' && 'Email Booking Updates'}
                            {key === 'emailPromotions' && 'Email Promotions'}
                            {key === 'smsReminders' && 'SMS Reminders'}
                            {key === 'pushNotifications' && 'Push Notifications'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'emailBookings' && 'Receive email updates about your bookings'}
                            {key === 'emailPromotions' && 'Receive promotional emails and offers'}
                            {key === 'smsReminders' && 'Get SMS reminders for upcoming returns'}
                            {key === 'pushNotifications' && 'Receive push notifications in your browser'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Billing Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Methods
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Manage your payment methods and billing preferences
                      </p>
                      <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;