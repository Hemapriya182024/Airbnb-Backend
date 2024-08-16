const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../Utils/JwtUtils');

const AuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    req.userData = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = AuthMiddleware;