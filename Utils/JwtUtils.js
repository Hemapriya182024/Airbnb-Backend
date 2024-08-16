const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'hello';

const createToken = (userDoc) => {
  return jwt.sign({ id: userDoc._id }, jwtSecret);
};

module.exports = { createToken, jwtSecret };
