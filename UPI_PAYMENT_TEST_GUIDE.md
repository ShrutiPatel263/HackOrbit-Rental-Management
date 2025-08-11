# UPI Payment Test Guide

## Overview
This guide will help you test the UPI payment system and ensure that payment statuses are correctly displayed in the admin panel.

## Prerequisites
1. Make sure your MongoDB server is running
2. Ensure your backend server is running (`npm run dev` in backend folder)
3. Make sure your frontend is running (`npm run dev` in root folder)

## Step-by-Step Testing

### 1. Initial Setup Check
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Navigate to the admin panel (`/admin/bookings`)
4. Check the console for debug logs showing:
   - "AdminBookings - Bookings data updated: [...]"
   - "Sample booking structure: {...}"
   - "Payment statuses: [...]"

### 2. Create a Test Booking
1. Go to `/products` and add a product to cart
2. Proceed to checkout
3. Fill in delivery information
4. Select "UPI Payment" as payment method
5. Complete the checkout process

### 3. Test UPI Payment
1. In the UPI payment modal, enter any valid UPI ID (e.g., `test@upi`)
2. Click "Verify UPI Payment"
3. Check the console for:
   - "UPI payment successful, refreshing bookings..."
   - "Bookings refreshed after UPI payment"
   - "Delayed refresh after UPI payment..."
   - "Delayed refresh completed"

### 4. Verify Admin Panel Update
1. Go to the admin panel (`/admin/bookings`)
2. Look for your test booking
3. Check the payment status - it should show "✅ Paid (UPI)"
4. Check the additional debug info below:
   - Status: confirmed
   - Method: upi
   - Updated: [timestamp]

### 5. Manual Refresh Test
1. Click the "Refresh" button in the admin panel
2. Check console for "Force refreshing bookings..."
3. Verify the payment status is still correct

## Debugging Information

### Frontend Console Logs
The following logs should appear in your browser console:

**AdminBookings Component:**
- `AdminBookings - Bookings data updated: [...]`
- `Sample booking structure: {...}`
- `Payment statuses: [...]`
- `Auto-refreshing bookings...` (every 30 seconds)

**RentalContext:**
- `RentalContext - Fetching bookings...`
- `RentalContext - Received bookings response: {...}`
- `RentalContext - Setting bookings: [...]`

**Checkout Component:**
- `UPI payment successful, refreshing bookings...`
- `Bookings refreshed after UPI payment`
- `Delayed refresh after UPI payment...`
- `Delayed refresh completed`

### Backend Console Logs
The following logs should appear in your backend terminal:

**UPI Verification:**
- `UPI verification request: { bookingId: "...", upiId: "...", amount: ... }`
- `Found booking before update: {...}`
- `Updating booking with new data: {...}`
- `UPI payment verified for booking ... via ...`
- `Updated booking after save: {...}`

**Bookings Fetch:**
- `Fetching bookings for user: ... Admin privileges: ...`
- `Query for bookings: {...}`
- `Raw bookings found: ...`
- `Sample raw booking: {...}`
- `Processed bookings count: ...`
- `Sample processed booking: {...}`

## Troubleshooting

### Issue: Payment Status Still Shows "Unpaid"
**Possible Causes:**
1. Backend UPI verification failed
2. Frontend data refresh failed
3. Data structure mismatch

**Solutions:**
1. Check backend console for UPI verification logs
2. Check frontend console for refresh logs
3. Click the "Refresh" button in admin panel
4. Wait for auto-refresh (30 seconds)

### Issue: No Console Logs
**Possible Causes:**
1. JavaScript errors preventing execution
2. Console logging disabled
3. Component not mounting properly

**Solutions:**
1. Check for JavaScript errors in console
2. Ensure console logging is enabled
3. Refresh the page and check again

### Issue: Backend Errors
**Possible Causes:**
1. MongoDB connection issues
2. Missing models or dependencies
3. Authentication middleware errors

**Solutions:**
1. Check MongoDB connection
2. Verify all models are imported
3. Check authentication token validity

## Test Data

### Valid UPI IDs for Testing
- `test@upi`
- `demo@icici`
- `sample@hdfc`
- `user@bank`

### Expected Payment Status Flow
1. **Initial**: `❌ Unpaid`
2. **After UPI Payment**: `✅ Paid (UPI)`
3. **Status**: `confirmed`
4. **Payment Method**: `upi`
5. **Updated Time**: Current timestamp

## Manual Database Check

If you want to verify the data directly in MongoDB:

```bash
# Connect to MongoDB
mongosh rental_management

# Check bookings collection
db.bookings.find().pretty()

# Look for your test booking and verify:
# - paymentStatus: "paid"
# - status: "confirmed"
# - paymentInfo.paymentMethod: "upi"
# - paymentInfo.paidAt: [timestamp]
```

## Next Steps

After successful testing:
1. Remove debug console logs if not needed
2. Adjust auto-refresh interval if needed (currently 30 seconds)
3. Test with different payment methods
4. Verify admin panel functionality (approve, cancel, extend)

## Support

If you continue to experience issues:
1. Check all console logs (frontend and backend)
2. Verify MongoDB data directly
3. Test with a fresh booking
4. Check network requests in browser DevTools
