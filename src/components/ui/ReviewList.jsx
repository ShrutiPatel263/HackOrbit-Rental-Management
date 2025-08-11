import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Filter, SortAsc, SortDesc } from 'lucide-react';
import Review from './Review';

const ReviewList = ({ reviews = [], onReviewSubmit, productId, user }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // date, rating, helpful
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [filterRating, setFilterRating] = useState(0); // 0 = all ratings

  // Sort and filter reviews
  const getSortedReviews = () => {
    let filteredReviews = reviews;
    
    // Filter by rating
    if (filterRating > 0) {
      filteredReviews = reviews.filter(review => review.rating === filterRating);
    }
    
    // Sort reviews
    return filteredReviews.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date) - new Date(a.date);
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'helpful':
          comparison = (b.helpfulCount || 0) - (a.helpfulCount || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  };

  const sortedReviews = getSortedReviews();
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleHelpful = (reviewId, isHelpful) => {
    // TODO: Implement helpful/unhelpful functionality
    console.log('Marked review as', isHelpful ? 'helpful' : 'unhelpful', 'for review:', reviewId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
            <p className="text-gray-600 mt-1">{reviews.length} reviews</p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">out of 5</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 min-w-[60px]">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 min-w-[40px]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <div key={review.id || review._id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {review.userName?.charAt(0) || 'U'}
                  </span>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Helpful Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleHelpful(review.id || review._id, true)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpfulCount || 0})</span>
                    </button>
                    <button
                      onClick={() => handleHelpful(review.id || review._id, false)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not Helpful</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            {filterRating > 0 ? (
              <p>No reviews found for {filterRating} star rating.</p>
            ) : (
              <p>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <Review
          productId={productId}
          onReviewSubmit={onReviewSubmit}
          onClose={() => setShowReviewForm(false)}
          user={user}
        />
      )}
    </div>
  );
};

export default ReviewList;
