const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routes/AuthRoutes');
const placeRoutes = require('./Routes/PlaceRoutes');
const bookingRoutes = require('./Routes/BookingRoutes');
const errorHandler = require('./Middleware/ErrorHandler');



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
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api', bookingRoutes);
app.use('/Uploads',express.static(__dirname+'/Uploads'))
app.use(errorHandler);


app.listen( PORT,() => {
  console.log('Server is running on port ',PORT);
});
