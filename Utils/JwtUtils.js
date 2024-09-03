// const jwt = require('jsonwebtoken');

// const jwtSecret = process.env.JWT_SECRET || 'hello';

// const createToken = (userDoc) => {
//   return jwt.sign({ id: userDoc._id }, jwtSecret);
// };

// module.exports = { createToken, jwtSecret }; const jwt = require('jsonwebtoken');

// const jwtSecret = process.env.JWT_SECRET || 'hello';

// const createToken = (userDoc) => {
//   const token = jwt.sign({ id: userDoc._id }, jwtSecret);
//   return `Bearer ${token}`;  // Add the Bearer prefix here
// };

// module.exports = { createToken, jwtSecret };







const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config()

const generateToken = async (userDoc) => {
  try {
    const token =  jwt.sign({ id: userDoc._id },process.env.JWT_SECRET , {
      expiresIn: "1h",
    });
 ; // Log the token to verify
    return token;
  } catch (error) {
    console.error("Token generation failed:", error);
    throw error;
  }
};




module.exports = generateToken;