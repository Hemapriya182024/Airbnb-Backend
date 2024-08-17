const express = require('express');
const BookingController = require('../Controllers/BookingController');


const router = express.Router();

router.post('/', BookingController.createBooking);
router.get('/',  BookingController.getAllBookings);

module.exports = router;
