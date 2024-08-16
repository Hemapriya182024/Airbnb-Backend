const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const { createToken } = require('../Utils/JwtUtils');

const AuthController = {
  register: async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const userDoc = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
      });
      res.json(userDoc);
    } catch (e) {
      res.status(422).json(e);
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });

    if (userDoc && bcrypt.compareSync(password, userDoc.password)) {
      const token = createToken(userDoc);
      res.cookie('token', token).json(userDoc);
    } else {
      res.status(422).json('Invalid credentials');
    }
  },

  profile: async (req, res) => {
    try {
      const { id } = req.userData;
      const user = await User.findById(id);
      if (user) {
        res.json({ name: user.name, email: user.email, _id: user._id });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

  logout: (req, res) => {
    res.cookie('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' }).json(true);
  },
};

module.exports = AuthController;
