# MongoDB Setup Guide

This guide will help you set up MongoDB for your rental management system.

## Prerequisites

1. **Install MongoDB** on your system:
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service**:
   - **Windows**: MongoDB should run as a service automatically
   - **macOS/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

## Setup Steps

### 1. Create Environment File

Create a `.env` file in the `backend` directory with your MongoDB connection:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rental_management

# Server Configuration
PORT=5000

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_6FNI5mvEicv72q
RAZORPAY_KEY_SECRET=your_test_secret_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Run Data Migration

Execute the migration script to transfer your existing data to MongoDB:

```bash
cd backend
npm run migrate
```

This will:
- Connect to your local MongoDB
- Create the database `rental_management`
- Migrate users from `data/users.json`
- Add sample products
- Create sample bookings

### 3. Verify Migration

After running the migration, you should see output like:

```
🎉 Data migration completed successfully!

📊 Migration Summary:
- Users: 6
- Products: 10
- Bookings: 1
- Reviews: 0
```

### 4. Test Connection

Start your server to test the MongoDB connection:

```bash
npm run dev
```

You should see: `MongoDB Connected: localhost`

## Database Structure

The migration creates the following collections:

- **users**: User accounts and authentication
- **products**: Rental items with pricing and details
- **bookings**: Rental reservations and orders
- **reviews**: Product reviews and ratings

## Troubleshooting

### Connection Issues

1. **MongoDB not running**: Start MongoDB service
2. **Wrong port**: Default MongoDB port is 27017
3. **Authentication**: If you have authentication enabled, update the connection string

### Migration Issues

1. **Permission errors**: Ensure MongoDB is running and accessible
2. **Data not migrated**: Check if `data/users.json` exists
3. **Duplicate data**: The migration script clears existing data first

## Next Steps

After successful migration:

1. Update your `server.js` to use MongoDB models instead of in-memory data
2. Test all API endpoints with the new database
3. Consider adding indexes for better performance
4. Set up proper authentication and authorization

## MongoDB Compass (Optional)

For visual database management, install [MongoDB Compass](https://www.mongodb.com/products/compass):

1. Download and install MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Browse the `rental_management` database
4. View and edit your data visually
