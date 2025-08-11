import mongoose from 'mongoose';

const bookingItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

const bookingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  items: [bookingItemSchema],
  deliveryInfo: {
    type: Map,
    of: String
  },
  paymentInfo: {
    type: Map,
    of: String
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  user: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'processing', 'paid', 'failed'],
    default: 'unpaid'
  }
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
