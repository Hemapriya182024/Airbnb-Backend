const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const generateToken = require('../Utils/JwtUtils');

const jwt = require('jsonwebtoken');


let tokenStore = []; // In-memory token store for simplicity

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userDoc = await User.findOne({ email });
    if (userDoc && bcrypt.compareSync(password, userDoc.password)) {
      const token = generateToken(userDoc);
      tokenStore.push(token); // Store token (for demonstration purposes)
      res.status(200).json({ token, userDoc });
    } else {
      res.status(422).json("Invalid credentials");
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const profile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await User.findById(decode.id);
    if (!userDoc) {
      res.status(404).json("User not found");
    } else {
      res.status(200).json({ userDoc });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json("User already exists");
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const user = await User.create({ email, password: hashedPassword });

    // Generate token
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  // Invalidate the token (e.g., by removing it from the token store)
  tokenStore = tokenStore.filter((storedToken) => storedToken !== token);
  res.status(200).json({ message: "Logout successful" });
};

module.exports = { login, profile, logout,register};