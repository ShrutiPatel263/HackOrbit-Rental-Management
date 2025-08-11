import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import connectDB from './config/database.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_6FNI5mvEicv72q';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'your_test_secret_key_here';
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Test Razorpay configuration
app.get('/api/razorpay/test', async (req, res) => {
  try {
    console.log('Testing Razorpay configuration...');
    console.log('Key ID:', RAZORPAY_KEY_ID);
    console.log('Key Secret:', RAZORPAY_KEY_SECRET ? '***' + RAZORPAY_KEY_SECRET.slice(-4) : 'NOT SET');
    
    // Try to create a test order
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: 'test_order'
    });
    
    console.log('Test order created successfully:', testOrder);
    res.json({ 
      success: true, 
      message: 'Razorpay configuration is working',
      testOrder: testOrder.id
    });
  } catch (error) {
    console.error('Razorpay test failed:', error?.message || error);
    res.status(500).json({ 
      success: false, 
      message: 'Razorpay configuration failed',
      error: error?.message || 'Unknown error',
      details: 'Please check your RAZORPAY_KEY_SECRET environment variable'
    });
  }
});

// expose public key for frontend
app.get('/api/razorpay/key', (req, res) => {
  try {
    // Use the configured Razorpay key
    res.json({ key: RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Error getting Razorpay key:', error);
    // Fallback to the configured key
    res.json({ key: RAZORPAY_KEY_ID });
  }
});

app.use(cors());
app.use(express.json());

// File uploads storage (local disk for demo)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });
app.use('/uploads', express.static(uploadsDir));

// Database will be used instead of file-based user storage

// Database will be used instead of in-memory arrays
// Products, bookings, and reviews are now stored in MongoDB

// Helper: date overlap
function isDateRangeOverlapping(aStart, aEnd, bStart, bEnd) {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && bS < aE;
}

// Helper: pricing engine
function calculateRentalPriceForItem(product, startDate, endDate, quantity) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (!Number.isFinite(totalDays) || totalDays <= 0) return 0;

  let price = 0;
  if (product.monthlyRate && totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    const remainingAfterMonths = totalDays % 30;
    price += months * product.monthlyRate;
    // fall through to weekly/daily for remaining
    const weeks = Math.floor(remainingAfterMonths / 7);
    const remainingDays = remainingAfterMonths % 7;
    if (product.weeklyRate && weeks > 0) price += weeks * product.weeklyRate;
    price += remainingDays * product.dailyRate;
  } else if (product.weeklyRate && totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    price += weeks * product.weeklyRate + remainingDays * product.dailyRate;
  } else {
    price = totalDays * product.dailyRate;
  }
  return price * (quantity || 1);
}

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'rental-backend', timestamp: new Date().toISOString() });
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { featured, limit, search, category, minPrice, maxPrice, sortBy } = req.query;
    
    // Build query object
    let query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      const q = String(search).toLowerCase();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }
    
    // Build sort object
    let sort = {};
    if (sortBy === 'name') {
      sort.name = 1;
    } else if (sortBy === 'price') {
      sort.dailyRate = 1;
    } else if (sortBy === 'rating') {
      sort.rating = -1;
    }
    
    // Execute query
    let result = Product.find(query);
    
    if (Object.keys(sort).length > 0) {
      result = result.sort(sort);
    }
    
    if (limit) {
      const limitNum = Number(limit);
      if (Number.isFinite(limitNum)) {
        result = result.limit(limitNum);
      }
    }
    
    const products = await result.exec();
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body || {};
    const newProduct = new Product({
      name: body.name,
      description: body.description || '',
      category: body.category || 'Other',
      dailyRate: Number(body.dailyRate) || 0,
      weeklyRate: body.weeklyRate ? Number(body.weeklyRate) : undefined,
      monthlyRate: body.monthlyRate ? Number(body.monthlyRate) : undefined,
      location: body.location || 'New York',
      images: Array.isArray(body.images) ? body.images : [],
      specifications: body.specifications || {},
      availability: body.availability !== undefined ? !!body.availability : true,
      rating: body.rating || 4.5,
      featured: !!body.featured,
      stock: Number(body.stock) || 5,
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Auth API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const normalizedEmail = String(email).trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Auto-assign admin role for @rentease.com emails
    const isAdminEmail = normalizedEmail.includes('@rentease.com');
    const userRole = isAdminEmail ? 'admin' : 'customer';
    
    const user = new User({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: String(password).trim(),
      role: userRole,
    });
    
    const savedUser = await user.save();
    const { password: _pw, ...userWithoutPassword } = savedUser.toObject();
    
    // Add id field for frontend compatibility
    const userForResponse = {
      ...userWithoutPassword,
      id: savedUser._id.toString()
    };
    
    const token = `mock.${Buffer.from(normalizedEmail).toString('base64')}.token`;
    
    res.json({ token, user: userForResponse });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').trim();
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const { password: _pw, ...userWithoutPassword } = user.toObject();
    
    // Add id field for frontend compatibility
    const userForResponse = {
      ...userWithoutPassword,
      id: user._id.toString()
    };
    
    const token = `mock.${Buffer.from(email).toString('base64')}.token`;
    res.json({ token, user: userForResponse });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { password: _pw, ...userWithoutPassword } = user.toObject();
    
    // Add id field for frontend compatibility
    const userForResponse = {
      ...userWithoutPassword,
      id: user._id.toString()
    };
    
    return res.json({ user: userForResponse });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      req.body,
      { new: true, runValidators: true }
    );
    
    const { password: _pw, ...userWithoutPassword } = updatedUser.toObject();
    
    // Add id field for frontend compatibility
    const userForResponse = {
      ...userWithoutPassword,
      id: updatedUser._id.toString()
    };
    
    res.json({ user: userForResponse });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Helper function to check if user has admin privileges
function hasAdminPrivileges(user) {
  if (!user) return false;
  const isAdminRole = user.role === 'admin';
  const isAdminEmail = user.email && user.email.includes('@rentease.com');
  return isAdminRole || isAdminEmail;
}

// Simple auth middleware
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    req.user = { 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name, 
      fullName: user.fullName || user.name, // Include fullName for reviews
      role: user.role 
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  if (!hasAdminPrivileges(req.user)) {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  next();
}

// Upload API
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const relPath = `/uploads/${req.file.filename}`;
  const absUrl = `http://localhost:${PORT}${relPath}`;
  res.json({ url: absUrl, path: relPath });
});

// Availability check
app.post('/api/bookings/check-availability', async (req, res) => {
  try {
    const { productId, startDate, endDate, quantity = 1 } = req.body || {};
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ available: false, message: 'Product not found' });
    
    const stock = Number(product.stock || 5);
    // Count overlapping reserved units
    const overlappingBookings = await Booking.find({
      'items.product': productId,
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    let reserved = 0;
    overlappingBookings.forEach((b) => {
      (b.items || []).forEach((item) => {
        if (item.product.toString() === productId && isDateRangeOverlapping(item.startDate, item.endDate, startDate, endDate)) {
          reserved += Number(item.quantity || 1);
        }
      });
    });
    
    const availableUnits = Math.max(0, stock - reserved);
    const isAvailable = availableUnits >= Number(quantity || 1);
    res.json({ available: isAvailable, availableUnits });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
});

// Bookings API
app.get('/api/bookings', requireAuth, async (req, res) => {
  try {
    // Admin gets all; customer gets own
    const query = hasAdminPrivileges(req.user) ? {} : { 'user.id': req.user.id };
    const rawBookings = await Booking.find(query).sort({ createdAt: -1 });
    
    const list = await Promise.all(rawBookings.map(async (b) => {
      const firstItem = (b.items || [])[0] || {};
      const product = firstItem.product ? await Product.findById(firstItem.product) : null;
      
      return {
        ...b.toObject(),
        startDate: firstItem.startDate,
        endDate: firstItem.endDate,
        product,
        items: await Promise.all((b.items || []).map(async (it) => {
          const itemProduct = it.product ? await Product.findById(it.product) : null;
          return { ...it.toObject(), product: itemProduct };
        }))
      };
    }));
    
    res.json({ bookings: list });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const raw = await Booking.findById(req.params.id);
    if (!raw) return res.status(404).json({ message: 'Booking not found' });
    if (!hasAdminPrivileges(req.user) && raw.user?.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const firstItem = (raw.items || [])[0] || {};
    const product = firstItem.product ? await Product.findById(firstItem.product) : null;
    const booking = {
      ...raw.toObject(),
      startDate: firstItem.startDate,
      endDate: firstItem.endDate,
      product,
      items: await Promise.all((raw.items || []).map(async (it) => {
        const itemProduct = it.product ? await Product.findById(it.product) : null;
        return { ...it.toObject(), product: itemProduct };
      }))
    };
    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    
    // Basic availability validation per item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: 'Invalid product' });
    }
    
    const totalAmount = Number(body.totalAmount) || await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product);
      return calculateRentalPriceForItem(product, item.startDate, item.endDate, item.quantity || 1);
    })).then(amounts => amounts.reduce((sum, amount) => sum + amount, 0));

    const booking = new Booking({
      status: 'pending',
      items,
      deliveryInfo: body.deliveryInfo || {},
      paymentInfo: body.paymentInfo || {},
      totalAmount,
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
      paymentStatus: 'unpaid',
    });
    
    const savedBooking = await booking.save();
    
    const firstItem = (savedBooking.items || [])[0] || {};
    const product = firstItem.product ? await Product.findById(firstItem.product) : null;
    const enriched = {
      ...savedBooking.toObject(),
      startDate: firstItem.startDate,
      endDate: firstItem.endDate,
      product,
      items: await Promise.all((savedBooking.items || []).map(async (it) => {
        const itemProduct = it.product ? await Product.findById(it.product) : null;
        return { ...it.toObject(), product: itemProduct };
      }))
    };
    res.status(201).json({ booking: enriched });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.put('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!hasAdminPrivileges(req.user) && booking.user?.id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

app.put('/api/bookings/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!hasAdminPrivileges(req.user) && booking.user?.id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );
    
    res.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Quotations
app.post('/api/quotations', async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const detailed = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product);
      const quantity = Number(item.quantity || 1);
      const lineTotal = product ? calculateRentalPriceForItem(product, item.startDate, item.endDate, quantity) : 0;
      return { ...item, lineTotal };
    }));
    const subtotal = detailed.reduce((s, d) => s + (d.lineTotal || 0), 0);
    const tax = subtotal * 0.08;
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + deliveryFee;
    res.json({ quotation: { items: detailed, subtotal, tax, deliveryFee, total } });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ message: 'Error creating quotation' });
  }
});

// Payments (mock)
app.post('/api/payments/create', requireAuth, async (req, res) => {
  try {
    const { bookingId, amount } = req.body || {};
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    booking.paymentStatus = 'processing';
    await booking.save();
    
    const orderId = `order_${Date.now()}`;
    res.json({ orderId, amount });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment' });
  }
});

app.post('/api/payments/verify', requireAuth, async (req, res) => {
  try {
    const { bookingId, success = true } = req.body || {};
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    booking.paymentStatus = success ? 'paid' : 'failed';
    if (success && booking.status === 'pending') booking.status = 'confirmed';
    
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error processing payment verification' });
  }
});

// Review Endpoints
app.post('/api/reviews', requireAuth, async (req, res) => {
  try {
    console.log('Review submission request:', { body: req.body, user: req.user });
    
    const { productId, rating, title, comment } = req.body;
    
    if (!productId || !rating || !title || !comment) {
      console.log('Missing required fields:', { productId, rating, title, comment });
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      console.log('Invalid rating:', rating);
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId: productId,
      userId: req.user.id
    });

    if (existingReview) {
      console.log('User already reviewed this product:', { userId: req.user.id, productId });
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const newReview = new Review({
      productId,
      userId: req.user.id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      helpfulCount: 0,
      helpfulUsers: []
    });

    console.log('Creating new review:', newReview);
    const savedReview = await newReview.save();

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      const productReviews = await Review.find({ productId: productId });
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      product.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place
      await product.save();
      console.log('Updated product rating:', { productId, newRating: product.rating });
    }

    console.log('Review created successfully:', savedReview._id);
    res.status(201).json({ 
      success: true, 
      review: savedReview,
      message: 'Review submitted successfully' 
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const productReviews = await Review.find({ productId: productId });
    
    res.json({ 
      success: true, 
      reviews: productReviews,
      count: productReviews.length 
    });
  } catch (error) {
    console.error('Review fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

app.put('/api/reviews/:reviewId/helpful', requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user.id;
    const helpfulIndex = review.helpfulUsers.findIndex(u => u.userId === userId);
    
    if (helpfulIndex === -1) {
      // User hasn't voted yet
      review.helpfulUsers.push({ userId, isHelpful });
      if (isHelpful) {
        review.helpfulCount++;
      }
    } else {
      // User has already voted, update their vote
      const previousVote = review.helpfulUsers[helpfulIndex].isHelpful;
      if (previousVote !== isHelpful) {
        if (isHelpful) {
          review.helpfulCount++;
        } else {
          review.helpfulCount--;
        }
        review.helpfulUsers[helpfulIndex].isHelpful = isHelpful;
      }
    }

    await review.save();

    res.json({ 
      success: true, 
      helpfulCount: review.helpfulCount,
      message: 'Vote recorded successfully' 
    });
  } catch (error) {
    console.error('Review helpful update error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

app.delete('/api/reviews/:reviewId', requireAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    // Remove review
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    const product = await Product.findById(review.productId);
    if (product) {
      const productReviews = await Review.find({ productId: review.productId });
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = Math.round(avgRating * 10) / 10;
      } else {
        product.rating = 0;
      }
      await product.save();
    }

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Razorpay Payment Endpoints
app.post('/api/razorpay/create-order', requireAuth, async (req, res) => {
  try {
    console.log('Received order creation request:', req.body);
    const { bookingId, amount, currency = 'INR' } = req.body || {};

    if (!bookingId || !amount) {
      console.log('Missing required fields:', { bookingId, amount });
      return res.status(400).json({ message: 'Booking ID and amount are required' });
    }

    console.log('Creating order with:', { bookingId, amount, currency });

    // Find booking from database
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('Booking not found:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.id !== req.user.id) {
      console.log('User mismatch:', { bookingUser: booking.user.id, reqUser: req.user.id });
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        userId: req.user.id,
        userEmail: req.user.email
      }
    };

    console.log('Razorpay order options:', orderOptions);

    // Try real Razorpay order; if it fails, return error instead of mock order
    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
      console.log('Razorpay order created successfully:', order);
    } catch (err) {
      console.error('Razorpay API error:', err?.message || err);
      // Don't fall back to mock order - return error instead
      return res.status(500).json({ 
        message: 'Failed to create Razorpay order', 
        error: err?.message || 'Unknown error',
        details: 'Please check Razorpay configuration'
      });
    }

    // Save order details to booking
    booking.paymentInfo = {
      ...booking.paymentInfo,
      razorpayOrderId: order.id,
      amount,
      currency,
      status: 'pending'
    };
    booking.paymentStatus = 'processing';
    await booking.save();

    console.log('Sending response:', {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      bookingId
    });

    // Send response for frontend's initiatePayment()
    res.json({
      orderId: order.id,
      amount: order.amount / 100, // convert back to rupees
      currency: order.currency,
      bookingId
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error?.message || error);
    res.status(500).json({ 
      message: 'Internal server error during order creation',
      error: error?.message || 'Unknown error'
    });
  }
});


app.post('/api/razorpay/verify-payment', requireAuth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId,
      payment_method = 'card' // Add payment method parameter
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ message: 'Missing payment verification parameters' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // If mock order was issued, skip signature validation for demo
    if (!String(razorpay_order_id).startsWith('order_mock_')) {
      // Verify payment signature using env secret (HMAC-SHA256)
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    // Update booking status - for UPI payments, always mark as paid
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentInfo = {
      ...booking.paymentInfo,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentMethod: payment_method,
      status: 'completed',
      paidAt: new Date().toISOString(),
    };

    await booking.save();

    console.log(`Payment verified for booking ${bookingId} via ${payment_method}`);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Handle UPI payment verification (auto-approve for demo)
app.post('/api/razorpay/verify-upi', requireAuth, async (req, res) => {
  try {
    const { bookingId, upiId, amount } = req.body || {};
    
    if (!bookingId || !upiId || !amount) {
      return res.status(400).json({ message: 'Booking ID, UPI ID, and amount are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // For UPI payments, automatically mark as paid (simulating successful payment)
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentInfo = {
      ...booking.paymentInfo,
      paymentMethod: 'upi',
      upiId: upiId,
      amount: amount,
      status: 'completed',
      paidAt: new Date().toISOString()
    };

    await booking.save();

    console.log(`UPI payment verified for booking ${bookingId} via ${upiId}`);

    res.json({
      success: true,
      message: 'UPI payment verified successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('UPI payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify UPI payment' });
  }
});

// Simulate OTP verification for test mode
app.post('/api/razorpay/verify-otp', requireAuth, async (req, res) => {
  try {
    const { otp, bookingId } = req.body || {};
    
    if (!otp || !bookingId) {
      return res.status(400).json({ message: 'OTP and booking ID are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // For test mode, accept any 6-digit OTP
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      // Simulate successful OTP verification
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentInfo = {
        ...booking.paymentInfo,
        status: 'completed',
        otpVerified: true,
        paidAt: new Date().toISOString()
      };

      await booking.save();

      res.json({
        success: true,
        message: 'OTP verified successfully',
        booking: {
          id: booking._id,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP format' });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Admin APIs
app.get('/api/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    const paidBookings = await Booking.find({ paymentStatus: 'paid' });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const activeRentals = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'active'] } 
    });
    
    res.json({
      stats: { totalProducts, totalBookings, totalCustomers, totalRevenue, pendingBookings, activeRentals }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

app.get('/api/admin/customers', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const customerUsers = await User.find({ role: 'customer' });
    const list = await Promise.all(customerUsers.map(async (u) => {
      const custBookings = await Booking.find({ 'user.email': u.email });
      const totalSpent = custBookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((s, b) => s + (b.totalAmount || 0), 0);
      const lastBooking = custBookings[0]?.createdAt;
      
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        status: 'active',
        createdAt: u.createdAt || new Date().toISOString(),
        totalBookings: custBookings.length,
        totalSpent,
        lastBookingAt: lastBooking
      };
    }));
    res.json({ customers: list });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

app.get('/api/admin/reports', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get all bookings and products for reporting
    const bookings = await Booking.find();
    const products = await Product.find();
    
    // Very simple report based on database data
    const byStatus = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    
    const byCategory = {};
    bookings.forEach((b) => {
      (b.items || []).forEach((it) => {
        const product = products.find((p) => p._id.toString() === it.product.toString());
        const cat = product?.category || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
    });
    
    const revenueTotal = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((s, b) => s + (b.totalAmount || 0), 0);
    
    const byDay = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: Math.round(Math.random() * 3000) }));
    
    const topProducts = Object.entries(
      bookings.reduce((acc, b) => {
        (b.items || []).forEach((it) => {
          const product = products.find((p) => p._id.toString() === it.product.toString());
          const name = product?.name || 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
        });
        return acc;
      }, {})
    )
      .map(([name, bookingsCount]) => ({ name, bookings: bookingsCount, revenue: Math.round(Math.random() * 10000) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      report: {
        revenue: { total: revenueTotal, byDay },
        bookings: { total: bookings.length, byStatus, byCategory },
        topProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log('Connecting to MongoDB...');
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
});


