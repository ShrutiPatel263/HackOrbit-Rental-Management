import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Calendar, 
  MapPin, 
  Shield, 
  Truck, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { useRental } from '../context/RentalContext';
import { useAuth } from '../context/AuthContext';
import { rentalService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReviewList from '../components/ui/ReviewList';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useRental();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await rentalService.getProduct(id);
        setProduct(response.product || response);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setReviewsLoading(true);
      try {
        const response = await rentalService.getProductReviews(id);
        setReviews(response.reviews || []);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast.error('Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await rentalService.createReview(reviewData);
      if (response.success) {
        // Add the new review to the list
        setReviews(prevReviews => [response.review, ...prevReviews]);
        
        // Update product rating
        if (product) {
          const newReviews = [response.review, ...reviews];
          const avgRating = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
          setProduct(prev => ({
            ...prev,
            rating: Math.round(avgRating * 10) / 10
          }));
        }
        
        toast.success('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review');
      throw error;
    }
  };

  useEffect(() => {
    if (startDate && endDate && product) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        let rate = product.dailyRate;
        if (days >= 7 && product.weeklyRate) {
          const weeks = Math.floor(days / 7);
          const remainingDays = days % 7;
          rate = (weeks * product.weeklyRate) + (remainingDays * product.dailyRate);
        } else {
          rate = days * product.dailyRate;
        }
        setTotalPrice(rate * quantity);
      }
    }
  }, [startDate, endDate, quantity, product]);

  const handleAddToCart = () => {
    if (!startDate || !endDate) {
      toast.error('Please select rental dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    addToCart(product, startDate, endDate, quantity);
    toast.success('Added to cart successfully!');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (product?.images?.length - 1 || 0) ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (product?.images?.length - 1 || 0) : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [`https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800`];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-900">
                    {product.rating || '4.8'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount || '24'} reviews)
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    ${product.dailyRate}/day
                  </p>
                  {product.weeklyRate && (
                    <p className="text-lg text-gray-600">
                      ${product.weeklyRate}/week
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Location</p>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {product.location || 'New York'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Total Price */}
              {totalPrice > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Included
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Free Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Insurance Covered</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">24/7 Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Setup Assistance</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Specifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewList
            reviews={reviews}
            onReviewSubmit={handleReviewSubmit}
            productId={id}
            user={user}
          />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;