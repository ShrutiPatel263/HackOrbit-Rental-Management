import mongoose from 'mongoose';

const helpfulUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  isHelpful: {
    type: Boolean,
    required: true
  }
});

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [helpfulUserSchema]
}, {
  timestamps: true
});

// Compound index to ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
