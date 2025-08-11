import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample products data (from your server.js)
const sampleProducts = [
  {
    name: 'Electric Drill',
    description: 'High-performance cordless electric drill suitable for all DIY tasks.',
    category: 'Tools',
    location: 'Chicago',
    dailyRate: 15,
    weeklyRate: 90,
    rating: 4.8,
    featured: true,
    images: ['https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=400&h=300&fit=crop'],
  },
  {
    name: 'Ladder 10ft',
    description: 'Sturdy aluminum ladder perfect for indoor and outdoor use.',
    category: 'Tools',
    location: 'New York',
    dailyRate: 8,
    weeklyRate: 48,
    rating: 4.6,
    featured: true,
    images: ['https://images.unsplash.com/photo-1581578734948-152db9ac4b5d?w=400&h=300&fit=crop'],
  },
  {
    name: 'Projector 1080p',
    description: 'Full HD projector ideal for presentations and movie nights.',
    category: 'Electronics',
    location: 'San Francisco',
    dailyRate: 25,
    weeklyRate: 150,
    rating: 4.7,
    featured: true,
    images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&h=300&fit=crop'],
  },
  {
    name: 'Cement Mixer',
    description: 'Reliable mixer suitable for small to medium construction jobs.',
    category: 'Construction Equipment',
    location: 'Houston',
    dailyRate: 45,
    weeklyRate: 270,
    rating: 4.5,
    featured: false,
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop'],
  },
  {
    name: 'PA Speaker',
    description: 'Powerful PA speaker system perfect for events and parties.',
    category: 'Event Supplies',
    location: 'Los Angeles',
    dailyRate: 30,
    weeklyRate: 180,
    rating: 4.9,
    featured: true,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'],
  },
  // {
  //   name: 'DSLR Camera',
  //   description: 'Professional-grade DSLR camera with 24MP sensor.',
  //   category: 'Photography',
  //   location: 'Seattle',
  //   dailyRate: 40,
  //   weeklyRate: 240,
  //   rating: 4.8,
  //   featured: true,
  //   images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop'],

  // },
  {
    name: 'GoPro Action Camera',
    description: 'Waterproof 4K action camera with mounts and accessories.',
    category: 'Photography',
    location: 'Miami',
    dailyRate: 22,
    weeklyRate: 132,
    rating: 4.6,
    featured: true,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
  },
  {
    name: 'Electric Chainsaw',
    description: 'Quiet, efficient chainsaw ideal for yard work and pruning.',
    category: 'Tools',
    location: 'Denver',
    dailyRate: 18,
    weeklyRate: 108,
    rating: 4.4,
    featured: false,
    images: ['https://images.unsplash.com/photo-1581578734948-152db9ac4b5d?w=400&h=300&fit=crop'],
  },
  {
    name: 'Event Tent 20x30',
    description: 'Durable party tent suitable for weddings and outdoor events.',
    category: 'Event Supplies',
    location: 'Boston',
    dailyRate: 85,
    weeklyRate: 510,
    rating: 4.7,
    featured: true,
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bbd0dc?w=400&h=300&fit=crop'],
  },
  {
    name: 'Electric Scooter',
    description: 'Lightweight electric scooter with 25-mile range per charge.',
    category: 'Vehicles',
    location: 'San Diego',
    dailyRate: 28,
    weeklyRate: 168,
    rating: 4.5,
    featured: false,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
  }
];

async function migrateData() {
  try {
    console.log('Starting data migration to MongoDB...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    
    // Migrate Users
    console.log('Migrating users...');
    const usersFile = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(usersFile)) {
      const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      const usersToInsert = Object.values(usersData).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: new Date()
      }));
      
      await User.insertMany(usersToInsert);
      console.log(`✅ Migrated ${usersToInsert.length} users`);
    } else {
      console.log('⚠️  No users.json file found, skipping user migration');
    }
    
    // Migrate Products
    console.log('Migrating products...');
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      stock: 5,
      availability: true
    }));
    
    await Product.insertMany(productsToInsert);
    console.log(`✅ Migrated ${productsToInsert.length} products`);
    
    // Create sample bookings (optional)
    console.log('Creating sample bookings...');
    const users = await User.find({ role: 'customer' }).limit(3);
    const products = await Product.find().limit(3);
    
    if (users.length > 0 && products.length > 0) {
      const sampleBookings = [
        {
          status: 'confirmed',
          items: [{
            product: products[0]._id,
            quantity: 1,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }],
          deliveryInfo: {
            address: '123 Main St, City',
            phone: '+1234567890'
          },
          totalAmount: 105,
          user: {
            id: users[0].id,
            name: users[0].name,
            email: users[0].email
          },
          paymentStatus: 'paid'
        }
      ];
      
      await Booking.insertMany(sampleBookings);
      console.log(`✅ Created ${sampleBookings.length} sample bookings`);
    }
    
    console.log('🎉 Data migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Products: ${await Product.countDocuments()}`);
    console.log(`- Bookings: ${await Booking.countDocuments()}`);
    console.log(`- Reviews: ${await Review.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateData();
