import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock data
const products = [
  {
    _id: 'p1',
    name: 'Electric Drill',
    description: 'High-performance cordless electric drill suitable for all DIY tasks.',
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
    dailyRate: 40,
    weeklyRate: 240,
    rating: 4.8,
    featured: true,
    images: ['https://images.pexels.com/photos/51383/camera-lens-lens-reflection-51383.jpeg?auto=compress&cs=tinysrgb&w=400'],
  },
];

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'rental-backend', timestamp: new Date().toISOString() });
});

// Products API
app.get('/api/products', (req, res) => {
  const { featured, limit } = req.query;
  let result = products;
  if (featured === 'true') {
    result = result.filter((p) => p.featured);
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

// Simple in-memory users store (for demo only)
const users = new Map();

// Auth API (mock)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (users.has(email)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const user = {
    id: `u_${Math.random().toString(36).slice(2)}`,
    name: name || email.split('@')[0],
    email,
  };
  users.set(email, { ...user, password });
  const token = `mock.${Buffer.from(email).toString('base64')}.token`;
  res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});


