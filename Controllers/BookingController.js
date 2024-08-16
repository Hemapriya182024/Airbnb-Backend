const Booking = require('../Models/Booking');

const BookingController = {
  createBooking: async (req, res) => {
    const { checkIn, checkOut, numberOfGuests, name, phone, place, price } = req.body;

    try {
      const booking = new Booking({
        checkIn, checkOut, numberOfGuests, name, phone, place, price
      });
      await booking.save();
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Booking failed. Please try again." });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.find().populate('place');
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = BookingController;
