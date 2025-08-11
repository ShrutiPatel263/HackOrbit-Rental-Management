import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB connection string - you can replace this with your local MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental_management';
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
