import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// File uploads storage (local disk for demo)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });
app.use('/uploads', express.static(uploadsDir));

// In-memory mock data
let products = [
  {
    _id: 'p1',
    name: 'Electric Drill',
    description: 'High-performance cordless electric drill suitable for all DIY tasks.',
    category: 'Tools',
    location: 'Chicago',
    dailyRate: 15,
    weeklyRate: 90,
    rating: 4.8,
    featured: true,
    images: ['https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p2',
    name: 'Ladder 10ft',
    description: 'Sturdy aluminum ladder perfect for indoor and outdoor use.',
    category: 'Tools',
    location: 'New York',
    dailyRate: 8,
    weeklyRate: 48,
    rating: 4.6,
    featured: true,
    images: ['https://images.pexels.com/photos/434654/pexels-photo-434654.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p3',
    name: 'Projector 1080p',
    description: 'Full HD projector ideal for presentations and movie nights.',
    category: 'Electronics',
    location: 'San Francisco',
    dailyRate: 25,
    weeklyRate: 150,
    rating: 4.7,
    featured: true,
    images: ['https://images.pexels.com/photos/6433188/pexels-photo-6433188.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p4',
    name: 'Cement Mixer',
    description: 'Reliable mixer suitable for small to medium construction jobs.',
    category: 'Construction Equipment',
    location: 'Houston',
    dailyRate: 45,
    weeklyRate: 270,
    rating: 4.5,
    featured: false,
    images: ['https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p5',
    name: 'PA Speaker',
    description: 'Powerful PA speaker system perfect for events and parties.',
    category: 'Event Supplies',
    location: 'Los Angeles',
    dailyRate: 30,
    weeklyRate: 180,
    rating: 4.9,
    featured: true,
    images: ['https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p6',
    name: 'DSLR Camera',
    description: 'Professional-grade DSLR camera with 24MP sensor.',
    category: 'Photography',
    location: 'Seattle',
    dailyRate: 40,
    weeklyRate: 240,
    rating: 4.8,
    featured: true,
    images: ['https://images.pexels.com/photos/51383/camera-lens-lens-reflection-51383.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p7',
    name: 'GoPro Action Camera',
    description: 'Waterproof 4K action camera with mounts and accessories.',
    category: 'Photography',
    location: 'Miami',
    dailyRate: 22,
    weeklyRate: 132,
    rating: 4.6,
    featured: true,
    images: ['https://images.pexels.com/photos/358043/pexels-photo-358043.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p8',
    name: 'Electric Chainsaw',
    description: 'Quiet, efficient chainsaw ideal for yard work and pruning.',
    category: 'Tools',
    location: 'Denver',
    dailyRate: 18,
    weeklyRate: 108,
    rating: 4.4,
    featured: false,
    images: ['https://images.pexels.com/photos/411622/pexels-photo-411622.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p9',
    name: 'Event Tent 20x30',
    description: 'Durable party tent suitable for weddings and outdoor events.',
    category: 'Event Supplies',
    location: 'Boston',
    dailyRate: 85,
    weeklyRate: 510,
    rating: 4.7,
    featured: true,
    images: ['https://images.pexels.com/photos/127371/pexels-photo-127371.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p10',
    name: 'Electric Scooter',
    description: 'Lightweight electric scooter with 25-mile range per charge.',
    category: 'Vehicles',
    location: 'San Diego',
    dailyRate: 28,
    weeklyRate: 168,
    rating: 4.5,
    featured: false,
    images: ['https://images.pexels.com/photos/14423/pexels-photo-14423.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p11',
    name: '50mm Prime Lens',
    description: 'Fast f/1.8 prime lens for portraits and low-light shooting.',
    category: 'Photography',
    location: 'Austin',
    dailyRate: 14,
    weeklyRate: 84,
    rating: 4.6,
    featured: true,
    images: ['https://images.pexels.com/photos/51383/camera-lens-lens-reflection-51383.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p12',
    name: 'Pressure Washer',
    description: '2000 PSI electric pressure washer for patios and driveways.',
    category: 'Tools',
    location: 'Atlanta',
    dailyRate: 20,
    weeklyRate: 120,
    rating: 4.5,
    featured: false,
    images: ['https://images.pexels.com/photos/4792495/pexels-photo-4792495.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p13',
    name: 'Camping Kit (4-person)',
    description: 'Includes tent, sleeping bags, stove, and lantern.',
    category: 'Sports Equipment',
    location: 'Portland',
    dailyRate: 26,
    weeklyRate: 156,
    rating: 4.7,
    featured: true,
    images: ['https://images.pexels.com/photos/761815/pexels-photo-761815.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p14',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable lumbar support with breathable mesh back.',
    category: 'Furniture',
    location: 'Chicago',
    dailyRate: 12,
    weeklyRate: 72,
    rating: 4.3,
    featured: false,
    images: ['https://images.pexels.com/photos/813691/pexels-photo-813691.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p15',
    name: 'Tile Cutter',
    description: 'Heavy-duty manual tile cutter for precise cuts.',
    category: 'Construction Equipment',
    location: 'Phoenix',
    dailyRate: 16,
    weeklyRate: 96,
    rating: 4.2,
    featured: false,
    images: ['https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p16',
    name: 'Audio Mixer 8-Channel',
    description: 'Compact mixer with effects for small events and bands.',
    category: 'Event Supplies',
    location: 'Los Angeles',
    dailyRate: 32,
    weeklyRate: 192,
    rating: 4.6,
    featured: true,
    images: ['https://images.pexels.com/photos/164712/pexels-photo-164712.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p17',
    name: '4K Camera Drone',
    description: 'Stabilized drone with 4K camera and GPS return to home.',
    category: 'Electronics',
    location: 'San Jose',
    dailyRate: 55,
    weeklyRate: 330,
    rating: 4.8,
    featured: true,
    images: ['https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
  {
    _id: 'p18',
    name: 'Mini Excavator',
    description: 'Compact excavator suitable for landscaping and trenching.',
    category: 'Construction Equipment',
    location: 'Dallas',
    dailyRate: 140,
    weeklyRate: 840,
    rating: 4.7,
    featured: false,
    images: ['https://images.pexels.com/photos/280014/pexels-photo-280014.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
];

// In-memory bookings store
let bookings = [];

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
app.get('/api/products', (req, res) => {
  const { featured, limit, search, category, minPrice, maxPrice, sortBy } = req.query;
  let result = [...products];

  if (featured === 'true') {
    result = result.filter((p) => p.featured);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((p) =>
      (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }
  if (category) {
    result = result.filter((p) => p.category === category);
  }
  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;
  if (Number.isFinite(min)) result = result.filter((p) => (p.dailyRate ?? 0) >= min);
  if (Number.isFinite(max)) result = result.filter((p) => (p.dailyRate ?? 0) <= max);

  if (sortBy === 'name') {
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy === 'price') {
    result.sort((a, b) => (a.dailyRate ?? 0) - (b.dailyRate ?? 0));
  } else if (sortBy === 'rating') {
    result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  const numericLimit = limit ? Number(limit) : undefined;
  if (numericLimit && Number.isFinite(numericLimit)) {
    result = result.slice(0, numericLimit);
  }
  res.json({ products: result });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json({ product });
});

// Create product
app.post('/api/products', (req, res) => {
  const body = req.body || {};
  const newProduct = {
    _id: `p${Date.now()}`,
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
  };
  products.unshift(newProduct);
  res.status(201).json({ product: newProduct });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });
  const current = products[index];
  const next = { ...current, ...req.body };
  products[index] = next;
  res.json({ product: next });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const before = products.length;
  products = products.filter((p) => p._id !== req.params.id);
  if (products.length === before) return res.status(404).json({ message: 'Product not found' });
  res.json({ success: true });
});

// Simple in-memory users store (for demo only)
const users = new Map();

// Seed demo users so the demo credentials on the login page work
users.set('demo@customer.com', {
  id: 'u_demo',
  name: 'Demo Customer',
  email: 'demo@customer.com',
  password: 'password123',
  role: 'customer',
});

users.set('admin@rentease.com', {
  id: 'u_admin',
  name: 'Admin User',
  email: 'admin@rentease.com',
  password: 'admin123',
  role: 'admin',
});

// Auth API (mock)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const user = {
    id: `u_${Math.random().toString(36).slice(2)}`,
    name: name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: 'customer',
  };
  users.set(normalizedEmail, { ...user, password: String(password).trim() });
  const token = `mock.${Buffer.from(normalizedEmail).toString('base64')}.token`;
  res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  const record = users.get(email);
  if (!record || record.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { password: _pw, ...user } = record;
  const token = `mock.${Buffer.from(email).toString('base64')}.token`;
  res.json({ token, user });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const record = users.get(email);
    if (!record) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { password: _pw, ...user } = record;
    return res.json({ user });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.put('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const record = users.get(email);
    if (!record) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const next = { ...record, ...req.body };
    users.set(email, next);
    const { password: _pw, ...user } = next;
    res.json({ user });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Simple auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const base64 = token.split('.')[1];
    const email = Buffer.from(base64, 'base64').toString('utf8');
    const record = users.get(email);
    if (!record) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: record.id, email: record.email, name: record.name, role: record.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
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
app.post('/api/bookings/check-availability', (req, res) => {
  const { productId, startDate, endDate, quantity = 1 } = req.body || {};
  const product = products.find((p) => p._id === productId);
  if (!product) return res.status(404).json({ available: false, message: 'Product not found' });
  const stock = Number(product.stock || 5);
  // Count overlapping reserved units
  let reserved = 0;
  bookings.forEach((b) => {
    (b.items || []).forEach((item) => {
      if (item.product === productId && isDateRangeOverlapping(item.startDate, item.endDate, startDate, endDate)) {
        reserved += Number(item.quantity || 1);
      }
    });
  });
  const availableUnits = Math.max(0, stock - reserved);
  const isAvailable = availableUnits >= Number(quantity || 1);
  res.json({ available: isAvailable, availableUnits });
});

// Bookings API
app.get('/api/bookings', requireAuth, (req, res) => {
  // Admin gets all; customer gets own
  const raw = req.user.role === 'admin' ? bookings : bookings.filter((b) => b.user?.id === req.user.id);
  const list = raw.map((b) => {
    const firstItem = (b.items || [])[0] || {};
    const product = products.find((p) => p._id === firstItem.product);
    return {
      ...b,
      startDate: firstItem.startDate,
      endDate: firstItem.endDate,
      product,
      items: (b.items || []).map((it) => ({ ...it, product: products.find((p) => p._id === it.product) || it.product }))
    };
  });
  res.json({ bookings: list });
});

app.get('/api/bookings/:id', requireAuth, (req, res) => {
  const raw = bookings.find((b) => b._id === req.params.id);
  if (!raw) return res.status(404).json({ message: 'Booking not found' });
  if (req.user.role !== 'admin' && raw.user?.id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const firstItem = (raw.items || [])[0] || {};
  const product = products.find((p) => p._id === firstItem.product);
  const booking = {
    ...raw,
    startDate: firstItem.startDate,
    endDate: firstItem.endDate,
    product,
    items: (raw.items || []).map((it) => ({ ...it, product: products.find((p) => p._id === it.product) || it.product }))
  };
  res.json({ booking });
});

app.post('/api/bookings', requireAuth, (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  // Basic availability validation per item
  for (const item of items) {
    const product = products.find((p) => p._id === item.product);
    if (!product) return res.status(400).json({ message: 'Invalid product' });
  }
  const totalAmount = Number(body.totalAmount) || items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.product);
    return sum + calculateRentalPriceForItem(product, item.startDate, item.endDate, item.quantity || 1);
  }, 0);

  const booking = {
    _id: `b_${Date.now()}`,
    status: 'pending',
    items,
    deliveryInfo: body.deliveryInfo || {},
    paymentInfo: body.paymentInfo || {},
    totalAmount,
    createdAt: new Date().toISOString(),
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
    paymentStatus: 'unpaid',
  };
  bookings.unshift(booking);
  const firstItem = (booking.items || [])[0] || {};
  const product = products.find((p) => p._id === firstItem.product);
  const enriched = {
    ...booking,
    startDate: firstItem.startDate,
    endDate: firstItem.endDate,
    product,
    items: (booking.items || []).map((it) => ({ ...it, product: products.find((p) => p._id === it.product) || it.product }))
  };
  res.status(201).json({ booking: enriched });
});

app.put('/api/bookings/:id', requireAuth, (req, res) => {
  const index = bookings.findIndex((b) => b._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });
  const current = bookings[index];
  if (req.user.role !== 'admin' && current.user?.id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const next = { ...current, ...req.body };
  bookings[index] = next;
  res.json({ booking: next });
});

app.put('/api/bookings/:id/cancel', requireAuth, (req, res) => {
  const index = bookings.findIndex((b) => b._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });
  const current = bookings[index];
  if (req.user.role !== 'admin' && current.user?.id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const next = { ...current, status: 'cancelled' };
  bookings[index] = next;
  res.json({ booking: next });
});

// Quotations
app.post('/api/quotations', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const detailed = items.map((item) => {
    const product = products.find((p) => p._id === item.product);
    const quantity = Number(item.quantity || 1);
    const lineTotal = product ? calculateRentalPriceForItem(product, item.startDate, item.endDate, quantity) : 0;
    return { ...item, lineTotal };
  });
  const subtotal = detailed.reduce((s, d) => s + (d.lineTotal || 0), 0);
  const tax = subtotal * 0.08;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;
  res.json({ quotation: { items: detailed, subtotal, tax, deliveryFee, total } });
});

// Payments (mock)
app.post('/api/payments/create', requireAuth, (req, res) => {
  const { bookingId, amount } = req.body || {};
  const booking = bookings.find((b) => b._id === bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const orderId = `order_${Date.now()}`;
  booking.paymentStatus = 'processing';
  res.json({ orderId, amount });
});

app.post('/api/payments/verify', requireAuth, (req, res) => {
  const { bookingId, success = true } = req.body || {};
  const booking = bookings.find((b) => b._id === bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.paymentStatus = success ? 'paid' : 'failed';
  if (success && booking.status === 'pending') booking.status = 'confirmed';
  res.json({ success: true, booking });
});

// Admin APIs
app.get('/api/admin/stats', requireAuth, requireAdmin, (_req, res) => {
  const totalProducts = products.length;
  const totalBookings = bookings.length;
  const totalCustomers = Array.from(users.values()).filter((u) => u.role !== 'admin').length;
  const totalRevenue = bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const activeRentals = bookings.filter((b) => b.status === 'confirmed' || b.status === 'active').length;
  res.json({
    stats: { totalProducts, totalBookings, totalCustomers, totalRevenue, pendingBookings, activeRentals }
  });
});

app.get('/api/admin/customers', requireAuth, requireAdmin, (_req, res) => {
  const customerUsers = Array.from(users.values()).filter((u) => u.role !== 'admin');
  const list = customerUsers.map((u) => {
    const custBookings = bookings.filter((b) => b.user?.email === u.email);
    const totalSpent = custBookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalAmount || 0), 0);
    const lastBooking = custBookings[0]?.createdAt;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      status: 'active',
      createdAt: u.createdAt || new Date().toISOString(),
      totalBookings: custBookings.length,
      totalSpent,
      lastBookingAt: lastBooking
    };
  });
  res.json({ customers: list });
});

app.get('/api/admin/reports', requireAuth, requireAdmin, (req, res) => {
  // Very simple report based on current memory stores
  const byStatus = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const byCategory = {};
  bookings.forEach((b) => {
    (b.items || []).forEach((it) => {
      const product = products.find((p) => p._id === it.product);
      const cat = product?.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
  });
  const revenueTotal = bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const byDay = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: Math.round(Math.random() * 3000) }));
  const topProducts = Object.entries(
    bookings.reduce((acc, b) => {
      (b.items || []).forEach((it) => {
        const name = products.find((p) => p._id === it.product)?.name || 'Unknown';
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
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});


