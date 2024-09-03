
const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings } = require('../Controllers/BookingController');

router.post('/', createBooking);
router.get('/', getUserBookings);

module.exports = router;
