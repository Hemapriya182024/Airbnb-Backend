const express = require('express');
const AuthController = require('../Controllers/AuthController');
const AuthMiddleware =require('../Middleware/Authmiddleware');


const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', AuthMiddleware, AuthController.profile);
router.post('/logout', AuthController.logout);

module.exports = router;
