
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

// Models
const User = require('./Models/User.js');
const Place = require('./Models/Place.js');  // Adjusted name based on the routes
const Booking = require('./Models/Booking.js');

// Constants
const app = express();
const PORT = process.env.PORT || 5000;
const bcryptSalt = 10;
const jwtSecret = process.env.JWT_SECRET;



// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to verify JWT and extract user data
function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token; 
    console.log(token )
    if (!token) {
      return reject(new Error('No token provided'));
    }

    jwt.verify(token, jwtSecret, (err, userData) => {
      if (err) return reject(err);
      resolve(userData);
    });
  });
}
// Route Handlers
app.get('/', (req, res) => res.json("test ok"));

// Register user
app.post('/register', async (req,res) => {
 
  const {name,email,password} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }

});

app.post('/login', async (req,res) => {
 
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});
// Get profile
app.get('/profile', async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log('Cookies:', req.cookies); 
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const userData = await jwt.verify(token, jwtSecret);
    const user = await User.findById(userData.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Logout user
app.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' }).json(true);
});

// Upload image by link
app.post('/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = Date.now() + '.jpg';
  try {
    await imageDownloader.image({ url: link, dest: path.join(__dirname, 'uploads', newName) });
    res.json(newName);
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ message: 'Failed to download image', details: error.message });
  }
});

// Upload multiple images
app.post('/upload', upload.array('photos', 100), (req, res) => {
  if (req.files) {
    res.json(req.files.map(file => file.filename));
  } else {
    res.status(400).json({ message: 'No files were uploaded.' });
  }
});

// Create a new place
app.post('/places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const { title, address, addedPhotos, description, price, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;

    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });

    res.status(201).json(placeDoc);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all places
app.get('/places', async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a user's places
app.get('/user-places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const places = await Place.find({ owner: userData.id });
    res.status(200).json(places);
  } catch (error) {
    console.error('Error fetching user places:', error.message);
    res.status(401).json({ message: 'Unauthorized access: ' + error.message });
  }
});

// Get a specific place by ID
app.get('/places/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    place ? res.status(200).json(place) : res.status(404).json({ message: 'Place not found' });
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a place
app.put('/places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.status(200).json('Place updated successfully');
    } else {
      res.status(403).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a booking
app.post('/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

    const bookingDoc = await Booking.create({
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      user: userData.id,
    });

    res.status(201).json(bookingDoc);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user bookings
app.get('/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const bookings = await Booking.find({ user: userData.id }).populate('place');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));