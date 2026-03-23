const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Model3DSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  printTimeHours: { type: Number, required: true },
  printTimeMinutes: { type: Number, required: true },
  weightGrams: { type: Number, required: true, min: 0, default: 0 },
  margin: { type: Number, required: true, min: 0, max: 100, default: 0 },
  packageSize: { type: String, enum: ['mini', 'small', 'medium', 'big'], required: true, default: 'medium' },
  filamentVariants: [{
    filament: { type: mongoose.Schema.Types.ObjectId, ref: 'Filament', required: true },
    colorVariants: [{
      color: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1, min: 0 }
    }]
  }],
  infill: {
    infillRate: { type: Number, min: 0, max: 100, default: 20 },
    infillType: { type: String, default: "siatka" },
    vaseWallsCount: { type: Number, default: 1 },
    vaseBaseLayersCount: { type: Number, default: 3 }
  },
  size: {
    sizeCorrectionCentimeters: { type: Number, default: 0 }
  },
  supports: {
    enable: { type: Boolean, default: false },
    angle: { type: Number, min: 0, max: 90, default: 30 },
    type: { type: String, enum: ['tree', 'normal'], default: 'normal' }
  },
  printMode: {
    fuzzyMode: { type: Boolean, default: false },
    vaseMode: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'models',
  versionKey: false,
  _id: true
});

const Model3D = mongoose.model('Model3D', Model3DSchema, 'models');

module.exports = Model3D;
