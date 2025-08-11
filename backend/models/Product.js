import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Other'
  },
  location: {
    type: String,
    default: 'New York'
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  weeklyRate: Number,
  monthlyRate: Number,
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: [String],
  specifications: {
    type: Map,
    of: String
  },
  availability: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
