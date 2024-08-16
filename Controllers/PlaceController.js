const Place = require('../Models/Place');
const { downloadImage } = require('../Utils/ImageUtils');

const PlaceController = {
  createPlace: async (req, res) => {
    try {
      const { id } = req.userData;
      const { title, address, addedPhotos, description, price, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;

      const placeDoc = await Place.create({
        owner: id,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });

      res.status(201).json(placeDoc);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAllPlaces: async (req, res) => {
    try {
      const places = await Place.find();
      res.status(200).json(places);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getUserPlaces: async (req, res) => {
    try {
      const { id } = req.userData;
      const places = await Place.find({ owner: id });
      res.status(200).json(places);
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized access: ' + error.message });
    }
  },

  getPlaceById: async (req, res) => {
    try {
      const place = await Place.findById(req.params.id);
      place ? res.status(200).json(place) : res.status(404).json({ message: 'Place not found' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updatePlace: async (req, res) => {
    try {
      const { id: userId } = req.userData;
      const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

      const placeDoc = await Place.findById(id);
      if (userId === placeDoc.owner.toString()) {
        placeDoc.set({
          title,
          address,
          photos: addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        });
        await placeDoc.save();
        res.status(200).json('Place updated successfully');
      } else {
        res.status(403).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  uploadByLink: async (req, res) => {
    const { link } = req.body;
    const newName = Date.now() + '.jpg';
    try {
      await downloadImage(link, newName);
      res.json(newName);
    } catch (error) {
      res.status(500).json({ message: 'Failed to download image', details: error.message });
    }
  },

  uploadMultipleImages: (req, res) => {
    if (req.files) {
      res.json(req.files.map(file => file.filename));
    } else {
      res.status(400).json({ message: 'No files were uploaded.' });
    }
  },
};

module.exports = PlaceController;
