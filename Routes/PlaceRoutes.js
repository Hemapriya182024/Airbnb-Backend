const express = require('express');
const PlaceController = require('../Controllers/PlaceController');
const AuthMiddleware = require('../Middleware/AuthMiddleware.js');
const upload = require('../Middleware/MulterMiddleware');

const router = express.Router();

router.post('/', AuthMiddleware, PlaceController.createPlace);
router.get('/', PlaceController.getAllPlaces);
router.get('/user', AuthMiddleware, PlaceController.getUserPlaces);
router.get('/:id', PlaceController.getPlaceById);
router.put('/', AuthMiddleware, PlaceController.updatePlace);
router.post('/upload-link', AuthMiddleware, PlaceController.uploadByLink);
router.post('/upload-images', AuthMiddleware, upload.array('photos', 10), PlaceController.uploadMultipleImages);

module.exports = router;
