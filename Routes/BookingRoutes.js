const express = require('express');
const BookingController = require('../Controllers/BookingController');
const AuthMiddleware = require('../Middleware/Authmiddleware');

const router = express.Router();

router.post('/', AuthMiddleware, BookingController.createBooking);
router.get('/', AuthMiddleware, BookingController.getAllBookings);

module.exports = router;
