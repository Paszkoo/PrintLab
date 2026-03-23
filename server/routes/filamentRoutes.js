const Filament = require('../models/filament');
const Model3D = require('../models/model3d');
const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/filaments', async (req, res) => {
  try {
    const {
      type,
      prod,
      color,
      priceMin,
      priceMax,
      sortBy,
      sortOrder = 'asc'
    } = req.query;

    let query = { userId: req.userId };

    if (type) query.type = type;
    if (prod) query.prod = prod;
    if (color) query.colors = color;
    if (priceMin) query.priceForKg = { ...query.priceForKg, $gte: Number(priceMin) };
    if (priceMax) query.priceForKg = { ...query.priceForKg, $lte: Number(priceMax) };

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const filaments = await Filament.find(query).sort(sort);
    res.json(filaments);
  } catch (error) {
    console.error('Error fetching filaments:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/filaments', async (req, res) => {
  try {
    const filament = new Filament({ ...req.body, userId: req.userId });
    const savedFilament = await filament.save();
    res.status(201).json(savedFilament);
  } catch (error) {
    console.error('Error creating filament:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/filaments/:id', async (req, res) => {
  try {
    const filament = await Filament.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!filament) {
      return res.status(404).json({ message: 'Filament nie znaleziony' });
    }
    res.json(filament);
  } catch (error) {
    console.error('Error updating filament:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/filaments/:id', async (req, res) => {
  try {
    const filament = await Filament.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!filament) {
      return res.status(404).json({ message: 'Filament nie znaleziony' });
    }

    await Model3D.updateMany(
      { userId: req.userId, 'filamentVariants.filament': req.params.id },
      { $pull: { filamentVariants: { filament: req.params.id } } }
    );

    res.json({ message: 'Filament usunięty' });
  } catch (error) {
    console.error('Error deleting filament:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/filaments/filter-options', async (req, res) => {
  try {
    const types = await Filament.distinct('type', { userId: req.userId });
    const producers = await Filament.distinct('prod', { userId: req.userId });
    
    const allFilaments = await Filament.find({ userId: req.userId }, 'colors');
    const colorsSet = new Set();
    allFilaments.forEach(filament => {
      if (filament.colors && Array.isArray(filament.colors)) {
        filament.colors.forEach(color => colorsSet.add(color));
      }
    });
    const colors = Array.from(colorsSet).sort();
    
    res.json({
      types: types.filter(Boolean),
      producers: producers.filter(Boolean),
      colors: colors.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching filament filter options:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
