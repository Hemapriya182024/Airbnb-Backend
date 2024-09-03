const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');

const placeRoutes = require('./Routes/PlaceRoutes');

const errorHandler = require('./Middleware/ErrorHandler');
const generateToken = require('./Utils/JwtUtils');
const User = require("./Models/User");
const Booking = require('./Models/Booking')
const verifyToken = require('./Middleware/verifyToken.js');


const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin:'https://mern-project-liart.vercel.app',
}));
PORT=process.env.PORT
mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
 
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
});
app.get('/', (req, res) => {
  res.status(200).json( {message:"server is healthy"});
});

app.use('/api/places', placeRoutes);

app.use(errorHandler);


// register api
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

// login api

app.post("/login", async (req, res) => {

  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc && bcrypt.compareSync(password, userDoc.password)) {
    const token = await  generateToken(userDoc);
    console.log(token);
    res.status(200).json({token,userDoc});
  } else {
    res.status(422).json("Invalid credentials");
  }
});



app.get("/profile", async (req, res) => {

  const token =  req.headers.authorization?.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    const userDoc = await User.findById(decode.id)
    if (!userDoc) {
      res.status(404).json("User not found");
    } else {
       res.status(200).json({userDoc})
    }
  } catch (error) {
    res.status(500).json({message:"error msg form catch block"})
  }
 
});

// logout api
let tokenStore = [];

app.post("/logout", (req, res) => {
const token = req.headers.authorization?.split(" ")[1];

if (!token) {
  return res.status(401).json({ message: "Token required" });
}

// Invalidate the token (e.g., by removing it from the token store)
tokenStore = tokenStore.filter((storedToken) => storedToken !== token);

return res.status(200).json({ message: "Logout successful" });
});



app.post("/bookings", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
   const decode = jwt.verify(token, process.env.JWT_SECRET);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
 await Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: decode.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get('/bookings', async(req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(await Booking.find({ user: decode.id }).populate('place'));
  } catch (error) {
    res.status(500).json({message:"error msg from booking get api "})
  }
  
})

// Cancel Booking API
app.delete('/bookings/:id', verifyToken, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.userId; // Get userId from token verification middleware

  try {
    const booking = await Booking.findOneAndDelete({ _id: bookingId, user: userId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or you are not authorized to cancel this booking' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen( PORT,() => {
  console.log('Server is running on port ',PORT);
});
