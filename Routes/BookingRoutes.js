const express = require('express');
const BookingController = require('../Controllers/BookingController');
const AuthMiddleware=require('../Middleware/AuthMiddleware')



const router = express.Router();

router.post('/bookings',AuthMiddleware, BookingController.createBooking);
router.get('/bookings', AuthMiddleware, BookingController.getAllBookings);

module.exports = router;
