const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  };
  
  module.exports = errorHandler;
  