const Model3D = require('../models/model3d');
const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/models', async (req, res) => {
  try {
    const {
      vaseMode,
      fuzzyMode,
      filament_type,
      size_type,
      sortBy,
      sortOrder = 'asc'
    } = req.query;

    let query = { userId: req.userId };

    if (vaseMode !== undefined && vaseMode !== '' && vaseMode !== 'false') {
      query['printMode.vaseMode'] = true;
    }
    
    if (fuzzyMode !== undefined && fuzzyMode !== '' && fuzzyMode !== 'false') {
      query['printMode.fuzzyMode'] = true;
    }

    if (size_type) {
      query['size.type'] = size_type;
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    let models = await Model3D.find(query)
      .populate('filamentVariants.filament')
      .sort(sort);

    if (filament_type) {
      models = models.filter(m =>
        Array.isArray(m.filamentVariants) &&
        m.filamentVariants.some(fv => fv.filament && fv.filament.type === filament_type)
      );
    }

    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/models', async (req, res) => {
  try {
    const model = new Model3D({ ...req.body, userId: req.userId });
    const savedModel = await model.save();
    const populated = await savedModel.populate('filamentVariants.filament');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/models/:id', async (req, res) => {
  try {
    const model = await Model3D.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('filamentVariants.filament');
    
    if (!model) {
      return res.status(404).json({ message: 'Model nie znaleziony' });
    }
    res.json(model);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/models/:id', async (req, res) => {
  try {
    const model = await Model3D.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!model) {
      return res.status(404).json({ message: 'Model nie znaleziony' });
    }
    res.json({ message: 'Model usunięty' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/filter-options', async (req, res) => {
  try {
    const categories = await Model3D.distinct('category', { userId: req.userId });
    
    const models = await Model3D.find({ userId: req.userId }, 'filamentVariants')
      .populate('filamentVariants.filament', 'type');
    const filamentTypesSet = new Set();
    models.forEach(m => {
      if (Array.isArray(m.filamentVariants)) {
        m.filamentVariants.forEach(fv => {
          if (fv.filament && fv.filament.type) {
            filamentTypesSet.add(fv.filament.type);
          }
        });
      }
    });

    res.json({
      filamentTypes: Array.from(filamentTypesSet).filter(Boolean),
      sizeTypes: [],
      categories: categories.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
