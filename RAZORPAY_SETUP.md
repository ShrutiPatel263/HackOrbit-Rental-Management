# Razorpay Payment Integration Setup

This guide explains how to set up Razorpay payments in the HackOrbit Rental Management system.

## Backend Setup

### 1. Install Dependencies
The Razorpay package is already included in `backend/package.json`:
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with your Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_test_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Get Razorpay Test Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings > API Keys
3. Generate a new key pair for test mode
4. Copy the Key ID and Key Secret to your `.env` file

## Frontend Setup

### 1. Update Razorpay Key
In `src/components/ui/RazorpayPayment.jsx`, replace the test key with your actual key:

```javascript
const options = {
  key: 'rzp_test_your_actual_key_here', // Replace with your actual key
  // ... other options
};
```

## Test Mode Features

### 1. OTP Verification
- In test mode, any 6-digit number will be accepted as a valid OTP
- This simulates the real OTP verification flow without sending actual SMS

### 2. Test Card Numbers
Use these test card numbers for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Payment Flow

1. **User selects Razorpay** in checkout
2. **Creates booking** with pending payment status
3. **Redirects to Razorpay** payment gateway
4. **User enters card details** and completes payment
5. **Returns to app** with payment verification
6. **Shows OTP verification** (simulated in test mode)
7. **Confirms booking** after successful OTP verification

## API Endpoints

### Create Razorpay Order
```
POST /api/razorpay/create-order
Body: { bookingId, amount, currency }
```

### Verify Payment
```
POST /api/razorpay/verify-payment
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }
```

### Verify OTP (Test Mode)
```
POST /api/razorpay/verify-otp
Body: { otp, bookingId }
```

## Security Features

- Payment signature verification using HMAC SHA256
- User authentication required for all payment operations
- Booking ownership validation
- Secure payment status updates

## Production Considerations

1. **Use production keys** from Razorpay dashboard
2. **Implement proper error handling** and logging
3. **Add webhook support** for payment status updates
4. **Use HTTPS** in production
5. **Implement rate limiting** on payment endpoints
6. **Add payment analytics** and monitoring

## Troubleshooting

### Common Issues

1. **"Razorpay is not loaded"**
   - Check if the Razorpay script is loading properly
   - Verify internet connection

2. **"Invalid payment signature"**
   - Ensure you're using the correct secret key
   - Check if the signature is being generated correctly

3. **"Order creation failed"**
   - Verify Razorpay credentials
   - Check server logs for detailed error messages

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Support

For Razorpay-specific issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For application-specific issues, check the server logs and browser console for error messages.
